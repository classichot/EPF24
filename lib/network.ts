import { COMPANY, PROVIDERS, feeLabel, wealthDifference, type Provider } from "@/lib/model";

/** Planning cash rate used only for the sample-book Sharpe. Not a live BOT fix. */
const CASH = 0.02;

export const NETWORK_LAYERS: { k: string; lock: string; v: string }[] = [
  { k: "1 · SEC Intelligence", lock: "Public base", v: "Fifteen SEC PVD datasets: managers, funds, policy, returns, published fees, allocation, statistics, top holdings and monthly NAV. Free for commercial and personal use. Synced by a worker into a raw store, then snapshotted. This layer is the backbone, not the moat." },
  { k: "2 · Market Intelligence", lock: "Calculated", v: "Connect a portfolio to SET, ThaiBMA, BOT and benchmark series, then measure alpha, volatility, Sharpe, drawdown, consistency and fee-adjusted return. Those series are not connected yet." },
  { k: "3 · Corporate private", lock: "Private", v: "The employer’s contract, fee schedule, headcount, assets, contributions, policies, invoices and SLA. SEC does not publish the price a company actually negotiated." },
  { k: "4 · Tender network", lock: "Moat", v: "Anonymized quotations and negotiated fees from market tests. Fair Fee is this book, not a published factsheet. It gets sharper as more employers run a test." },
  { k: "5 · AI fund intelligence", lock: "Explains", v: "The engines calculate. AI states the comparison in baht: fee saving for the employer, wealth difference for members, and whether the current arrangement is still competitive." },
];

export const SEC_CATALOG: { field: string; lane: string; status: string }[] = [
  { field: "PVD providers / AMCs", lane: "SEC Open Data", status: "API exists · key not connected" },
  { field: "Fund list", lane: "SEC Open Data", status: "API exists · key not connected" },
  { field: "Investment policy", lane: "SEC Open Data", status: "Pooled and master pooled factsheets" },
  { field: "Historical return", lane: "SEC Open Data", status: "API exists · key not connected" },
  { field: "Management fee / total expense", lane: "SEC Open Data", status: "Published fee, not the negotiated fee" },
  { field: "Asset allocation", lane: "SEC Open Data", status: "API exists · key not connected" },
  { field: "Top asset classes", lane: "SEC Open Data", status: "API exists · key not connected" },
  { field: "Top securities", lane: "SEC Open Data", status: "API exists · key not connected" },
  { field: "Monthly NAV", lane: "SEC Open Data", status: "API exists · key not connected" },
  { field: "Industry statistics", lane: "SEC Open Data", status: "API exists · key not connected" },
  { field: "Fund comparison", lane: "EPF24", status: "Calculated on the sample book" },
  { field: "Risk-adjusted performance", lane: "EPF24", status: "Calculated on the sample book" },
  { field: "Fee efficiency", lane: "EPF24", status: "Calculated on the sample book" },
  { field: "Peer ranking", lane: "EPF24", status: "Calculated on the sample book" },
  { field: "Negotiated corporate fee", lane: "Private contract", status: "Not in SEC" },
  { field: "Admin fee quoted to one employer", lane: "Private contract", status: "Not in SEC" },
  { field: "RFP / quotation", lane: "Tender network", status: "Sample book only" },
  { field: "Service quality / SLA", lane: "Private", status: "Not in SEC" },
  { field: "Employer-specific contract terms", lane: "Private", status: "Not in SEC" },
];

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function sharpe(provider: Provider) {
  return (provider.r5 / 100 - CASH) / (provider.vol / 100);
}

function feeAdjusted(provider: Provider) {
  return provider.r5 - provider.fee * 100;
}

export function sampleFundIntelligence(id = COMPANY.providerId) {
  const fund = PROVIDERS.find((provider) => provider.id === id) ?? PROVIDERS[0];
  const peers = PROVIDERS.filter((provider) => provider.id !== fund.id);
  const peerReturn = median(peers.map((provider) => provider.r5));
  const peerFee = median(peers.map((provider) => provider.fee));
  const peerSharpe = median(peers.map(sharpe));
  const peerAdjusted = median(peers.map(feeAdjusted));
  const peerDrawdown = median(peers.map((provider) => provider.dd));
  const ownSharpe = sharpe(fund);
  const ownAdjusted = feeAdjusted(fund);
  const returnVsPeer = fund.r5 >= peerReturn ? "at or above" : "below";
  const feeVsPeer = fund.fee <= peerFee ? "at or below" : "above";
  return {
    fund,
    peerReturn,
    peerFee,
    peerSharpe,
    peerAdjusted,
    peerDrawdown,
    ownSharpe,
    ownAdjusted,
    cash: CASH,
    ten: wealthDifference(10),
    analysis: `In the sample book, the 5-year return is ${returnVsPeer} the peer median and the all-in fee is ${feeVsPeer} the peer median. Sharpe uses a ${feeLabel(CASH)} planning cash rate and is ${ownSharpe >= peerSharpe ? "at or above" : "below"} the peer median. These providers are fictional. The sentence is the comparison, not a forecast and not an SEC factsheet.`,
  };
}

function clampScore(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function epfScores(id = COMPANY.providerId) {
  const sample = sampleFundIntelligence(id);
  const peerVol = median(PROVIDERS.filter((provider) => provider.id !== sample.fund.id).map((provider) => provider.vol));
  const rank = [...PROVIDERS].sort((a, b) => b.r5 - a.r5).findIndex((provider) => provider.id === sample.fund.id) + 1;
  return [
    { metric: "Return score", value: String(clampScore(50 + (sample.fund.r5 - sample.peerReturn) * 20)), source: "EPF24 calculation · sample book" },
    { metric: "Fee score", value: String(clampScore(50 + (sample.peerFee - sample.fund.fee) * 10000)), source: "EPF24 calculation · sample book" },
    { metric: "Risk score", value: String(clampScore(50 + (peerVol - sample.fund.vol) * 8)), source: "EPF24 calculation · sample book" },
    { metric: "Peer percentile", value: `${rank} of ${PROVIDERS.length} on 5Y return`, source: "EPF24 calculation · sample book" },
    { metric: "Risk-adjusted return", value: sample.ownSharpe.toFixed(2), source: "EPF24 calculation · sample book · cash rate 2%" },
    { metric: "Drawdown", value: `${sample.fund.dd.toFixed(1)}%`, source: "EPF24 calculation · sample book" },
    { metric: "Volatility", value: `${sample.fund.vol.toFixed(1)}%`, source: "EPF24 calculation · sample book" },
    { metric: "Consistency", value: "—", source: "Needs a benchmark series" },
    { metric: "Concentration", value: "—", source: "Needs SEC dataset 11" },
    { metric: "Foreign exposure", value: "—", source: "Needs SEC dataset 12" },
  ];
}
