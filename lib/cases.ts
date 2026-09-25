import { baht } from "@/lib/model";

export type CaseStatus = "intake" | "active" | "waiting" | "closed";

export type AdvisorCase = {
  id: string;
  employer: string;
  members: number | null;
  aum: number | null;
  provider: string;
  status: CaseStatus;
  opened: string;
  note: string;
  /** The only file whose fee and return figures are calculated. */
  worked: boolean;
  sample: boolean;
};

export type NewCase = {
  employer: string;
  members: number | null;
  aum: number | null;
  provider: string;
  note: string;
};

export const CASE_STATUSES: { id: CaseStatus; label: string }[] = [
  { id: "intake", label: "Intake" },
  { id: "active", label: "In progress" },
  { id: "waiting", label: "Waiting" },
  { id: "closed", label: "Closed" },
];

/** Fictional book. Only Rattana carries the worked sample figures. */
export const SEED_CASES: AdvisorCase[] = [
  {
    id: "rattana",
    employer: "Rattana Group PCL",
    members: 1820,
    aum: 800_000_000,
    provider: "Siam Harbor AM",
    status: "active",
    opened: "14 Aug 2026",
    note: "Worked sample. Fee and return figures on the screens belong to this file only.",
    worked: true,
    sample: true,
  },
  {
    id: "mekong",
    employer: "Mekong Foods PCL",
    members: null,
    aum: null,
    provider: "Not confirmed",
    status: "intake",
    opened: "18 Sep 2026",
    note: "First look. No contract and no member file, so nothing is calculated.",
    worked: false,
    sample: true,
  },
  {
    id: "riverbend",
    employer: "Riverbend Hospital",
    members: null,
    aum: null,
    provider: "Not confirmed",
    status: "waiting",
    opened: "2 Sep 2026",
    note: "Waiting on the committee to send the fee schedule.",
    worked: false,
    sample: true,
  },
];

const KEY = "epf24-cases";
const STATUSES = new Set<string>(CASE_STATUSES.map((row) => row.id));

export function statusLabel(status: CaseStatus) {
  return CASE_STATUSES.find((row) => row.id === status)?.label ?? status;
}

export function caseFacts(item: AdvisorCase) {
  const members = item.members == null ? "Members not on file" : `${item.members.toLocaleString("en-US")} members`;
  const assets = item.aum == null ? "Assets not on file" : `${baht(item.aum)} assets`;
  return `${members} · ${assets} · ${item.provider}`;
}

export function todayLabel(date = new Date()) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function isStatus(value: unknown): value is CaseStatus {
  return typeof value === "string" && STATUSES.has(value);
}

function isCase(value: unknown): value is AdvisorCase {
  if (!value || typeof value !== "object") return false;
  const row = value as AdvisorCase;
  return typeof row.id === "string" && typeof row.employer === "string" && row.employer.trim().length > 0 && isStatus(row.status);
}

export function loadBook(): { cases: AdvisorCase[]; activeId: string } {
  const fresh = { cases: SEED_CASES, activeId: "rattana" };
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null") as { cases?: unknown; activeId?: unknown } | null;
    if (!raw || !Array.isArray(raw.cases)) return fresh;
    const stored = raw.cases.filter(isCase);
    const byId = new Map(stored.map((item) => [item.id, item]));
    const seeded = SEED_CASES.map((seed) => {
      const saved = byId.get(seed.id);
      if (!saved) return seed;
      return { ...seed, status: saved.status, note: typeof saved.note === "string" && saved.note.trim() ? saved.note : seed.note };
    });
    const extra = stored
      .filter((item) => !SEED_CASES.some((seed) => seed.id === item.id))
      .map((item) => ({
        ...item,
        employer: item.employer.trim(),
        members: typeof item.members === "number" && item.members >= 0 ? Math.round(item.members) : null,
        aum: typeof item.aum === "number" && item.aum >= 0 ? Math.round(item.aum) : null,
        provider: typeof item.provider === "string" && item.provider.trim() ? item.provider.trim() : "Not confirmed",
        opened: typeof item.opened === "string" ? item.opened : todayLabel(),
        note: typeof item.note === "string" ? item.note : "",
        worked: false,
        sample: false,
      }));
    const cases = [...seeded, ...extra];
    const activeId = typeof raw.activeId === "string" && cases.some((item) => item.id === raw.activeId) ? raw.activeId : "rattana";
    return { cases, activeId };
  } catch {
    return fresh;
  }
}

export function saveBook(cases: AdvisorCase[], activeId: string) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ cases, activeId }));
  } catch {
    /* ignore */
  }
}

export function makeCase(input: NewCase): AdvisorCase {
  return {
    id: `case-${Date.now()}`,
    employer: input.employer.trim(),
    members: input.members,
    aum: input.aum,
    provider: input.provider.trim() || "Not confirmed",
    status: "intake",
    opened: todayLabel(),
    note: input.note.trim() || "Added from the advisor workspace. No fee or return is calculated until documents are on the file.",
    worked: false,
    sample: false,
  };
}
