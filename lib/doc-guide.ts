/** Files EPF24 needs before an employer’s own situation can replace the sample. */

export const REQUIRED_DOCS = [
  {
    id: "agreement",
    name: "Management agreement",
    why: "Names the provider, the term, and the clauses for custodian and administration charges.",
  },
  {
    id: "fees",
    name: "Fee schedule",
    why: "The negotiated lines in baht. The all-in rate is that total divided by the employer’s assets.",
  },
  {
    id: "members",
    name: "Member file",
    why: "Headcount. Cost per employee and a per-member registrar charge use this count.",
  },
  {
    id: "assets",
    name: "Asset report",
    why: "Fund assets. This is the divisor for every reversed fee rate.",
  },
  {
    id: "policy",
    name: "Investment policy",
    why: "The policies members hold. A policy factsheet is context. It is not the employer contract.",
  },
] as const;

export type RequiredDocId = (typeof REQUIRED_DOCS)[number]["id"];

const IDS = new Set<string>(REQUIRED_DOCS.map((doc) => doc.id));

export function keptDocIds(ids: string[]) {
  return ids.filter((id) => IDS.has(id));
}

export function ingestComplete(ids: string[]) {
  return REQUIRED_DOCS.every((doc) => ids.includes(doc.id));
}
