import { COMPANY, PROVIDERS, annualCost, baht, feeLabel, projectMember, wealthDifference, workforceAt, type ScreenId } from "@/lib/model";

export const LAYERS = [
  { k: "1 · Public intelligence", lock: "Base", v: "SEC, ThaiPVD, AMC factsheets, market data. In 2024, 61.2% of employers offered choice and 6.7% offered Life Path." },
  { k: "2 · Transaction intelligence", lock: "Private", v: "Quotations, RFP responses, negotiated fees, concessions, rejected offers, winning proposals." },
  { k: "3 · Provider behavior", lock: "Private", v: "When a provider discounts, where it is strong, and what happens after it wins." },
  { k: "4 · Employer digital twins", lock: "Private", v: "Workforce, contributions, allocation, fees, performance and retirement projections for each client." },
  { k: "5 · Outcome intelligence", lock: "Closed loop", v: "Recommendation, decision, actual result, then the model updates." },
];

export const FLYWHEEL = [
  "Employer joins",
  "AI X-Ray and digital twin",
  "Shadow market",
  "Market test and provider bids",
  "EPF24 records actual pricing",
  "Negotiation records provider behavior",
  "Decision: stay, reprice, or switch",
  "Service, performance and employee outcomes observed",
  "Next employer gets a sharper benchmark",
];

export const TRANSACTIONS = [
  {
    id: "TH-1730",
    chain: "3,200 employees → ฿1.7B → quoted 0.27% → negotiated 0.22% → rival offered 0.19% → stayed and repriced to 0.20%",
    result: "Actual saving ฿1.19M",
    lesson: "The incumbent moved only after a named rival price was on the table.",
  },
  {
    id: "TH-1804",
    chain: "900 employees → ฿280M → quoted 0.34% → challenged → final 0.31%",
    result: "Partial concession",
    lesson: "Below ฿300M this provider rarely leaves the published band.",
  },
  {
    id: "TH-1902",
    chain: "2,100 employees → ฿960M → tender → winning all-in 0.21% → migrated",
    result: "Fee landed on the quote",
    lesson: "Won on service and Life Path, not on being the cheapest.",
  },
  {
    id: "TH-2011",
    chain: "1,500 employees → ฿640M → negotiation only → 0.29% to 0.26%",
    result: "Actual saving below the prediction",
    lesson: "Without a market test, the discount stopped early.",
  },
];

export function fairPriceQuote(aum: number) {
  const bn = aum / 1_000_000_000;
  const mid = 0.00215 - Math.min(0.00028, bn * 0.00008);
  const low = mid - 0.0001;
  const high = mid + 0.0001;
  const publishedLow = Math.max(0.00205, 0.00235 - bn * 0.00004);
  const publishedHigh = publishedLow + 0.0004;
  const currentRate = COMPANY.feeRate;
  const currentCost = annualCost(currentRate, aum);
  const saveLow = currentCost - high * aum;
  const saveHigh = currentCost - low * aum;
  const observations = Math.max(12, Math.round(22 + bn * 18.75));
  return { low, high, mid, publishedLow, publishedHigh, currentRate, currentCost, saveLow, saveHigh, observations };
}

export const DNA: Record<string, { best: string[]; price: string[]; service: string[]; invest: string[]; fit: string }> = {
  sh: {
    best: ["Existing banking relationships", "Plain balanced defaults"],
    price: ["Holds 0.30% until challenged", "Sample book: partial moves toward 0.22–0.24%, rarely to the floor"],
    service: ["SLA mostly met", "Member app use lags", "Education is thin"],
    invest: ["Lower volatility than peers", "No Life Path", "Limited choice"],
    fit: "Adequate for a conservative default. Weak when the employer wants Life Path or a tested price.",
  },
  cp: {
    best: ["Mid-to-large corporates", "Life Path as default", "Bilingual member service"],
    price: ["Competitive above ฿500M", "Moves when a tender is real", "Not the cheapest"],
    service: ["Faster onboarding in the sample book", "Education participation higher than the incumbent"],
    invest: ["Balanced and global both usable", "Drawdown near the peer median"],
    fit: "Best fit for Rattana on the current weights: price, Life Path and employee outcome together.",
  },
  la: {
    best: ["Employers who weight drawdown", "Conservative committees"],
    price: ["Tight but not aggressive below ฿300M", "Stable once a 5-year term is agreed"],
    service: ["Steady SLA", "Digital is capable, not leading"],
    invest: ["Lowest drawdown in the set", "Equity is not the lead"],
    fit: "Fits a committee that will trade a little return for a calmer path.",
  },
  an: {
    best: ["Digital experience", "Global equity"],
    price: ["Less aggressive on fee", "Does not lead with discount"],
    service: ["Strongest app in the set", "Onboarding is fast in the sample"],
    invest: ["Highest recent return", "Deepest drawdown"],
    fit: "Fits a workforce that will use the app and can hold a larger fall.",
  },
  ng: {
    best: ["Simple domestic menus"],
    price: ["Mid pack", "Rarely wins a Life Path mandate"],
    service: ["Adequate", "Thin education"],
    invest: ["Low volatility", "No Life Path"],
    fit: "Drops out when Life Path or a global sleeve is required.",
  },
  kf: {
    best: ["Fee-led tenders", "Large AUM"],
    price: ["Aggressive above ฿1B in the sample book", "0.19% here is a 5-year lock"],
    service: ["Education scores well", "Digital is solid"],
    invest: ["Close to the best-fit return", "Not the calmest drawdown"],
    fit: "Wins when the committee’s weight on fee is high. Cheapest is not the same as best fit.",
  },
};

export const ENGINES: { id: string; name: string; q: string; screen: ScreenId }[] = [
  { id: "brain", name: "Market Brain", q: "What is happening in the market?", screen: "brain" },
  { id: "twin", name: "Digital Twin", q: "What is happening inside this employer?", screen: "twin" },
  { id: "shadow", name: "Shadow Market", q: "What would the market offer this employer today?", screen: "shadow" },
  { id: "outcome", name: "Outcome Engine", q: "What could improve the outcome, and what actually happened?", screen: "outcome" },
];

export const DEFENSE: { capability: string; level: string }[] = [
  { capability: "AI chatbot", level: "Low" },
  { capability: "Fund comparison", level: "Low" },
  { capability: "RFP generator", level: "Low" },
  { capability: "Retirement calculator", level: "Low" },
  { capability: "Public fund database", level: "Medium" },
  { capability: "Employer digital twin", level: "High" },
  { capability: "Proprietary tender history", level: "Very high" },
  { capability: "Fair Price", level: "Very high" },
  { capability: "Provider DNA", level: "Very high" },
  { capability: "Negotiation Twin", level: "Very high" },
  { capability: "Shadow Market", level: "Very high" },
  { capability: "Post-decision outcomes", level: "Extremely high" },
  { capability: "Transaction graph", level: "Extremely high" },
  { capability: "Exchange network", level: "Extremely high" },
];

export const TAPE = ["Asking price", "Bid", "Counterbid", "Final price", "Winner", "Implementation", "Actual outcome"];

export type AgiMode = "single" | "team" | "swarm";

export type AgiStep = { agent: string; task: string; kind: string; screen: ScreenId };

export function agiSteps(mode: AgiMode, competitive: boolean): AgiStep[] {
  const quote = fairPriceQuote(COMPANY.aum);
  const zone = `${feeLabel(quote.low)}–${feeLabel(quote.high)}`;
  const brain: AgiStep = {
    agent: "Market Brain",
    task: competitive
      ? `Observed zone ${zone} across ${quote.observations} anonymized cases. The current 0.30% sits above that tape.`
      : `Observed zone ${zone}. This price is already inside it, so the tape does not support a challenge.`,
    kind: "Transaction tape",
    screen: "brain",
  };
  const twin: AgiStep = {
    agent: "Digital Twin",
    task: `${COMPANY.members.toLocaleString("en-US")} members, ${baht(COMPANY.aum)}, match 5%, on-track 64%. The shortfall is inside the fund, not only in the fee.`,
    kind: "Employer model",
    screen: "twin",
  };
  const shadow: AgiStep = {
    agent: "Shadow Market",
    task: competitive
      ? `Virtual tender: current ${baht(COMPANY.annualCost)}, best fit ${baht(COMPANY.altCost)}, three better-fit alternatives.`
      : "Virtual tender finds no price that beats an arrangement already inside the observed zone.",
    kind: "Virtual tender",
    screen: "shadow",
  };
  const outcome: AgiStep = {
    agent: "Outcome Engine",
    task: "Closed cases keep predicted saving next to the saving that was actually booked. This employer’s result is still open.",
    kind: "Closed loop",
    screen: "outcome",
  };
  const core = [brain, twin, shadow, outcome];
  if (mode === "single") return [brain];
  if (mode === "team") return core;
  return [
    ...core,
    {
      agent: "Intervention",
      task: "Search match, Life Path, contribution and fee cases. Present the trade. Do not pick a universal winner.",
      kind: "Scenario search",
      screen: "intervene",
    },
    {
      agent: "Independent Challenger",
      task: `Separate the ${baht(COMPANY.feeSaving)} fee comparison from the ${baht(COMPANY.investOpp)} investment scenario. Do not add them and call the sum cash.`,
      kind: "Disproof",
      screen: "cio",
    },
    {
      agent: "Autonomous CIO",
      task: competitive
        ? "Choose among negotiate, market-test, redesign, switch, or do nothing. Hold the pack for a person."
        : "The evidence supports no action. Hold that conclusion for a person.",
      kind: "Human still decides",
      screen: "cio",
    },
  ];
}

export function agiVerdict(competitive: boolean) {
  if (!competitive) {
    return {
      action: "No action",
      body: "Current arrangement remains competitive. A tender would spend committee time to confirm what the transaction tape already shows.",
      paying: "No",
      outcomes: "Unchanged",
      alternatives: "None that clear the current price",
    };
  }
  return {
    action: "Negotiate",
    body: `The company is paying about ${baht(COMPANY.feeSaving)} a year above the best-fit price. Employee outcomes are 64% on track. Three better-fit alternatives sit in the shadow market. A switch is not required to start.`,
    paying: `Yes · ${baht(COMPANY.feeSaving)} / year`,
    outcomes: "64% on track · 36% short of the 60% replacement target",
    alternatives: "3 better-fit providers",
  };
}

export type TwinId = "switch" | "fee20" | "fee25" | "life" | "match" | "shift" | "shock" | "contrib2";

export function twinRun(id: TwinId) {
  const ten = wealthDifference(10);
  const fee20 = COMPANY.annualCost * 0.2;
  const match = workforceAt(7);
  const shocked = COMPANY.aum * 0.7;
  if (id === "switch") {
    return {
      title: "Switch to the best-fit provider",
      lines: [
        `Corporate cost ${baht(COMPANY.annualCost)} → ${baht(COMPANY.altCost)}`,
        `Fee saving ${baht(COMPANY.feeSaving)} / year`,
        `Investment scenario +0.80 point, ${baht(COMPANY.investOpp)} / year`,
        `Illustrative 10-year employee wealth difference ${baht(ten)}`,
      ],
      note: "Adequacy does not jump just because the name on the contract changes. The return gap is a scenario, not a promise.",
    };
  }
  if (id === "fee20") {
    return {
      title: "Fees fall 20%",
      lines: [`Corporate cost falls by ${baht(fee20)} / year`, "Employee contribution and match unchanged", "Retirement adequacy unchanged in this case"],
      note: "A fee cut is a corporate saving. It does not, by itself, repair a contribution or default-policy gap.",
    };
  }
  if (id === "life") {
    return {
      title: "Add Life Path as the default",
      lines: ["Employer fee cost unchanged in this case", "71% of members are in Balanced by inertia", "Planning assumption: on-track rate 64% → 70%"],
      note: "The +6 point adequacy figure is a planning assumption for a default change, not a measured outcome.",
    };
  }
  if (id === "match") {
    return {
      title: "Employer match 5% → 7%",
      lines: [`Additional employer cost ${baht(match.cost)} / year`, `On-track rate ${match.onPct.toFixed(0)}%`, `Members moved on track +${match.moved}`],
      note: "Cost and on-track rate come from the same workforce engine as Retirement Intelligence. Most of the lift is under age 40.",
    };
  }
  if (id === "shift") {
    return {
      title: "30% of members move from fixed income toward Life Path",
      lines: ["No employer cost increase", "Planning assumption: on-track rate 64% → 68%", "Risk rises for the members who move"],
      note: "This is a mix-shift scenario. It is not a forecast of who will actually switch.",
    };
  }
  if (id === "fee25") {
    const cut = COMPANY.annualCost * 0.25;
    return {
      title: "Fees fall 25%",
      lines: [`Corporate cost falls by ${baht(cut)} / year`, "Employee contribution and match unchanged", "Retirement adequacy unchanged in this case"],
      note: "A larger fee cut is still a corporate saving. It does not repair a contribution or default-policy gap.",
    };
  }
  if (id === "contrib2") {
    const sample = { age: 34, retireAge: 60, balance: 1_280_000, salaryMonthly: 32_000, employer: 5, growth: 3, infl: 2, policy: "bal", scenario: "base" as const };
    const now = projectMember({ ...sample, contrib: 3 });
    const next = projectMember({ ...sample, contrib: 5 });
    return {
      title: "Employees contribute another 2 points",
      lines: ["Employer cost unchanged", `Sample member at 60: ${baht(now.bal)} → ${baht(next.bal)}`, `Difference ${baht(next.bal - now.bal)} on that one member`],
      note: "Calculated for the sample member used elsewhere: age 34, balance ฿1.28M, salary ฿32,000, balanced policy, base scenario. It is not a workforce-wide adequacy forecast.",
    };
  }
  return {
    title: "A 30% market fall, applied once",
    lines: [`Assets ${baht(COMPANY.aum)} → ${baht(shocked)} in the stress step`, "Contributions continue", "Planning assumption: on-track rate 64% → 51% in the following year"],
    note: "One-step stress on current assets. It is not a replay of any named crisis and not a recovery path.",
  };
}

export function interventions() {
  const mild = workforceAt(6);
  const full = workforceAt(7);
  const fee = COMPANY.feeSaving;
  return [
    { name: "Increase matching 5% → 7%", cost: full.cost, from: 64, to: full.onPct, kind: "Calculated" },
    { name: "Increase matching 5% → 6%", cost: mild.cost, from: 64, to: mild.onPct, kind: "Calculated" },
    { name: "Redesign the default to Life Path", cost: 600_000, from: 64, to: 70, kind: "Planning assumption" },
    { name: "Life Path plus a behavioral programme", cost: 1_200_000, from: 64, to: 72, kind: "Planning assumption" },
    { name: "Fee reprice plus Life Path", cost: 600_000 - fee, from: 64, to: 70, kind: "Fee calculated, adequacy assumed" },
  ];
}

export const OUTCOMES = [
  { id: "TH-1844", predicted: 1_050_000, actual: 940_000, decision: "Repriced the incumbent", after: "Service SLA held. Participation unchanged." },
  { id: "TH-1902", predicted: 880_000, actual: 880_000, decision: "Switched provider", after: "All-in fee matched the quote. SLA met 11 of 12 months." },
  { id: "TH-2011", predicted: 620_000, actual: 410_000, decision: "Negotiated without a market test", after: "Discount stopped early. Prediction was too high." },
  { id: "TH-2118", predicted: 1_400_000, actual: 1_260_000, decision: "Tender, then stayed", after: "Incumbent met the rival zone. Migration cost avoided." },
];

export function accuracy(predicted: number, actual: number) {
  return Math.round((1 - Math.abs(predicted - actual) / predicted) * 1000) / 10;
}

export const MANDATES = [
  { id: "TH-24821", aum: 2_800_000_000, employees: 5200, policies: 8, life: true, global: true, target: 0.002, bids: [0.0018, 0.0019, 0.0021, 0.0022, 0.0024], current: 0.0029 },
  { id: "TH-24702", aum: 1_400_000_000, employees: 2800, policies: 6, life: true, global: false, target: 0.0022, bids: [0.0019, 0.0021, 0.0022, 0.0025], current: 0.0028 },
  { id: "EPF-8921", aum: 1_800_000_000, employees: 3400, policies: 6, life: true, global: true, target: 0.002, bids: [0.0018, 0.002, 0.0021, 0.0023], current: 0.0026 },
];

export function mandateMarket(m: (typeof MANDATES)[number]) {
  const bids = [...m.bids].sort((a, b) => a - b);
  const best = bids[0];
  const median = bids.length % 2 ? bids[(bids.length - 1) / 2] : (bids[bids.length / 2 - 1] + bids[bids.length / 2]) / 2;
  const saving = (m.current - best) * m.aum;
  return { best, median, saving, n: bids.length };
}

export const SHADOW_ALTS = ["cp", "la", "kf"].map((id) => PROVIDERS.find((p) => p.id === id)!);
