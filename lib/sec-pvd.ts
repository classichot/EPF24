/**
 * SEC PVD connector.
 * Pages never call the SEC. A worker calls syncDataset, stores the raw body,
 * then normalizes it. Paths stay empty until they are copied from the current
 * SEC Open Data portal. The old Developer Portal path is not used.
 */

export const SEC_PORTAL = "https://secopendata.sec.or.th/datasets";
export const SEC_API_PORTAL = "https://api-portal.sec.or.th/apis";

export const SEC_PVD_DATASETS: { id: string; name: string; use: string; entity: CanonicalEntity }[] = [
  { id: "01", name: "Asset management companies", use: "AMC master", entity: "amc" },
  { id: "02", name: "Funds under each AMC", use: "Fund master", entity: "fund" },
  { id: "03", name: "Fund details", use: "Fund master", entity: "fund" },
  { id: "04", name: "Investment policies", use: "Policy comparison", entity: "policy" },
  { id: "05", name: "Historical returns", use: "Performance intelligence", entity: "return" },
  { id: "06", name: "Pinned historical returns", use: "Benchmark comparison", entity: "return" },
  { id: "07", name: "Fees", use: "Fee intelligence", entity: "fee" },
  { id: "08", name: "Asset allocation", use: "Portfolio analysis", entity: "holding" },
  { id: "09", name: "Statistics", use: "Market intelligence", entity: "statistic" },
  { id: "10", name: "Top-5 asset classes", use: "Portfolio exposure", entity: "holding" },
  { id: "11", name: "Top-5 securities", use: "Concentration", entity: "holding" },
  { id: "12", name: "Top-5 foreign allocations", use: "Geographic exposure", entity: "holding" },
  { id: "13", name: "Top-5 industries", use: "Sector exposure", entity: "holding" },
  { id: "14", name: "Top-5 issuers", use: "Issuer concentration", entity: "holding" },
  { id: "15", name: "Monthly NAV by sub-policy", use: "Time series", entity: "nav" },
];

/** Filled from the current portal. Null means sync stays off for that dataset. */
const DATASET_PATHS: Record<string, string | null> = Object.fromEntries(SEC_PVD_DATASETS.map((dataset) => [dataset.id, null]));

export const PIPELINE = [
  "SEC PVD API",
  "Data lake",
  "PVD master",
  "Time-series store",
  "Fee engine",
  "Performance engine",
  "Benchmark engine",
  "Employer digital twin",
  "AI analysis",
  "Opportunity finder",
  "AGI mission",
];

export const DATA_TIERS = [
  { k: "SEC Open Data", v: "Official managers, funds, policies, published returns, published fees, holdings and monthly NAV. Free for commercial and personal use. Pooled and master pooled factsheets, not every bespoke employer fund." },
  { k: "EPF24 open-source intelligence", v: "AMC factsheets, sites and reports, only where reuse is allowed. Kept apart from the SEC file so a published fee is never treated as the negotiated fee." },
  { k: "Corporate private data", v: "Contract, invoices, headcount, contributions, balances and the policies the employer actually selected. This is what turns the market file into that employer’s digital twin." },
];

export const RAW_STORE = "sec_pvd_raw";

export const CANONICAL_CHAIN = ["AMC", "Fund", "Investment policy", "Sub-policy", "NAV", "Return", "Fee", "Holdings", "Benchmark"];

export type CanonicalEntity = "amc" | "fund" | "policy" | "subpolicy" | "nav" | "return" | "fee" | "holding" | "statistic";

export type RawEnvelope = {
  datasetId: string;
  retrievedAt: string;
  effectiveDate: string | null;
  body: unknown;
};

export type NormalizedRow = {
  entity: CanonicalEntity;
  key: string;
  effectiveDate: string | null;
  retrievedAt: string;
  fields: Record<string, string | number | null>;
};

export function datasetPath(datasetId: string) {
  return DATASET_PATHS[datasetId] ?? null;
}
