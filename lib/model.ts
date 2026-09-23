export type ScreenId =
  | "home"
  | "cio"
  | "brain"
  | "shadow"
  | "fair"
  | "dna"
  | "nego"
  | "twin"
  | "intervene"
  | "outcome"
  | "exchange"
  | "intel"
  | "compare"
  | "bench"
  | "gap"
  | "market"
  | "tender"
  | "marketplace"
  | "watch"
  | "committee"
  | "employees"
  | "workforce"
  | "designer"
  | "switching"
  | "mission"
  | "docs"
  | "reports"
  | "settings";

export const NAV: { id: ScreenId; label: string; group: "Moat" | "Operate" }[] = [
  { id: "home", label: "Home", group: "Moat" },
  { id: "cio", label: "Autonomous CIO", group: "Moat" },
  { id: "brain", label: "Market Brain", group: "Moat" },
  { id: "shadow", label: "Shadow Market", group: "Moat" },
  { id: "fair", label: "Fair Price", group: "Moat" },
  { id: "dna", label: "Provider DNA", group: "Moat" },
  { id: "nego", label: "Negotiation Twin", group: "Moat" },
  { id: "twin", label: "Digital Twin", group: "Moat" },
  { id: "intervene", label: "Intervention", group: "Moat" },
  { id: "outcome", label: "Outcome Engine", group: "Moat" },
  { id: "exchange", label: "Exchange", group: "Moat" },
  { id: "intel", label: "EPF Intelligence", group: "Operate" },
  { id: "compare", label: "Compare", group: "Operate" },
  { id: "bench", label: "Benchmark", group: "Operate" },
  { id: "gap", label: "Value Gap", group: "Operate" },
  { id: "market", label: "Market Test", group: "Operate" },
  { id: "tender", label: "Tender", group: "Operate" },
  { id: "marketplace", label: "Marketplace", group: "Operate" },
  { id: "watch", label: "EPF Watch", group: "Operate" },
  { id: "committee", label: "Committee AI", group: "Operate" },
  { id: "employees", label: "Employees", group: "Operate" },
  { id: "workforce", label: "Retirement Intelligence", group: "Operate" },
  { id: "designer", label: "EPF Designer", group: "Operate" },
  { id: "switching", label: "Switching", group: "Operate" },
  { id: "mission", label: "AI Mission Center", group: "Operate" },
  { id: "docs", label: "Documents", group: "Operate" },
  { id: "reports", label: "Reports", group: "Operate" },
  { id: "settings", label: "Settings", group: "Operate" },
];

export const COMPANY = {
  name: "Rattana Group PCL",
  members: 1820,
  aum: 800_000_000,
  provider: "Siam Harbor AM",
  providerId: "sh",
  annualCost: 2_400_000,
  feeRate: 0.003,
  altCost: 1_650_000,
  feeSaving: 750_000,
  renegotiateSaving: 520_000,
  cheapestSaving: 880_000,
  netReturn: 0.038,
  altReturn: 0.046,
  spread: 0.008,
  investOpp: 6_400_000,
  annualValue: 7_150_000,
  choices: 4,
  lifePath: false,
  participation: 0.82,
  defaultShare: 0.71,
  appUse: 0.18,
  service: "Moderate",
  onTrack: 0.64,
  renewal: "31 Mar 2027",
  renewalDays: 189,
  avgAge: 36,
  medianSalary: 32_000,
  avgSalary: 42_000,
};

export function wealthDifference(years = 10) {
  const { aum, netReturn, altReturn } = COMPANY;
  return aum * (Math.pow(1 + altReturn, years) - Math.pow(1 + netReturn, years));
}

export function baht(n: number) {
  const sign = n < 0 ? "−" : "";
  const v = Math.abs(n);
  if (v >= 1_000_000) {
    const m = v / 1_000_000;
    const text =
      m >= 100 ? m.toFixed(0) : m >= 10 ? trim(m, 1) : trim(m, m >= 1 && Math.round(m * 100) % 10 === 0 ? 1 : 2);
    return `${sign}฿${text}M`;
  }
  if (v >= 10_000) return `${sign}฿${Math.round(v / 1000)}K`;
  return `${sign}฿${Math.round(v).toLocaleString("en-US")}`;
}

function trim(n: number, digits: number) {
  return n.toFixed(digits).replace(/\.0$/, "");
}

export function pct(n: number, digits = 2) {
  return `${(n * 100).toFixed(digits)}%`;
}

export type Provider = {
  id: string;
  name: string;
  fee: number;
  r1: number;
  r3: number;
  r5: number;
  vol: number;
  dd: number;
  choices: number;
  life: boolean;
  esg: boolean;
  digital: number;
  edu: number;
  sla: number;
  global: boolean;
};

export const PROVIDERS: Provider[] = [
  { id: "sh", name: "Siam Harbor AM", fee: 0.003, r1: 4.1, r3: 3.8, r5: 3.9, vol: 6.8, dd: -9.4, choices: 4, life: false, esg: false, digital: 62, edu: 48, sla: 72, global: true },
  { id: "cp", name: "Chao Phraya Capital", fee: 0.0020625, r1: 5.0, r3: 4.4, r5: 4.4, vol: 7.1, dd: -10.2, choices: 11, life: true, esg: true, digital: 84, edu: 77, sla: 80, global: true },
  { id: "la", name: "Lanna Asset", fee: 0.0022, r1: 4.6, r3: 4.2, r5: 4.1, vol: 6.2, dd: -8.1, choices: 9, life: true, esg: true, digital: 71, edu: 69, sla: 76, global: true },
  { id: "an", name: "Andaman Investment", fee: 0.0025, r1: 5.4, r3: 4.6, r5: 4.0, vol: 8.3, dd: -12.6, choices: 14, life: true, esg: true, digital: 90, edu: 72, sla: 74, global: true },
  { id: "ng", name: "Northgate AM", fee: 0.0024, r1: 3.8, r3: 3.6, r5: 3.7, vol: 5.4, dd: -7.0, choices: 7, life: false, esg: false, digital: 58, edu: 55, sla: 68, global: false },
  { id: "kf", name: "Krungthep Fund Partners", fee: 0.0019, r1: 4.9, r3: 4.3, r5: 4.3, vol: 6.9, dd: -9.8, choices: 10, life: true, esg: true, digital: 77, edu: 81, sla: 70, global: true },
];

export function annualCost(fee: number, aum = COMPANY.aum) {
  return fee * aum;
}

export function feeLabel(fee: number) {
  const pct = fee * 100;
  const rounded = Math.round(pct * 1000) / 1000;
  const text = rounded.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
  const decimals = text.includes(".") ? text.split(".")[1] : "";
  if (decimals.length < 2) return `${rounded.toFixed(2)}%`;
  return `${text}%`;
}

export const POLICY_TYPES = ["All", "Balanced", "Equity", "Fixed income", "Life Path"] as const;

export type PolicyRow = {
  prov: string;
  name: string;
  type: string;
  r1: string;
  r3: string;
  r5: string;
  vol: string;
  dd: string;
  cost: string;
  cons: string;
};

const CONS = ["High", "Medium", "High", "Medium", "High", "Medium"];

export function policies(): PolicyRow[] {
  const rows: PolicyRow[] = [];
  PROVIDERS.forEach((p, i) => {
    (
      [
        ["Balanced", 0, 0],
        ["Equity", 2.1, 5.6],
        ["Fixed income", -1.9, -4.1],
        ["Life Path", 0.6, 0.9],
      ] as const
    ).forEach(([t, dr, dv], j) => {
      if (t === "Life Path" && !p.life) return;
      const cost = p.fee + (t === "Equity" ? 0.0015 : t === "Fixed income" ? -0.0004 : 0.0002);
      rows.push({
        prov: p.name,
        name: `${p.name.split(" ")[0]} ${t}${t === "Life Path" ? " 2050" : ""}`,
        type: t,
        r1: (p.r1 + dr * 0.6).toFixed(1) + "%",
        r3: (p.r3 + dr * 0.45).toFixed(1) + "%",
        r5: (p.r5 + dr * 0.4).toFixed(1) + "%",
        vol: (p.vol + dv * 0.35).toFixed(1) + "%",
        dd: (p.dd - dv * 0.45).toFixed(1) + "%",
        cost: feeLabel(cost),
        cons: CONS[(i + j) % CONS.length],
      });
    });
  });
  return rows;
}

export const METER = [
  { k: "Performance", score: 90, w: 25, note: "3.8% net, around the selected peer range" },
  { k: "Risk", score: 92, w: 20, note: "Volatility below the peer median" },
  { k: "Fee", score: 70, w: 25, note: "0.30% versus a qualified range of 0.19–0.22%" },
  { k: "Choice", score: 74, w: 15, note: "4 policies, Life Path unavailable" },
  { k: "Service", score: 84, w: 15, note: "Moderate service, member app use 18%" },
];

export function meterScore() {
  const w = METER.reduce((s, p) => s + p.w, 0);
  return METER.reduce((s, p) => s + p.score * p.w, 0) / w;
}

export const WATCH = [
  { k: "Performance", score: 72, detail: "3.8% net vs 4.6% comparable scenario", status: "Around range", tone: "ink" as const },
  { k: "Risk", score: 86, detail: "Vol 6.8% · max drawdown −9.4%", status: "Below peer risk", tone: "good" as const },
  { k: "Fee", score: 48, detail: "0.30% vs qualified 0.19–0.22%", status: "Above range", tone: "warn" as const },
  { k: "Service", score: 70, detail: "SLA met 11 / 12 months", status: "Moderate", tone: "ink" as const },
  { k: "Retirement", score: 64, detail: "64% projected on track", status: "Watch", tone: "warn" as const },
  { k: "Governance", score: 77, detail: "2 open committee actions", status: "On schedule", tone: "good" as const },
];

export const BIDS: Record<string, Record<string, number>> = {
  cp: { perf: 82, risk: 70, cost: 78, service: 80, digital: 86, edu: 78, choice: 84, outcome: 80 },
  la: { perf: 74, risk: 86, cost: 74, service: 76, digital: 70, edu: 70, choice: 76, outcome: 78 },
  an: { perf: 90, risk: 58, cost: 62, service: 74, digital: 92, edu: 72, choice: 88, outcome: 70 },
  kf: { perf: 78, risk: 72, cost: 94, service: 70, digital: 76, edu: 84, choice: 80, outcome: 74 },
  sh: { perf: 68, risk: 76, cost: 48, service: 72, digital: 60, edu: 48, choice: 44, outcome: 60 },
};

export const CRITERIA: { id: string; label: string }[] = [
  { id: "perf", label: "Performance" },
  { id: "risk", label: "Risk" },
  { id: "cost", label: "Fee" },
  { id: "service", label: "Service" },
  { id: "digital", label: "Technology" },
  { id: "edu", label: "Education" },
  { id: "choice", label: "Investment choice" },
  { id: "outcome", label: "Employee outcome" },
];

export const DEFAULT_WEIGHTS: Record<string, number> = {
  perf: 20,
  risk: 15,
  cost: 20,
  service: 10,
  digital: 10,
  edu: 8,
  choice: 9,
  outcome: 8,
};

export function scoreBids(weights: Record<string, number>) {
  const sum = Object.values(weights).reduce((a, b) => a + b, 0) || 1;
  const names: Record<string, string> = {
    cp: "Chao Phraya Capital",
    la: "Lanna Asset",
    an: "Andaman Investment",
    kf: "Krungthep Fund Partners",
    sh: "Siam Harbor AM (incumbent)",
  };
  const notes: Record<string, string> = {
    cp: "0.206% · 11 policies · Life Path · best fit",
    la: "0.22% · lowest drawdown",
    an: "0.25% · strongest digital, higher volatility",
    kf: "0.19% · lowest fee, 5-year lock",
    sh: "0.30% · repriced indication 0.235%",
  };
  return Object.keys(BIDS)
    .map((id) => ({
      id,
      name: names[id],
      note: notes[id],
      score: CRITERIA.reduce((a, c) => a + BIDS[id][c.id] * (weights[c.id] || 0), 0) / sum,
    }))
    .sort((a, b) => b.score - a.score);
}

export const COHORTS = [
  { band: "20–30", n: 540, base: 71, elasticity: 1 },
  { band: "31–40", n: 644, base: 66, elasticity: 0.85 },
  { band: "41–50", n: 419, base: 58, elasticity: 0.55 },
  { band: "51+", n: 217, base: 49, elasticity: 0.2 },
];

export function workforceAt(match: number) {
  const delta = match - 5;
  let onN = 0;
  let moved = 0;
  const cohorts = COHORTS.map((c) => {
    const lift = Math.min(96 - c.base, Math.max(0, delta) * 4.6 * c.elasticity);
    onN += (c.n * (c.base + lift)) / 100;
    moved += (c.n * lift) / 100;
    return { ...c, lift, on: c.base + lift };
  });
  const payroll = COMPANY.members * COMPANY.avgSalary * 12;
  return {
    cohorts,
    onPct: (onN / COMPANY.members) * 100,
    moved: Math.round(moved),
    cost: (payroll * Math.max(0, delta)) / 100,
  };
}

export const POLICY_RETURNS: Record<string, number> = {
  preserve: 0.025,
  cons: 0.03,
  bal: 0.05,
  life: 0.058,
  grow: 0.065,
  global: 0.07,
};

export function projectMember(input: {
  age: number;
  retireAge: number;
  balance: number;
  salaryMonthly: number;
  contrib: number;
  employer: number;
  growth: number;
  infl: number;
  policy: string;
  scenario: "weak" | "base" | "strong";
}) {
  const bump = { weak: -0.015, base: 0, strong: 0.01 }[input.scenario];
  const ret = (POLICY_RETURNS[input.policy] ?? 0.05) + bump;
  let bal = input.balance;
  let sal = input.salaryMonthly * 12;
  const pts: { age: number; bal: number }[] = [];
  for (let a = input.age; a <= input.retireAge; a++) {
    if ((a - input.age) % 3 === 0 || a === input.retireAge) pts.push({ age: a, bal });
    if (a === input.retireAge) break;
    bal = bal * (1 + ret) + sal * ((input.contrib + input.employer) / 100);
    sal *= 1 + input.growth / 100;
  }
  const years = input.retireAge - input.age;
  const target = sal * 0.46 * (85 - input.retireAge);
  const real = bal / Math.pow(1 + input.infl / 100, years);
  return { bal, real, target, gap: target - bal, pts, ret };
}

export function qualifiedProviders(lifePath: boolean, esg: boolean, digital: boolean) {
  return PROVIDERS.filter((p) => p.id !== "sh").filter((p) => {
    if (lifePath && !p.life) return false;
    if (esg && !p.esg) return false;
    if (digital && p.digital < 70) return false;
    return true;
  });
}

export function marketQuote(aum: number, lifePath: boolean, esg: boolean, digital: boolean) {
  const set = qualifiedProviders(lifePath, esg, digital);
  const costs = set.map((p) => annualCost(p.fee, aum)).sort((a, b) => a - b);
  const current = annualCost(COMPANY.feeRate, aum);
  const median = costs.length
    ? costs.length % 2
      ? costs[(costs.length - 1) / 2]
      : (costs[costs.length / 2 - 1] + costs[costs.length / 2]) / 2
    : current;
  const cheapest = costs[0] ?? current;
  const fit = set.find((p) => p.id === "cp") ?? set[0];
  const competitive = fit ? annualCost(fit.fee, aum) : cheapest;
  return { set, current, median, cheapest, competitive, fitName: fit?.name ?? "—", saving: current - competitive };
}

export const AGENTS = [
  ["EPF Intelligence Agent", "Market intelligence"],
  ["Performance Analyst", "Return attribution"],
  ["Risk Analyst", "Volatility and drawdown"],
  ["Fee Analyst", "Cost normalization"],
  ["Procurement Agent", "RFP and proposals"],
  ["Governance Agent", "Committee workflow"],
  ["Retirement Agent", "Member modelling"],
  ["Workforce Analyst", "Employer retirement health"],
  ["Compliance Agent", "Regulatory monitoring"],
  ["Negotiation Agent", "Repricing strategy"],
  ["Transition Agent", "Provider switching"],
  ["Independent Challenger", "Tests assumptions"],
] as const;

export const MISSIONS = [
  { id: "analyze", label: "Analyze My Current EPF", screen: "bench" as ScreenId },
  { id: "gap", label: "Calculate My EPF Value Gap", screen: "gap" as ScreenId },
  { id: "bench", label: "Benchmark My Fund", screen: "bench" as ScreenId },
  { id: "fee", label: "Find Fee Savings", screen: "gap" as ScreenId },
  { id: "funds", label: "Find Better Comparable Funds", screen: "compare" as ScreenId },
  { id: "test", label: "Test the Market", screen: "market" as ScreenId },
  { id: "neg", label: "Negotiate My Provider", screen: "market" as ScreenId },
  { id: "meet", label: "Prepare EPF Committee Meeting", screen: "committee" as ScreenId },
  { id: "tender", label: "Run an EPF Tender", screen: "tender" as ScreenId },
  { id: "proposals", label: "Compare Provider Proposals", screen: "tender" as ScreenId },
  { id: "design", label: "Redesign Our EPF", screen: "designer" as ScreenId },
  { id: "outcome", label: "Improve Employee Retirement Outcome", screen: "employees" as ScreenId },
  { id: "risk", label: "Analyze Workforce Retirement Risk", screen: "workforce" as ScreenId },
  { id: "switch", label: "Plan Provider Switching", screen: "switching" as ScreenId },
  { id: "watch", label: "Monitor My EPF", screen: "watch" as ScreenId },
  { id: "report", label: "Prepare Management Report", screen: "reports" as ScreenId },
];

export function answerFor(q: string): { agent: string; a: string; screen: ScreenId; cta: string } {
  const l = q.toLowerCase();
  const ten = baht(wealthDifference(10));
  const rules: [RegExp, string, string, ScreenId, string][] = [
    [
      /fee|cost|pay|expens|saving/,
      "Fee Analyst",
      `All-in cost is 0.30% of assets, ${baht(COMPANY.annualCost)} a year. A best-fit market alternative prices near ${baht(COMPANY.altCost)}. That is about ${baht(COMPANY.feeSaving)} of annual corporate fee opportunity. The qualified fee range is 0.19–0.22%. You can ask Siam Harbor AM to reprice, or test the market without naming the company.`,
      "gap",
      "Open the value gap",
    ],
    [
      /market test|anonymous|test the market/,
      "Procurement Agent",
      `An anonymous market test uses workforce size, assets and requirements only. On the current profile, qualified proposals cluster below ${baht(COMPANY.annualCost)}, with a competitive best-fit near ${baht(COMPANY.altCost)} — about ${baht(COMPANY.feeSaving)} a year. That evidence can support a renegotiation or a tender. It is not a commitment to switch.`,
      "market",
      "Test the market",
    ],
    [
      /shadow|still competitive|no action/,
      "EPF Chief Agent",
      `The shadow market is a virtual tender, not a live bid. On this profile the best-fit cost is about ${baht(COMPANY.altCost)} against ${baht(COMPANY.annualCost)} today. The recommended mission is to negotiate the incumbent. If the price were already inside the observed range, the same engine would say no action.`,
      "shadow",
      "Open the shadow market",
    ],
    [
      /fair price|price discovery|what fee/,
      "Fee Analyst",
      `Public references and EPF24’s sample transaction book are different layers. For this mandate the observed competitive zone sits near 0.19–0.22%, below a 0.30% all-in. The count of observations is shown with the range. It is a prototype book, not a live tape.`,
      "fair",
      "Open Fair Price",
    ],
    [
      /dna|which provider|provider fit|behavior/,
      "Provider Agent",
      `Provider DNA is a behavioral profile: where a firm is strong, how it prices by mandate size, and whether it usually moves when challenged. A league table of returns does not carry that.`,
      "dna",
      "Open Provider DNA",
    ],
    [
      /negotiat|repric|negotiate for me/,
      "Negotiation Agent",
      `Current pricing is 0.30%. The sample book of comparable outcomes sits around 0.19–0.22%. A realistic reprice toward 0.235% is about ${baht(COMPANY.renegotiateSaving)} a year. The negotiation twin can draft the counterproposal. It does not send it without approval.`,
      "nego",
      "Open the negotiation twin",
    ],
    [
      /corporate twin|digital twin|shock|what if we switch|what if fees/,
      "Retirement Agent",
      `The corporate digital twin is the whole fund: workforce, fees, policies and projections. Member twins stay private. Switching, a fee cut, Life Path, a higher match and a market shock are separate simulations.`,
      "twin",
      "Open the corporate twin",
    ],
    [
      /intervention|adequacy|what should we do/,
      "Workforce Analyst",
      `The intervention engine searches contribution, match, default portfolio and education as separate scenarios. Each one shows employer cost beside the adequacy change. There is no single correct answer.`,
      "intervene",
      "Open interventions",
    ],
    [
      /outcome|actually happened|prediction accuracy|learn/,
      "Outcome Engine",
      `A recommendation is not the moat. The moat is the measured result after the decision: predicted saving versus the saving that landed, plus service and participation afterward.`,
      "outcome",
      "Open the outcome engine",
    ],
    [
      /exchange|mandate|liquidity|marketplace bid/,
      "Market Agent",
      `The exchange is a continuous mandate market. An employer can publish assets, headcount and requirements without a name. Qualified providers compete on one format. Every bid feeds the market brain.`,
      "exchange",
      "Open the exchange",
    ],
    [
      /market brain|transaction|knowledge graph|moat/,
      "EPF Intelligence Agent",
      `The market brain connects employer, workforce, contract, fee, offer, negotiation, decision and what happened next. Public factsheets are the base layer. The private layer is the transaction graph.`,
      "brain",
      "Open the market brain",
    ],
    [
      /tender|rfp|auction|bid/,
      "Procurement Agent",
      `The Siam Harbor AM contract ends ${COMPANY.renewal}, ${COMPANY.renewalDays} days out. A tender can standardize fees, policies, service and migration into one format. Cheapest is not best: Krungthep at 0.19% saves about ${baht(COMPANY.cheapestSaving)}, while the best-fit score balances performance, risk, fee, service and employee outcome.`,
      "tender",
      "Start EPF tender",
    ],
    [
      /retire|enough|employee|member twin|my retirement/,
      "Retirement Agent",
      `The sample member twin starts from a current balance and compounds with a deterministic engine. Across the workforce, ${Math.round(COMPANY.onTrack * 100)}% are projected on track for a 60% income-replacement target. The 51+ band is the weakest. Figures are scenarios, not guaranteed returns.`,
      "employees",
      "Open a member twin",
    ],
    [
      /workforce|on track|matching|shortfall/,
      "Workforce Analyst",
      `${Math.round(COMPANY.onTrack * 100)}% of ${COMPANY.members.toLocaleString("en-US")} members are projected on track. Raising employer matching from 5% toward 7% moves younger cohorts most. HR sees aggregates only; groups under 20 members stay hidden.`,
      "workforce",
      "Open workforce health",
    ],
    [
      /perform|return|risk|benchmark/,
      "Performance Analyst",
      `Comparable net return is 3.8% against a 4.6% alternative scenario, a historical difference of 0.8 percentage points. On ${baht(COMPANY.aum)} that is about ${baht(COMPANY.investOpp)} a year, and about ${ten} over 10 years if the spread persisted on current assets. This is an analytical scenario, not a forecast.`,
      "bench",
      "Open the benchmark",
    ],
    [
      /committee|meeting|minute|agenda/,
      "Governance Agent",
      `The Q3 meeting is on 8 Oct. The pack covers performance, the ${baht(COMPANY.annualValue)} value opportunity, fee evidence, Life Path, and a decision: renegotiate or test the market. Minutes, actions and the audit trail stay in Committee AI.`,
      "committee",
      "Open Committee AI",
    ],
    [
      /switch|transition|migrat/,
      "Transition Agent",
      `Winning a tender is not the end. The switching workspace tracks the transition plan, employee communication, data migration and policy mapping. The sample transition is 78% complete. Next mission: employee communication, owned by HR, due 12 October.`,
      "switching",
      "Open switching",
    ],
    [
      /design|life path|contribution|match/,
      "Retirement Agent",
      `A redesign can set employee contributions at 3–15%, tenure-based employer matching, and an architecture of capital preservation, conservative, balanced, growth, global growth and Life Path. The designer compares extra employer cost with projected retirement wealth. It does not pick a universal best fund.`,
      "designer",
      "Open EPF Designer",
    ],
  ];
  const hit = rules.find((r) => r[0].test(l));
  if (hit) return { agent: hit[1], a: hit[2], screen: hit[3], cta: hit[4] };
  return {
    agent: "EPF Intelligence Agent",
    a: `Rattana Group’s annual identified value opportunity is ${baht(COMPANY.annualValue)}: ${baht(COMPANY.feeSaving)} of corporate fee opportunity and ${baht(COMPANY.investOpp)} of employee investment opportunity versus a comparable strategy. Market efficiency is ${meterScore().toFixed(0)}%. The next useful step is an anonymous market test or a repricing brief. All baht figures are scenarios from the deterministic engine.`,
    screen: "home",
    cta: "Back to the value opportunity",
  };
}
