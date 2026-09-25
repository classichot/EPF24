const PAGES: Record<string, string> = {
  "Provident-fund companies and pooled products.": "This is the market list of companies licensed to provide provident-fund services, plus pooled product names from the register. Employer funds are not on this page. Life Path and RMF tags describe the company, not a return. No performance figure here is invented for a real fund.",
  "Employers with a registered provident fund.": "This is the employer register, in English, moved off the company list so the two are not mixed. Search still matches the original Thai name. A row is a registered fund name, not a bid, a fee, or a recommendation to switch.",
  "Best fit for this workforce, not a universal winner.": "You weight what matters for this employer. The ranking follows those weights. The cheapest provider is not automatically the best fit. The providers on this comparison are the sample book, not live quotations.",
  "Your EPF versus the relevant market.": "The benchmark places this employer’s fund against comparable arrangements. Upload the agreement and fee schedule before treating a gap as fact. Until then, the figures are the Rattana sample scenario.",
  "How much value is the current fund leaving on the table?": "One annual figure, split into the employer’s fee difference and the members’ investment scenario. Those two are not a guaranteed saving. The 10-year wealth line is compound math on the stated returns, not a forecast.",
  "Price the market before you promise to move.": "An anonymous profile asks providers what they would charge before the company is named. Use the result to renegotiate or to open a tender. The tape on this screen is the sample book.",
  "From requirements to a committee decision.": "The tender turns the employer’s requirements into one format so proposals can be compared. The committee sets the weights. The lowest fee does not win by itself.",
  "Employers and providers, on one standard.": "Marketplace submissions are restated into the same fields. Order is alphabetical. A listing is not a ranking and a portal fee does not change the analysis.",
  "Continuous monitoring. Exceptions only.": "Watch compares the fund with thresholds the committee already set, and surfaces the exceptions. It is a monitoring list, not a new recommendation to switch.",
  "Secretary, analyst and memory for the committee.": "The meeting pack is drafted from the fund record. Decisions and actions stay attached to the meeting. Nothing is sent to a provider until a person releases it.",
  "Will I have enough when I retire?": "One member’s projection: contribution, match, return and retirement age. The chart is calculated. The sentences around it explain the chart. It is not a promise of a future balance.",
  "Is the workforce on track?": "Member projections rolled up into bands. HR sees the share on track, not individual balances. Small groups stay hidden. The shortfall is a projection against the income-replacement target.",
  "Design the fund around the workforce.": "Contribution, match and default policy are design choices. The page shows employer cost and projected member wealth side by side so a richer match is not confused with a fee cut.",
  "Changing provider is a managed transition.": "A better comparison is not a completed switch. This page holds the plan, the owners and the open items so the move can be tracked. No action is also a valid outcome.",
  "The intelligence and exchange layer.": "AGI mode runs missions on the fund record. The engines calculate. The model explains and can stop at “the current arrangement is still competitive.” A person still decides.",
  "The fund’s document record.": "Contracts, fee schedules, factsheets and minutes live here. A reviewed file is source material for the fee and committee screens. It is not itself a market price.",
  "Reports for the CFO, the board and the committee.": "Each report restates the same scenario in the language of that reader. Generating one does not create a new number. The baht figures stay the ones already on the dashboard.",
  "Trust, methodology and the workspace.": "How the workspace treats fees, returns and decisions. Published SEC fees, negotiated contract fees, and EPF24 calculations stay in separate lanes.",
  "Pay less. Earn more.": "Two results, kept apart. The employer number is the negotiated fee gap. The employee number is an investment scenario. They are not added into one guaranteed outcome.",
  "Every baht in the contract, with its clause.": "The lines are the negotiated schedule from the employer’s file. A published factsheet fee is a different lane and is not added into this total.",
  "Change one assumption. The baht figure moves.": "Move fee, growth or the return spread and the scenario recalculates. Employer saving and member wealth stay separate. The sliders do not fetch a live market price.",
  "SEC Open Data is the raw layer.": "The gateway shows which public sources exist and which are connected. The page does not call the SEC. A published fee here is not the price this employer negotiated.",
  "The SEC provident-fund API is the market feed. The page does not call it.": "The connector syncs SEC datasets into a raw store, then into EPF24’s own model. This page shows that pipeline and the sample-book scores. Scores marked as calculations are not SEC sentences. Concentration and foreign exposure stay blank until those datasets are pinned.",
  "One action, not fifty alerts.": "Agents watch the fund and argue toward one next action. A challenger can reject the move. The conclusion can be to keep the current provider.",
  "The transaction graph is the moat.": "Public returns are the base. The private layer is what employers were offered, what they negotiated, and what they chose. That tape is the sample book in this build.",
  "A virtual tender, running without a letter to anyone.": "A shadow test prices the mandate without contacting providers. Sometimes the result is to do nothing. It is not an instruction that has been sent.",
  "What this mandate has actually cleared.": "Fair price shows a published range and the observed EPF24 range separately. They are never blended. The observed range is the sample negotiation book, not a live tape of 1,000 companies.",
  "Which provider fits which employer.": "Provider DNA is behavior and fit, not a single return. The sample firms are fictional. Do not read these notes as a judgment of a named real manager.",
  "What this provider has accepted before.": "The negotiation range comes from how a comparable mandate moved in the sample book. The draft letter is not sent until someone approves it.",
  "The whole fund, not one member.": "The corporate twin is the employer’s fund: assets, fees, policy and workforce. Member twins stay private. Each shock is a separate simulation.",
  "What should we do about the shortfall?": "The shortfall is the share of members projected below the income-replacement target. Interventions show the trade, including a path that does not require a large new match.",
  "What actually happened after the decision.": "The outcome engine looks at what followed a fee cut, a switch, or a decision to stay. Without a history tape, a model cannot answer this. The rows here are the sample record.",
  "A continuous market for mandates.": "The exchange is an anonymous mandate, one submission format, and a tape of ask, bid, counter and winner. It is not a request for a brochure.",
};

const HOME = "The dashboard is the open question for this fund: is it still competitive. The annual figure splits a fee difference for the employer from an investment scenario for members. Both are the Rattana sample book. Advisor mode reads the same file as a client mandate. Corporate mode reads it as the company’s own fund.";

export function pageExplain(title: string, lede?: string) {
  if (PAGES[title]) return PAGES[title];
  if (title.includes("provident fund is still competitive")) return HOME;
  return lede || `This page is “${title}”. Figures are scenarios from the sample book unless a line says they are SEC-reported or taken from the employer’s own file.`;
}

const PLAYBOOKS: Record<string, string[]> = {
  "Provident-fund companies and pooled products.": [
    "Scan the company cards for Life Path and RMF for PVD.",
    "Use the pooled-product table when the question is a product name, not an employer.",
    "Open Employers if the name is a company’s own fund.",
    "Do not read a card as a performance ranking.",
  ],
  "Employers with a registered provident fund.": [
    "Search in English, or paste the Thai register name.",
    "Confirm the row is an employer fund, not a pooled product.",
    "Take the name back to the open mandate. This list does not price the fund.",
  ],
  "Best fit for this workforce, not a universal winner.": [
    "Set the priority weights for this workforce before reading the rank.",
    "Compare at most three providers at a time.",
    "Check fee, fit and service together. Discard a winner that is only the cheapest.",
    "Record whether the next step is a reprice or a market test.",
  ],
  "Your EPF versus the relevant market.": [
    "Load the agreement, factsheets and fee schedule.",
    "Read the fund against the peer set, not against a single headline return.",
    "Separate a fee gap from a return gap before taking either number to the committee.",
  ],
  "How much value is the current fund leaving on the table?": [
    "Read the employer fee difference and the member wealth difference as two lines.",
    "Check the drivers: fee, return, risk, service, choice, participation.",
    "Take one number to the CEO conversation, with the label that it is a scenario.",
  ],
  "Price the market before you promise to move.": [
    "Build the anonymous profile. Leave the company name off it.",
    "Send the profile, then read the responses against the incumbent.",
    "Choose one path: renegotiate, open a tender, or take no action.",
  ],
  "From requirements to a committee decision.": [
    "Lock the requirements and the committee weights before proposals arrive.",
    "Restate every proposal into the same fields.",
    "Score with the weights. Do not let the lowest fee decide alone.",
    "Minute the decision, including a decision to stay.",
  ],
  "Employers and providers, on one standard.": [
    "Read submissions in the shared fields, not in each firm’s own brochure order.",
    "Ignore listing position. It is alphabetical.",
    "Move a shortlist into Compare or the tender. Do not treat the marketplace as the decision.",
  ],
  "Continuous monitoring. Exceptions only.": [
    "Confirm the thresholds the committee already set.",
    "Open only the rows that breached a threshold.",
    "Attach an owner and a date. A quiet page means nothing crossed the line.",
  ],
  "Secretary, analyst and memory for the committee.": [
    "Review the drafted pack against the fund record.",
    "Edit the decision and the actions in the meeting, not in a side note.",
    "Release nothing to a provider until the secretary signs it out.",
  ],
  "Will I have enough when I retire?": [
    "Set retirement age, contribution and the scenario.",
    "Read the projected balance against the income-replacement target.",
    "Change one input at a time so the member can see what moved.",
  ],
  "Is the workforce on track?": [
    "Start with the share below the 60% income-replacement target.",
    "Open the weak band. Do not open individual balances.",
    "Take the shortfall to Intervention if a design change is the question.",
  ],
  "Design the fund around the workforce.": [
    "Set contribution, match by tenure, and the default policy.",
    "Read employer cost and projected member wealth on the same design.",
    "Keep a fee cut and a richer match as separate decisions.",
  ],
  "Changing provider is a managed transition.": [
    "Start from an accepted decision to move, not from a comparison alone.",
    "Assign an owner to each open item.",
    "Keep the current provider in place until the checklist is clear.",
  ],
  "The intelligence and exchange layer.": [
    "Pick the mission that matches the decision in front of the committee.",
    "Run it and read the drivers, the data lane, and the risks.",
    "Accept a result that says the current arrangement is still competitive.",
    "A person releases any letter. The mission does not.",
  ],
  "The fund’s document record.": [
    "Upload the agreement, the fee schedule and the latest factsheet.",
    "Wait until the file is marked reviewed before using it downstream.",
    "Treat the file as source material for Fee X-Ray and the committee pack.",
  ],
  "Reports for the CFO, the board and the committee.": [
    "Pick the reader. Do not write a new set of numbers.",
    "Generate the report from the dashboard scenario.",
    "Check that fee opportunity and member wealth are still labeled separately.",
  ],
  "Trust, methodology and the workspace.": [
    "Read which lane a number belongs to: SEC, the contract, or an EPF24 calculation.",
    "Keep negotiated fees out of the published-fee store.",
    "Use Admin to confirm the workspace, not to invent a return.",
  ],
  "Pay less. Earn more.": [
    "Read the employer fee gap first.",
    "Read the member wealth scenario second. Do not add them into one promise.",
    "Open Fee X-Ray for the contract lines, or Value Gap for the committee number.",
  ],
  "Every baht in the contract, with its clause.": [
    "Start from the uploaded fee schedule, not from a factsheet.",
    "Check each line against its clause.",
    "Keep any published fee beside this total, not inside it.",
  ],
  "Change one assumption. The baht figure moves.": [
    "Move one slider.",
    "Read the employer saving and the member wealth as separate results.",
    "Reset before changing a second assumption, so the cause stays clear.",
  ],
  "SEC Open Data is the raw layer.": [
    "See which source is loaded and which is still waiting for a key.",
    "Do not expect this page to call the SEC.",
    "When a published fee appears, leave the negotiated fee in the contract lane.",
  ],
  "The SEC provident-fund API is the market feed. The page does not call it.": [
    "Read the pipeline from the SEC API down to the mission.",
    "Check the connector status before trusting a market figure.",
    "Use sample-book scores only where the source line says EPF24 calculated them.",
    "Leave concentration and foreign exposure blank until those datasets are pinned.",
  ],
  "One action, not fifty alerts.": [
    "Read the single recommended action.",
    "Read the challenger. If it knocks the action down, stop.",
    "Accept “no action” when the current arrangement still holds.",
  ],
  "The transaction graph is the moat.": [
    "Separate the public return layer from the private negotiation tape.",
    "Ask what employers were offered, what they accepted, and what followed.",
    "Do not treat this sample tape as a live market.",
  ],
  "A virtual tender, running without a letter to anyone.": [
    "Run the shadow test on the open mandate.",
    "Read the clearing range.",
    "If the incumbent is already inside it, record no action. Send no letter.",
  ],
  "What this mandate has actually cleared.": [
    "Read the published range and the EPF24 range as two numbers.",
    "Do not average them.",
    "Use the EPF24 range only as the sample negotiation book for this size of mandate.",
  ],
  "Which provider fits which employer.": [
    "Match the workforce and the service need before the return.",
    "Drop a provider whose strength is a different kind of employer.",
    "Keep the notes inside the sample book. Do not apply them to a named real firm.",
  ],
  "What this provider has accepted before.": [
    "Read the range this firm has moved to on comparable mandates.",
    "Draft the counterproposal inside that range.",
    "Leave it unsent until the committee secretary releases it.",
  ],
  "The whole fund, not one member.": [
    "Run one shock: fees, a switch, Life Path, the match, or a market move.",
    "Read the fund-level result. Member balances stay hidden.",
    "Run the next shock only after the first result is noted.",
  ],
  "What should we do about the shortfall?": [
    "Start from the share of members below the target.",
    "Lay out the interventions, including the one that does not raise the match sharply.",
    "Cost each path before choosing one.",
  ],
  "What actually happened after the decision.": [
    "Pick a past decision: fee cut, switch, or stay.",
    "Read what the fund and the members did afterward.",
    "If the tape is only the sample record, say so before using it in a meeting.",
  ],
  "A continuous market for mandates.": [
    "Post the mandate without the company name.",
    "Take bids in one format.",
    "Read ask, bid, counter and the winner on the tape before any award.",
  ],
};

const HOME_PLAYBOOK = [
  "Read the annual gap. Split the employer fee line from the member wealth line.",
  "Open the question that matters: benchmark, value gap, workforce, or a market test.",
  "In advisor mode, treat the file as the open client. In corporate mode, treat it as your own fund.",
  "Stop if the current arrangement is still competitive. The dashboard does not require a switch.",
];

export function pagePlaybook(title: string) {
  if (PLAYBOOKS[title]) return PLAYBOOKS[title];
  if (title.includes("provident fund is still competitive")) return HOME_PLAYBOOK;
  return [
    "Read the headline and the source line before the first number.",
    "Separate a SEC figure, a contract figure, and an EPF24 calculation.",
    "Decide the next step, including the option to leave the current arrangement in place.",
  ];
}
