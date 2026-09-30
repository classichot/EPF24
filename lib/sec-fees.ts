import { pageFromBody } from "@/lib/sec-book";
import { buildFeeBoard, feeTypeLabel, policyGroup, type FeeBoard, type FeeObservation } from "@/lib/sec-fee-board";

const MAX_PAGES = 5;
const TTL_MS = 10 * 60 * 1000;

let cache: { at: number; board: FeeBoard } | null = null;

function credentials() {
  const base = process.env.SEC_OPENDATA_BASE_URL?.trim().replace(/\/$/, "") || "";
  const header = process.env.SEC_OPENDATA_KEY_HEADER?.trim() || "";
  const key = process.env.SEC_OPENDATA_SUBSCRIPTION_KEY?.trim() || "";
  return { base, header, key, ready: Boolean(base && header && key) };
}

function text(row: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function num(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return null;
}

function rowsOf(body: unknown) {
  return pageFromBody(body).rows.filter((row): row is Record<string, unknown> => !!row && typeof row === "object" && !Array.isArray(row));
}

function cursorOf(body: unknown) {
  if (!body || typeof body !== "object") return "";
  const cursor = (body as Record<string, unknown>).next_cursor;
  return typeof cursor === "string" ? cursor.trim() : "";
}

async function pull(path: string) {
  const { base, header, key } = credentials();
  const rows: Record<string, unknown>[] = [];
  let status = 0;
  let cursor = "";
  let truncated = false;
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const join = cursor ? `${path.includes("?") ? "&" : "?"}next_cursor=${encodeURIComponent(cursor)}` : "";
    const url = `${base}${path}${join}`;
    const response = await fetch(url, {
      headers: { [header]: key, Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    status = response.status;
    if (!response.ok) return rows.length ? { status: 200, rows, truncated: true } : { status, rows, truncated: false };
    const body: unknown = await response.json();
    rows.push(...rowsOf(body));
    cursor = cursorOf(body);
    if (!cursor) return { status, rows, truncated: false };
  }
  truncated = Boolean(cursor);
  return { status, rows, truncated };
}

function empty(reason: string, attempts: { path: string; status: number }[]): FeeBoard {
  return {
    live: false,
    lane: "",
    fetchedAt: null,
    reason,
    read: { fees: 0, funds: 0, companies: 0, matched: 0, truncated: false },
    attempts,
    focus: "",
    types: [],
    cuts: [],
    matrix: [],
  };
}

function charged(row: Record<string, unknown>) {
  const actual = num(row.actual_value);
  if (actual != null) return actual;
  return num(row.rate);
}

export async function loadFeeBoard(): Promise<FeeBoard> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.board;
  const creds = credentials();
  if (!creds.ready) {
    return empty("The SEC key is not on this server. Fee analysis is provident funds only and is not showing mutual funds or the sample book.", []);
  }

  const attempts: { path: string; status: number }[] = [];
  const feesPath = "/v1/pvd/fund-fee?page_size=100";
  const companiesPath = "/v1/pvd/general-info/list?page_size=100";
  const fundsPath = "/v1/pvd/general-info/fund-info?page_size=100";
  const lane = "SEC provident-fund fees only. Mutual-fund factsheets are not included. These published fees are not an employer’s negotiated contract.";
  const fees = await pull(feesPath);
  attempts.push({ path: feesPath.split("?")[0], status: fees.status });
  if (!(fees.status === 200 && fees.rows.length > 0)) {
    return empty("Fee analysis is provident funds only. The SEC provident-fund fee file did not return rows, so this page has no chart. Mutual-fund factsheets are not used.", attempts);
  }

  const [companies, funds] = await Promise.all([
    pull(companiesPath).catch(() => ({ status: 0, rows: [] as Record<string, unknown>[], truncated: false })),
    pull(fundsPath).catch(() => ({ status: 0, rows: [] as Record<string, unknown>[], truncated: false })),
  ]);
  attempts.push({ path: companiesPath.split("?")[0], status: companies.status });
  attempts.push({ path: fundsPath.split("?")[0], status: funds.status });

  const amcName = new Map<string, string>();
  companies.rows.forEach((row) => {
    const id = text(row, ["unique_id"]);
    const name = text(row, ["comp_name_en", "comp_name_th"]);
    if (id && name) amcName.set(id, name);
  });
  const fundMeta = new Map<string, { amc: string; group: string }>();
  funds.rows.forEach((row) => {
    const id = text(row, ["proj_id"]);
    if (!id || fundMeta.has(id)) return;
    const companyId = text(row, ["unique_id"]);
    const amc = text(row, ["comp_name_en", "comp_name_th"]) || amcName.get(companyId) || "";
    const group = policyGroup(text(row, ["policy_desc", "fund_class_name", "proj_name_en", "proj_name_th"]));
    fundMeta.set(id, { amc, group });
  });

  const observations: FeeObservation[] = fees.rows.map((row) => {
    const projId = text(row, ["proj_id"]);
    const meta = fundMeta.get(projId);
    const ownAmc = text(row, ["comp_name_en", "comp_name_th"]);
    const ownGroup = policyGroup(text(row, ["policy_desc", "fund_class_name"]));
    return {
      projId,
      amc: ownAmc || meta?.amc || "",
      group: ownGroup || meta?.group || "",
      type: feeTypeLabel(text(row, ["fee_type_desc", "fee_type"])),
      value: charged(row),
    };
  });

  const board = buildFeeBoard(observations, {
    lane,
    truncated: fees.truncated || companies.truncated || funds.truncated,
    attempts,
    companies: amcName.size,
  });
  if (board.live) cache = { at: Date.now(), board };
  return board;
}
