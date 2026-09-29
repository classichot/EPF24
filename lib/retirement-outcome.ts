import { COMPANY, PROVIDERS, annualCost, baht, type Provider } from "@/lib/model";

/**
 * Retirement outcome quality for the Rattana sample book.
 * Manager names are SEC companies. Rates, menus and service notes are a mock sample,
 * not published factsheets. Projections are scenarios, not guarantees.
 * The employer fee saving is a separate lane and is not added into a member balance.
 */

export type SampleMember = {
  id: string;
  name: string;
  role: string;
  age: number;
  retireAge: number;
  balance: number;
  salaryMonthly: number;
  contrib: number;
  employer: number;
  growth: number;
  infl: number;
  note: string;
};

export type Wealth = {
  bal: number;
  real: number;
  target: number;
  years: number;
};

export const NIRAN: SampleMember = {
  id: "niran",
  name: "Niran S.",
  role: "Age 35 · salary ฿60,000",
  age: 35,
  retireAge: 60,
  balance: 1_450_000,
  salaryMonthly: 60_000,
  contrib: 5,
  employer: 5,
  growth: 3,
  infl: 2,
  note: "Sample member. Opening balance, 5% employee contribution and 5% employer contribution are stated assumptions.",
};

export const ARUN: SampleMember = {
  id: "arun",
  name: "Arun T.",
  role: "Age 27 · engineer",
  age: 27,
  retireAge: 60,
  balance: 320_000,
  salaryMonthly: 42_000,
  contrib: 5,
  employer: 5,
  growth: 3,
  infl: 2,
  note: "Sample member on a conservative mix, about 80% bonds and 20% equity. The planning rates are the same ones Employee wealth uses.",
};

export const MALEE: SampleMember = {
  id: "malee",
  name: "Malee C.",
  role: "Age 59 · manager",
  age: 59,
  retireAge: 65,
  balance: 6_400_000,
  salaryMonthly: 85_000,
  contrib: 5,
  employer: 5,
  growth: 2,
  infl: 2,
  note: "Sample member six years from retirement. A higher scenario balance is not treated as a better outcome.",
};

/** Same compounding loop as projectMember, with an explicit annual rate. */
export function projectWealth(member: SampleMember, annualReturn: number): Wealth {
  let bal = member.balance;
  let sal = member.salaryMonthly * 12;
  for (let age = member.age; age <= member.retireAge; age++) {
    if (age === member.retireAge) break;
    bal = bal * (1 + annualReturn) + sal * ((member.contrib + member.employer) / 100);
    sal *= 1 + member.growth / 100;
  }
  const years = member.retireAge - member.age;
  const target = sal * 0.46 * (85 - member.retireAge);
  const real = bal / Math.pow(1 + member.infl / 100, years);
  return { bal, real, target, years };
}

export function providerById(id: string) {
  const found = PROVIDERS.find((row) => row.id === id);
  if (!found) throw new Error(`Missing sample provider ${id}`);
  return found;
}

const FIT = providerById("cp");

export function perEmployee(fee: number) {
  return annualCost(fee) / COMPANY.members;
}

export function headlineRva() {
  const feeOnlyRate = COMPANY.netReturn + (COMPANY.feeRate - FIT.fee);
  const current = projectWealth(NIRAN, COMPANY.netReturn);
  const feeOnly = projectWealth(NIRAN, feeOnlyRate);
  const alternative = projectWealth(NIRAN, COMPANY.altReturn);
  return {
    member: NIRAN,
    fit: FIT,
    currentRate: COMPANY.netReturn,
    feeOnlyRate,
    altRate: COMPANY.altReturn,
    current,
    feeOnly,
    alternative,
    feeEffect: feeOnly.bal - current.bal,
    investEffect: alternative.bal - feeOnly.bal,
    rva: alternative.bal - current.bal,
    employerFee: COMPANY.feeSaving,
    perEmployeeNow: perEmployee(COMPANY.feeRate),
    perEmployeeFit: perEmployee(FIT.fee),
  };
}

export function youngAllocation() {
  const conservative = projectWealth(ARUN, 0.03);
  const life = projectWealth(ARUN, 0.058);
  return {
    member: ARUN,
    conservative,
    life,
    difference: life.bal - conservative.bal,
    currentMix: "80% bonds / 20% equity",
    suggested: "Life Path",
  };
}

export function lateCareer() {
  const steady = projectWealth(MALEE, 0.03);
  const growth = projectWealth(MALEE, 0.065);
  return {
    member: MALEE,
    steady,
    growth,
    difference: growth.bal - steady.bal,
    verdict: "No action on risk",
  };
}

/** Mock quality notes. Not an SEC series. 10-year history is intentionally absent. */
export type QualityNote = {
  id: string;
  worst12: number;
  recoveryMonths: number;
  beatRolling: number;
  downCapture: number;
  upCapture: number;
};

export const QUALITY_NOTES: QualityNote[] = [
  { id: "sh", worst12: -8.1, recoveryMonths: 14, beatRolling: 0.58, downCapture: 0.92, upCapture: 0.88 },
  { id: "cp", worst12: -9.0, recoveryMonths: 16, beatRolling: 0.71, downCapture: 0.98, upCapture: 1.05 },
  { id: "la", worst12: -6.4, recoveryMonths: 11, beatRolling: 0.74, downCapture: 0.81, upCapture: 0.93 },
];

export const COMPARE_IDS = ["sh", "la", "cp"] as const;

export function qualityRows() {
  return COMPARE_IDS.map((id) => {
    const provider = providerById(id);
    const note = QUALITY_NOTES.find((row) => row.id === id);
    if (!note) throw new Error(`Missing quality note ${id}`);
    return { provider, note, role: id === "sh" ? "Current" : id === "cp" ? "Best fit" : "Lower drawdown" };
  });
}

export const ARCHITECTURE: Record<string, string[]> = {
  sh: ["Conservative", "Balanced", "Equity", "Money market"],
  cp: [
    "Thai fixed income",
    "Global fixed income",
    "Thai equity",
    "Global equity",
    "Balanced",
    "ESG multi-asset",
    "Gold",
    "Life Path 2035",
    "Life Path 2040",
    "Life Path 2045",
    "Life Path 2050",
  ],
  an: [
    "Thai fixed income",
    "Global fixed income",
    "Thai equity",
    "Global equity",
    "US equity",
    "Infrastructure",
    "REIT",
    "ESG",
    "Gold",
    "Multi-asset",
    "Life Path 2035",
    "Life Path 2040",
    "Life Path 2045",
    "Life Path 2050",
  ],
};

export function architectureOf(id: string) {
  const provider = providerById(id);
  const menu = ARCHITECTURE[id] ?? [];
  return { provider, menu, count: menu.length, life: provider.life, global: provider.global };
}

export function qualitySentence() {
  const la = providerById("la");
  const cp = providerById("cp");
  return `${la.name} shows a lower mock 5-year net than ${cp.name} (${la.r5.toFixed(1)}% versus ${cp.r5.toFixed(1)}%), and a smaller sample drawdown (${la.dd.toFixed(1)}% versus ${cp.dd.toFixed(1)}%). A league table of one return would hide that. These figures are a mock sample, not published factsheets.`;
}

export type FrameworkCell = { label: string; current: string; fit: string };

export function frameworkRows(): FrameworkCell[] {
  const sh = providerById("sh");
  const cp = providerById("cp");
  const book = headlineRva();
  return [
    {
      label: "Cost",
      current: `${baht(book.perEmployeeNow)} / employee / year`,
      fit: `${baht(book.perEmployeeFit)} / employee / year`,
    },
    {
      label: "Return",
      current: `Planning ${pct1(COMPANY.netReturn)} · mock 5Y ${sh.r5.toFixed(1)}%`,
      fit: `Planning ${pct1(COMPANY.altReturn)} · mock 5Y ${cp.r5.toFixed(1)}%`,
    },
    {
      label: "Risk",
      current: `Volatility ${sh.vol.toFixed(1)}% · max drawdown ${signedPct(sh.dd)}`,
      fit: `Volatility ${cp.vol.toFixed(1)}% · max drawdown ${signedPct(cp.dd)}`,
    },
    {
      label: "Investment choice",
      current: `${sh.choices} policies · no lifecycle`,
      fit: `${cp.choices} policies · lifecycle in the sample`,
    },
    {
      label: "Personalization",
      current: "One default for a typical member",
      fit: "Lifecycle years in the sample menu",
    },
    {
      label: "Service",
      current: `Digital ${sh.digital} · education ${sh.edu} · SLA ${sh.sla}`,
      fit: `Digital ${cp.digital} · education ${cp.edu} · SLA ${cp.sla}`,
    },
    {
      label: "Retirement outcome",
      current: `${baht(book.current.bal)} at 60 for ${NIRAN.name}`,
      fit: `${baht(book.alternative.bal)} at 60 for the same member`,
    },
  ];
}

export function experience(provider: Provider) {
  if (provider.digital >= 85) return "App, statements and a retirement view in the sample notes";
  if (provider.digital >= 70) return "App and statements in the sample notes";
  return "Statements. The sample app-use figure for this fund is low";
}

function pct1(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}

export function signedPct(n: number) {
  const sign = n < 0 ? "−" : "";
  return `${sign}${Math.abs(n).toFixed(1)}%`;
}
