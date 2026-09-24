import { COMPANY, baht, feeLabel, wealthDifference } from "@/lib/model";

export type FeeLine = {
  id: string;
  layer: "Fund" | "Employer";
  name: string;
  amount: number;
  confidence: number;
  source: string;
  ref: string;
  clause: string;
};

/** Negotiated corporate schedule. Sum is the contract all-in, not a published factsheet. */
export const NEGOTIATED_FEES: FeeLine[] = [
  { id: "mgmt", layer: "Fund", name: "Management fee", amount: 1_680_000, confidence: 98, source: "Fee Schedule 2026.xlsx", ref: "Fees · C12", clause: "Management fee 0.210% of fund assets, charged to the fund." },
  { id: "reg", layer: "Fund", name: "Registrar fee", amount: 273_000, confidence: 95, source: "Fee Schedule 2026.xlsx", ref: "Fees · C18", clause: "Registrar ฿150 per member per year." },
  { id: "cust", layer: "Fund", name: "Custodian fee", amount: 120_000, confidence: 91, source: "EPF Management Agreement 2022.pdf", ref: "Page 12 · clause 7.2", clause: "Custodian fee ฿120,000 per year." },
  { id: "admin", layer: "Employer", name: "Annual administration", amount: 180_000, confidence: 88, source: "EPF Management Agreement 2022.pdf", ref: "Page 14 · clause 8.1", clause: "Employer administration charge ฿180,000 per year." },
  { id: "audit", layer: "Fund", name: "Audit and other", amount: 147_000, confidence: 84, source: "Q2 Investment Report.pdf", ref: "Note 6", clause: "Audit and other fund expenses ฿147,000 for the year." },
];

/** Same line order. This is the best-fit comparison case, not a second extraction from the contract. */
export const BENCHMARK_FEES = [1_200_000, 172_900, 80_000, 100_000, 97_100];

export function feeTotal(lines: { amount: number }[]) {
  return lines.reduce((sum, line) => sum + line.amount, 0);
}

export function trueCost(total = feeTotal(NEGOTIATED_FEES), members = COMPANY.members, aum = COMPANY.aum) {
  return {
    total,
    perEmployee: total / members,
    rate: total / aum,
  };
}

export function projectFees(rate: number, years: number, growth: number, aum = COMPANY.aum) {
  let assets = aum;
  const yearsCosts: number[] = [];
  let total = 0;
  for (let year = 1; year <= years; year++) {
    const cost = rate * assets;
    yearsCosts.push(cost);
    total += cost;
    assets *= 1 + growth;
  }
  return { total, yearsCosts, endAssets: assets };
}

export function wealthAt(years: number, base: number, alt: number, aum = COMPANY.aum) {
  return aum * (Math.pow(1 + alt, years) - Math.pow(1 + base, years));
}

export function feeScenario(rate: number, growth: number, uplift: number) {
  const current = trueCost();
  const optimized = trueCost(rate * COMPANY.aum);
  const annualSaving = current.total - optimized.total;
  const fiveCurrent = projectFees(current.rate, 5, growth);
  const fiveNext = projectFees(rate, 5, growth);
  const tenWealth = wealthAt(10, COMPANY.netReturn, COMPANY.netReturn + uplift);
  return {
    current,
    optimized,
    annualSaving,
    fiveSaving: fiveCurrent.total - fiveNext.total,
    tenWealth,
    fiveCurrent,
    fiveNext,
  };
}

export const FEE_LINES = NEGOTIATED_FEES.map((line, i) => ({
  ...line,
  benchmark: BENCHMARK_FEES[i],
  saving: line.amount - BENCHMARK_FEES[i],
}));

export function savingsMeter() {
  const cost = trueCost();
  const ten = wealthDifference(10);
  return {
    cost,
    optimized: COMPANY.altCost,
    annualSaving: COMPANY.feeSaving,
    fiveSaving: projectFees(cost.rate, 5, 0).total - projectFees(COMPANY.altCost / COMPANY.aum, 5, 0).total,
    employeeYear: COMPANY.investOpp,
    employeeTen: ten,
  };
}

export function feeLabelBaht(amount: number) {
  return `${baht(amount)} · ${feeLabel(amount / COMPANY.aum)}`;
}
