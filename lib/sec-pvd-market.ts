/**
 * Published SEC provident-fund statistics.
 * These CSV files are the capital-market reports, not /v1/pvd/fund-fee.
 * They have funds, members, employers, assets, and assets by company.
 * They do not have an employer’s negotiated fee.
 */

const FILES = {
  market: "https://dividend.sec.or.th/stat-report/PVD_TH.csv",
  companies: "https://dividend.sec.or.th/stat-report/PVD_NAV_TH.csv",
  assets: "https://dividend.sec.or.th/stat-report/PVD_PORT_TH.csv",
};

const TTL_MS = 60 * 60 * 1000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const ASSET_BUCKETS: { source: string; label: string }[] = [
  { source: "หลักทรัพย์จดทะเบียน", label: "Listed securities" },
  { source: "หลักทรัพย์/ทรัพย์สินนอกตลาด", label: "Unlisted domestic assets" },
  { source: "หลักทรัพย์/ทรัพย์สินต่างประเทศ", label: "Foreign assets" },
  { source: "สินทรัพย์อื่น", label: "Other assets" },
];

export type PvdCompany = {
  name: string;
  label: string;
  funds: number | null;
  navMillion: number | null;
};

export type PvdAsset = {
  label: string;
  navMillion: number;
};

export type PvdMarket = {
  live: boolean;
  reason: string;
  asOf: string;
  period: string;
  funds: number | null;
  members: number | null;
  employers: number | null;
  navMillion: number | null;
  companies: PvdCompany[];
  assets: PvdAsset[];
  liabilitiesMillion: number | null;
  source: string;
};

let cache: { at: number; market: PvdMarket } | null = null;

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const src = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else quoted = false;
      } else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(cell.trim());
      cell = "";
    } else if (ch === "\n") {
      row.push(cell.trim());
      rows.push(row);
      row = [];
      cell = "";
    } else if (ch !== "\r") cell += ch;
  }
  if (cell.length || row.length) {
    row.push(cell.trim());
    rows.push(row);
  }
  return rows.filter((item) => item.some((value) => value));
}

function amount(value: string | undefined) {
  if (!value) return null;
  const n = Number(value.replace(/,/g, "").replace(/"/g, ""));
  return Number.isFinite(n) ? n : null;
}

function quarterOf(value: string | undefined) {
  const n = Number(String(value ?? "").replace(/\D/g, ""));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function yearOf(value: string | undefined) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function periodLabel(year: number, quarter: number) {
  if (!year || !quarter) return "";
  return `Quarter ${quarter}, ${year - 543}`;
}

function asOfLabel(raw: string) {
  const [day, month, year] = raw.split("/").map(Number);
  if (!day || !month || !year || month < 1 || month > 12) return raw;
  return `${day} ${MONTHS[month - 1]} ${year - 543}`;
}

function shortCompany(name: string) {
  return name
    .replace(/^บริษัทหลักทรัพย์จัดการกองทุนรวม\s*/, "")
    .replace(/^บริษัทหลักทรัพย์จัดการกองทุน\s*/, "")
    .replace(/\s*จำกัด \(มหาชน\)\s*$/, "")
    .replace(/\s*จำกัด\s*$/, "")
    .replace(/^บริษัท\s+/, "")
    .replace(/\s+/g, " ")
    .trim() || name;
}

async function pull(url: string) {
  const response = await fetch(url, {
    headers: { "User-Agent": "EPF24" },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(String(response.status));
  const rows = parseCsv(await response.text());
  return rows.slice(1);
}

function empty(reason: string): PvdMarket {
  return {
    live: false,
    reason,
    asOf: "",
    period: "",
    funds: null,
    members: null,
    employers: null,
    navMillion: null,
    companies: [],
    assets: [],
    liabilitiesMillion: null,
    source: "SEC capital-market statistics. These files are provident-fund counts and assets, not a fee schedule.",
  };
}

export async function loadPvdMarket(): Promise<PvdMarket> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.market;
  let marketRows: string[][];
  let companyRows: string[][];
  let assetRows: string[][];
  try {
    [marketRows, companyRows, assetRows] = await Promise.all([
      pull(FILES.market),
      pull(FILES.companies),
      pull(FILES.assets),
    ]);
  } catch {
    return empty("The SEC provident-fund statistics file did not load. The negotiated fee below is still the sample contract, not a published fee.");
  }

  const latest = marketRows.reduce<{ year: number; quarter: number; asOf: string } | null>((best, row) => {
    const year = yearOf(row[2]);
    const quarter = quarterOf(row[3]);
    if (!year || !quarter) return best;
    if (!best || year > best.year || (year === best.year && quarter > best.quarter)) {
      return { year, quarter, asOf: row[0] || "" };
    }
    return best;
  }, null);
  if (!latest) return empty("The SEC provident-fund statistics file had no quarter to read.");

  const slice = marketRows.filter((row) => yearOf(row[2]) === latest.year && quarterOf(row[3]) === latest.quarter);
  const byType = (label: string) => amount(slice.find((row) => row[1] === label)?.[4] ?? "");
  const companies = new Map<string, PvdCompany>();
  companyRows
    .filter((row) => yearOf(row[3]) === latest.year && quarterOf(row[4]) === latest.quarter)
    .forEach((row) => {
      const name = row[1] || "";
      if (!name) return;
      const current = companies.get(name) || { name, label: shortCompany(name), funds: null, navMillion: null };
      if (row[2]?.includes("กองทุน")) current.funds = amount(row[5]);
      else current.navMillion = amount(row[5]);
      companies.set(name, current);
    });
  const ranked = [...companies.values()]
    .filter((item) => (item.navMillion ?? 0) > 0 || (item.funds ?? 0) > 0)
    .sort((a, b) => (b.navMillion ?? 0) - (a.navMillion ?? 0));

  const assets: PvdAsset[] = [];
  let liabilitiesMillion: number | null = null;
  assetRows
    .filter((row) => yearOf(row[3]) === latest.year && quarterOf(row[4]) === latest.quarter && (row[2] === "-" || row[2] === ""))
    .forEach((row) => {
      const bucket = ASSET_BUCKETS.find((item) => item.source === row[1]);
      const value = amount(row[5]);
      if (bucket && value != null) assets.push({ label: bucket.label, navMillion: value });
      if (row[1] === "หนี้สินอื่น" && value != null) liabilitiesMillion = value;
    });

  const market: PvdMarket = {
    live: true,
    reason: "",
    asOf: asOfLabel(latest.asOf),
    period: periodLabel(latest.year, latest.quarter),
    funds: byType("จำนวนกองทุน"),
    members: byType("จำนวนสมาชิก"),
    employers: byType("จำนวนนายจ้าง"),
    navMillion: byType("มูลค่าทรัพย์สินสุทธิ (ล้านบาท)"),
    companies: ranked,
    assets,
    liabilitiesMillion,
    source: "SEC published provident-fund statistics, Quarter file as of the date above. Counts and assets only. Employer negotiated fees are not in this file.",
  };
  cache = { at: Date.now(), market };
  return market;
}
