/** Public shape of one SEC page. No credentials, no raw body. */

export type SecCell = string | number | null;

export type SecSlice = {
  path: string;
  status: number;
  count: number;
  more: boolean;
  columns: string[];
  rows: SecCell[][];
  note: string;
};

export type SecLiveBook = {
  live: boolean;
  source: "SEC Open Data";
  fetchedAt: string | null;
  reason: string;
  companies: SecSlice;
  funds: SecSlice;
  fees: SecSlice;
  performance: SecSlice;
};

export const SEC_COLUMN_LABELS: Record<string, string> = {
  unique_id: "SEC id",
  comp_name_en: "Company",
  comp_name_th: "Company (Thai)",
  proj_id: "Project",
  proj_name_en: "Fund",
  proj_name_th: "Fund (Thai)",
  proj_abbr_name: "Short name",
  fund_status: "Status",
  fund_class_name: "Class",
  policy_desc: "Policy",
  management_style: "Style",
  fee_type_desc: "Fee type",
  rate: "Published rate",
  rate_unit: "Unit",
  actual_value: "Actual value",
  performance_type: "Performance type",
  reference_period: "Reference period",
  performance_value: "Published value",
  period: "Period",
  last_upd_date: "Updated",
};

const PREFERRED = [
  "comp_name_en",
  "comp_name_th",
  "proj_name_en",
  "proj_name_th",
  "proj_abbr_name",
  "fund_class_name",
  "fee_type_desc",
  "rate",
  "rate_unit",
  "actual_value",
  "performance_type",
  "reference_period",
  "performance_value",
  "period",
  "fund_status",
  "policy_desc",
  "unique_id",
  "proj_id",
  "last_upd_date",
];

const MAX_ROWS = 40;
const MAX_TEXT = 180;

export function columnLabel(key: string) {
  return SEC_COLUMN_LABELS[key] ?? key;
}

export function emptySlice(path = ""): SecSlice {
  return { path, status: 0, count: 0, more: false, columns: [], rows: [], note: "" };
}

function cell(value: unknown): SecCell | undefined {
  if (value == null) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string") {
    const text = value.trim();
    if (!text) return null;
    return text.length > MAX_TEXT ? `${text.slice(0, MAX_TEXT)}…` : text;
  }
  return undefined;
}

function keysOf(row: unknown) {
  if (!row || typeof row !== "object" || Array.isArray(row)) return [];
  return Object.keys(row as Record<string, unknown>).filter((key) => cell((row as Record<string, unknown>)[key]) !== undefined);
}

export function pageFromBody(body: unknown): { rows: unknown[]; more: boolean; topKeys: string[] } {
  if (Array.isArray(body)) return { rows: body, more: false, topKeys: [] };
  if (!body || typeof body !== "object") return { rows: [], more: false, topKeys: [] };
  const record = body as Record<string, unknown>;
  const topKeys = Object.keys(record);
  const items = Array.isArray(record.items) ? record.items : Array.isArray(record.data) ? record.data : null;
  const cursor = record.next_cursor;
  const more = typeof cursor === "string" && cursor.trim().length > 0;
  if (items) return { rows: items, more, topKeys };
  return { rows: [], more, topKeys };
}

export function sliceFromBody(path: string, status: number, body: unknown): SecSlice {
  const page = pageFromBody(body);
  const source = page.rows.slice(0, MAX_ROWS);
  const columnSet = new Set<string>();
  source.forEach((row) => keysOf(row).forEach((key) => columnSet.add(key)));
  const columns = [
    ...PREFERRED.filter((key) => columnSet.has(key)),
    ...[...columnSet].filter((key) => !PREFERRED.includes(key)),
  ];
  const rows = source.map((row) => {
    const record = row && typeof row === "object" ? (row as Record<string, unknown>) : {};
    return columns.map((key) => cell(record[key]) ?? null);
  });
  let note = "";
  if (rows.length === 0 && page.topKeys.length > 0 && !page.topKeys.includes("items") && !page.topKeys.includes("data")) {
    note = `SEC returned keys this view does not read: ${page.topKeys.slice(0, 8).join(", ")}.`;
  } else if (page.more) {
    note = "First page only. More rows are on the SEC feed.";
  }
  return {
    path,
    status,
    count: rows.length,
    more: page.more,
    columns,
    rows,
    note,
  };
}

function readSlice(value: unknown): SecSlice {
  if (!value || typeof value !== "object") return emptySlice();
  const raw = value as Record<string, unknown>;
  const columns = Array.isArray(raw.columns) ? raw.columns.filter((item): item is string => typeof item === "string").slice(0, 24) : [];
  const rows = Array.isArray(raw.rows)
    ? raw.rows.slice(0, MAX_ROWS).map((row) => {
        const cells = Array.isArray(row) ? row : [];
        return columns.map((_, index) => {
          const item = cells[index];
          if (typeof item === "number" && Number.isFinite(item)) return item;
          if (typeof item === "string") return item.slice(0, MAX_TEXT + 1);
          return null;
        });
      })
    : [];
  return {
    path: typeof raw.path === "string" ? raw.path : "",
    status: typeof raw.status === "number" ? raw.status : 0,
    count: rows.length,
    more: raw.more === true,
    columns,
    rows,
    note: typeof raw.note === "string" ? raw.note.slice(0, 240) : "",
  };
}

export function parseSecBook(value: unknown): SecLiveBook | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  return {
    live: raw.live === true,
    source: "SEC Open Data",
    fetchedAt: typeof raw.fetchedAt === "string" ? raw.fetchedAt : null,
    reason: typeof raw.reason === "string" ? raw.reason.slice(0, 400) : "",
    companies: readSlice(raw.companies),
    funds: readSlice(raw.funds),
    fees: readSlice(raw.fees),
    performance: readSlice(raw.performance),
  };
}

export function formatSecCell(value: SecCell) {
  if (value == null || value === "") return "—";
  if (typeof value === "number") return value.toLocaleString("en-US", { maximumFractionDigits: 4 });
  return value;
}
