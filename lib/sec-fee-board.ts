/** Aggregates published SEC fee rows. No credentials and no sample-book figures. */

export type FeePoint = { label: string; median: number | null; count: number };

export type FeeCut = { type: string; byAmc: FeePoint[]; byGroup: FeePoint[] };

export type FeeBoard = {
  live: boolean;
  lane: string;
  fetchedAt: string | null;
  reason: string;
  read: { fees: number; funds: number; companies: number; matched: number; truncated: boolean };
  attempts: { path: string; status: number }[];
  focus: string;
  types: FeePoint[];
  cuts: FeeCut[];
  matrix: { group: string; cells: { type: string; median: number | null; count: number }[] }[];
};

export type FeeObservation = {
  projId: string;
  amc: string;
  group: string;
  type: string;
  value: number | null;
};

const TYPE_RULES: { label: string; test: RegExp }[] = [
  { label: "Total expense", test: /total expense|ค่าใช้จ่ายรวม|ค่าใช้จ่ายทั้งหมด|all-in/i },
  { label: "Management", test: /management|ค่าธรรมเนียมการจัดการ|ค่าจัดการ/i },
  { label: "Trustee", test: /trustee|ผู้ดูแลผลประโยชน์/i },
  { label: "Registrar", test: /registrar|นายทะเบียน/i },
  { label: "Front-end", test: /front-?end|ค่าธรรมเนียมการขาย|ค่าขายหน่วย/i },
  { label: "Back-end", test: /back-?end|รับซื้อคืน/i },
  { label: "Switching", test: /switch|สับเปลี่ยน/i },
];

const GROUP_RULES: { label: string; test: RegExp }[] = [
  { label: "Provident", test: /provident|pvd|สำรองเลี้ยงชีพ/i },
  { label: "Equity", test: /equity|ตราสารทุน|หุ้น/i },
  { label: "Fixed income", test: /fixed|bond|ตราสารหนี้|หนี้/i },
  { label: "Mixed", test: /mixed|balanced|ผสม|สมดุล/i },
  { label: "Money market", test: /money market|ตลาดเงิน|สภาพคล่อง/i },
  { label: "Property", test: /property|reit|อสังหา/i },
  { label: "Commodity", test: /commodity|gold|ทองคำ|โภคภัณฑ์/i },
  { label: "Foreign", test: /foreign|global|ต่างประเทศ/i },
  { label: "Infrastructure", test: /infrastructure|โครงสร้างพื้นฐาน/i },
];

export function feeTypeLabel(raw: string) {
  const text = raw.trim();
  return TYPE_RULES.find((rule) => rule.test.test(text))?.label ?? clip(text || "Unstated fee type");
}

export function policyGroup(raw: string) {
  const text = raw.trim();
  if (!text) return "";
  return GROUP_RULES.find((rule) => rule.test.test(text))?.label ?? clip(text);
}

export function median(values: number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const value = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  return Math.round(value * 10000) / 10000;
}

function clip(text: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > 42 ? `${clean.slice(0, 42)}…` : clean;
}

function points(rows: FeeObservation[], key: "amc" | "group") {
  const buckets = new Map<string, number[]>();
  rows.forEach((row) => {
    const label = row[key];
    if (!label || row.value == null) return;
    const list = buckets.get(label) ?? [];
    list.push(row.value);
    buckets.set(label, list);
  });
  return [...buckets.entries()]
    .map(([label, values]) => ({ label, median: median(values), count: values.length }))
    .sort((a, b) => b.count - a.count || (b.median ?? 0) - (a.median ?? 0))
    .slice(0, 12);
}

function pickFocus(types: FeePoint[]) {
  const preferred = ["Total expense", "Management", "Trustee", "Registrar"];
  for (const name of preferred) {
    if (types.some((type) => type.label === name && type.count > 0)) return name;
  }
  return types[0]?.label ?? "";
}

export function buildFeeBoard(
  observations: FeeObservation[],
  meta: { lane: string; truncated: boolean; attempts: { path: string; status: number }[]; companies: number },
): FeeBoard {
  const withValue = observations.filter((row) => row.value != null);
  const types = points(withValue.map((row) => ({ ...row, amc: row.type, group: row.type })), "amc");
  const focus = pickFocus(types);
  const typeNames = types.map((type) => type.label);
  const cuts = typeNames.map((type) => {
    const rows = withValue.filter((row) => row.type === type);
    return { type, byAmc: points(rows, "amc"), byGroup: points(rows, "group") };
  });
  const groupOrder = points(withValue, "group").slice(0, 8).map((row) => row.label);
  const matrix = groupOrder.map((group) => ({
    group,
    cells: typeNames.slice(0, 6).map((type) => {
      const values = withValue.filter((row) => row.group === group && row.type === type).map((row) => row.value as number);
      return { type, median: median(values), count: values.length };
    }),
  }));
  const funds = new Set(observations.map((row) => row.projId).filter(Boolean)).size;
  const matched = observations.filter((row) => row.amc).length;
  const live = withValue.length > 0;
  return {
    live,
    lane: meta.lane,
    fetchedAt: live ? new Date().toISOString() : null,
    reason: live
      ? "Medians are calculated from the published figures on this page of the SEC feed. A lower fee is not a reason to switch."
      : "SEC did not return fee figures this view can chart. The sample book is not shown in their place.",
    read: {
      fees: observations.length,
      funds,
      companies: meta.companies,
      matched,
      truncated: meta.truncated,
    },
    attempts: meta.attempts,
    focus,
    types,
    cuts,
    matrix,
  };
}

function readPoint(value: unknown): FeePoint | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.label !== "string") return null;
  const medianValue = typeof raw.median === "number" && Number.isFinite(raw.median) ? raw.median : null;
  const count = typeof raw.count === "number" && Number.isFinite(raw.count) ? raw.count : 0;
  return { label: raw.label.slice(0, 80), median: medianValue, count };
}

export function parseFeeBoard(value: unknown): FeeBoard | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const read = raw.read && typeof raw.read === "object" ? (raw.read as Record<string, unknown>) : {};
  const types = Array.isArray(raw.types) ? raw.types.map(readPoint).filter((item): item is FeePoint => !!item) : [];
  const cuts = Array.isArray(raw.cuts)
    ? raw.cuts.slice(0, 16).map((item) => {
        const row = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
        return {
          type: typeof row.type === "string" ? row.type : "",
          byAmc: Array.isArray(row.byAmc) ? row.byAmc.map(readPoint).filter((point): point is FeePoint => !!point).slice(0, 12) : [],
          byGroup: Array.isArray(row.byGroup) ? row.byGroup.map(readPoint).filter((point): point is FeePoint => !!point).slice(0, 12) : [],
        };
      }).filter((cut) => cut.type)
    : [];
  const matrix = Array.isArray(raw.matrix)
    ? raw.matrix.slice(0, 8).map((item) => {
        const row = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
        const cells = Array.isArray(row.cells)
          ? row.cells.slice(0, 6).map((cell) => {
              const record = cell && typeof cell === "object" ? (cell as Record<string, unknown>) : {};
              return {
                type: typeof record.type === "string" ? record.type : "",
                median: typeof record.median === "number" && Number.isFinite(record.median) ? record.median : null,
                count: typeof record.count === "number" ? record.count : 0,
              };
            }).filter((cell) => cell.type)
          : [];
        return { group: typeof row.group === "string" ? row.group : "", cells };
      }).filter((row) => row.group)
    : [];
  return {
    live: raw.live === true,
    lane: typeof raw.lane === "string" ? raw.lane.slice(0, 240) : "",
    fetchedAt: typeof raw.fetchedAt === "string" ? raw.fetchedAt : null,
    reason: typeof raw.reason === "string" ? raw.reason.slice(0, 400) : "",
    read: {
      fees: typeof read.fees === "number" ? read.fees : 0,
      funds: typeof read.funds === "number" ? read.funds : 0,
      companies: typeof read.companies === "number" ? read.companies : 0,
      matched: typeof read.matched === "number" ? read.matched : 0,
      truncated: read.truncated === true,
    },
    attempts: Array.isArray(raw.attempts)
      ? raw.attempts.slice(0, 6).map((item) => {
          const row = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
          return { path: typeof row.path === "string" ? row.path.slice(0, 120) : "", status: typeof row.status === "number" ? row.status : 0 };
        })
      : [],
    focus: typeof raw.focus === "string" ? raw.focus : types[0]?.label ?? "",
    types,
    cuts,
    matrix,
  };
}
