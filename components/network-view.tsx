"use client";

import { useEffect, useState } from "react";
import { PageHead as Head } from "@/components/page-head";
import { COMPANY, baht, feeLabel, type ScreenId } from "@/lib/model";
import { fairPriceQuote } from "@/lib/moat";
import { NETWORK_LAYERS, SEC_CATALOG, epfScores, sampleFundIntelligence } from "@/lib/network";
import { CANONICAL_CHAIN, DATA_TIERS, PIPELINE, RAW_STORE, SEC_PVD_DATASETS } from "@/lib/sec-pvd";

export function NetworkScreen({ goto }: { goto: (id: ScreenId) => void }) {
  const intel = sampleFundIntelligence();
  const scores = epfScores();
  const fair = fairPriceQuote(COMPANY.aum);
  const fund = intel.fund;
  const [connector, setConnector] = useState("Checking the SEC connector…");
  const [snapshots, setSnapshots] = useState(0);
  useEffect(() => {
    fetch("/api/sec/status")
      .then((response) => response.json())
      .then((body: { message?: string; snapshots?: number }) => {
        setConnector(body.message || "Connector is ready.");
        setSnapshots(body.snapshots ?? 0);
      })
      .catch(() => setConnector("Connector is ready. The subscription key is not set."));
  }, []);
  return (
    <>
      <Head
        k="Provident Fund Intelligence Network"
        title="The SEC provident-fund API is the market feed. The page does not call it."
        lede="SEC Open Data is free for commercial and personal use. A worker syncs the 15 PVD datasets into a raw store, then into EPF24’s own model. Published fees stay in that store. The employer’s negotiated fee stays in the private tier."
      />
      <div className="surface">
        <h6 style={{ marginTop: 0 }}>SEC connector</h6>
        <p style={{ margin: 0 }}>{connector} Raw responses go into {RAW_STORE} and are kept by effective date and retrieval time. This store has {snapshots} snapshot{snapshots === 1 ? "" : "s"}. Nothing is overwritten. The older portal’s limit was 3,000 calls per 300 seconds, so the worker syncs and the page does not.</p>
      </div>
      <h6>Canonical model</h6>
      <div className="rule">
        {CANONICAL_CHAIN.map((step, i) => (
          <div key={step} style={{ display: "grid", gridTemplateColumns: "28px 1fr", gap: 8, padding: "8px 0", borderBottom: "1px solid var(--color-divider)" }}>
            <b>{String(i + 1).padStart(2, "0")}</b><span>{step}</span>
          </div>
        ))}
      </div>
      <h6>Pipeline</h6>
      <div className="rule">
        {PIPELINE.map((step, i) => (
          <div key={step} style={{ display: "grid", gridTemplateColumns: "28px 1fr", gap: 8, padding: "8px 0", borderBottom: "1px solid var(--color-divider)" }}>
            <b>{String(i + 1).padStart(2, "0")}</b><span>{step}</span>
          </div>
        ))}
      </div>
      <div className="mission-grid">
        {NETWORK_LAYERS.map((layer) => (
          <article key={layer.k} className="mcard">
            <div className="mcard-id">{layer.lock}</div>
            <div className="mcard-title">{layer.k.replace(/^\d+ · /, "")}</div>
            <p>{layer.v}</p>
          </article>
        ))}
      </div>
      <h6>Three data tiers</h6>
      <div className="mission-grid">
        {DATA_TIERS.map((tier, i) => (
          <article key={tier.k} className="mcard">
            <div className="mcard-id">{String(i + 1).padStart(2, "0")}</div>
            <div className="mcard-title">{tier.k}</div>
            <p>{tier.v}</p>
          </article>
        ))}
      </div>
      <h6>SEC PVD datasets <span className="muted">{SEC_PVD_DATASETS.length}</span></h6>
      <div className="scroll">
        <table className="table">
          <thead><tr><th>Dataset</th><th>EPF24 use</th><th>Status</th></tr></thead>
          <tbody>
            {SEC_PVD_DATASETS.map((dataset) => (
              <tr key={dataset.id}>
                <td style={{ fontWeight: 600 }}>{dataset.id} · {dataset.name}</td>
                <td>{dataset.use}</td>
                <td>Path not pinned</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h6>Kept out of the SEC file</h6>
      <table className="table">
        <thead><tr><th>Field</th><th>Where it lives</th></tr></thead>
        <tbody>
          {SEC_CATALOG.filter((row) => row.lane !== "SEC Open Data" && row.lane !== "EPF24").map((row) => (
            <tr key={row.field}>
              <td style={{ fontWeight: 600 }}>{row.field}</td>
              <td>{row.lane} · {row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h6>Sample fund · {fund.name}</h6>
      <p className="muted">Schema: Fund → Policy → Manager → Return → Fee → Risk. Filled from the fictional provider book, because the SEC subscription is not connected and a real fund name is not given an invented return.</p>
      <div className="stats">
        <div className="stat"><span className="muted">5Y return</span><b>{fund.r5.toFixed(1)}%</b><span className="muted">Peer median {intel.peerReturn.toFixed(1)}%</span></div>
        <div className="stat"><span className="muted">All-in fee</span><b>{feeLabel(fund.fee)}</b><span className="muted">Peer median {feeLabel(intel.peerFee)}</span></div>
        <div className="stat"><span className="muted">Sharpe</span><b>{intel.ownSharpe.toFixed(2)}</b><span className="muted">Peer median {intel.peerSharpe.toFixed(2)}</span></div>
        <div className="stat"><span className="muted">Fee-adjusted 5Y</span><b>{intel.ownAdjusted.toFixed(2)}%</b><span className="muted">Peer median {intel.peerAdjusted.toFixed(2)}%</span></div>
        <div className="stat"><span className="muted">Max drawdown</span><b>{fund.dd.toFixed(1)}%</b><span className="muted">Peer median {intel.peerDrawdown.toFixed(1)}%</span></div>
      </div>
      <h6>Scores SEC does not publish</h6>
      <table className="table">
        <thead><tr><th>Metric</th><th>Value</th><th>Source</th></tr></thead>
        <tbody>
          {scores.map((score) => (
            <tr key={score.metric}>
              <td style={{ fontWeight: 600 }}>{score.metric}</td>
              <td>{score.value}</td>
              <td className="muted">{score.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="ink">
        <span className="eyebrow">EPF24 analysis · not an SEC sentence</span>
        <span>{intel.analysis} For {COMPANY.name}, the negotiated cost is {baht(COMPANY.annualCost)} a year against a best-fit cost of {baht(COMPANY.altCost)}. The fee difference is {baht(COMPANY.feeSaving)} a year. The 10-year member wealth difference on the stated return assumptions is {baht(intel.ten)}. SEC factsheets are not loaded, so this is not an SEC comparison.</span>
      </div>
      <h6>Savings and return opportunity · {COMPANY.name}</h6>
      <p className="muted">{COMPANY.members.toLocaleString("en-US")} employees · {baht(COMPANY.aum)} assets · current provider {COMPANY.provider}. SEC historical returns and published fees are not loaded. The lines below are the sample file and EPF24 calculations.</p>
      <div className="stats">
        <div className="stat"><span className="muted">Current annual fund cost</span><b>{baht(COMPANY.annualCost)}</b><span className="muted">Corporate private data · negotiated contract</span></div>
        <div className="stat"><span className="muted">Comparable lower-cost option</span><b>{baht(COMPANY.altCost)}</b><span className="muted">EPF24 calculation · sample book, not an SEC fee</span></div>
        <div className="stat"><span className="muted">Potential cost difference</span><b>{baht(COMPANY.feeSaving)}/year</b><span className="muted">EPF24 calculation</span></div>
        <div className="stat"><span className="muted">Current vs comparable 5Y</span><b>{(COMPANY.netReturn * 100).toFixed(1)}% → {(COMPANY.altReturn * 100).toFixed(1)}%</b><span className="muted">Sample-book assumptions · SEC series not loaded</span></div>
        <div className="stat"><span className="muted">10-year member wealth difference</span><b>{baht(intel.ten)}</b><span className="muted">EPF24 calculation on those return assumptions</span></div>
      </div>
      <div className="ink">
        <span className="eyebrow">Opportunity · not an SEC sentence</span>
        <span>EPF24 detected an estimated {baht(COMPANY.annualValue)} annual economic improvement on the sample book: {baht(COMPANY.feeSaving)} of employer fee difference and {baht(COMPANY.investOpp)} of member wealth scenario. SEC support is not loaded. The drivers are the fee gap and the stated return gap. The alternative is the best-fit sample provider, not the cheapest. The risk is that a negotiated fee and a published fee are different. The mission is to test or reprice, or to record that the current arrangement stays.</span>
      </div>
      <h6>Fair Fee · {COMPANY.name}</h6>
      <div className="stats">
        <div className="stat"><span className="muted">Current negotiated cost</span><b>{baht(COMPANY.annualCost)}</b><span className="muted">{feeLabel(COMPANY.feeRate)} on {baht(COMPANY.aum)}</span></div>
        <div className="stat"><span className="muted">Sample-book Fair Fee zone</span><b>{feeLabel(fair.low)}–{feeLabel(fair.high)}</b><span className="muted">{fair.observations} anonymized observations</span></div>
        <div className="stat"><span className="muted">Best-fit annual cost</span><b>{baht(COMPANY.altCost)}</b><span className="muted">Fee saving {baht(COMPANY.feeSaving)}</span></div>
        <div className="stat"><span className="muted">10-year wealth difference</span><b>{baht(intel.ten)}</b><span className="muted">Return scenario, not a fee</span></div>
      </div>
      <div className="actions">
        <button className="btn btn-secondary" type="button" onClick={() => goto("gateway")}>SEC data gateway</button>
        <button className="btn btn-secondary" type="button" onClick={() => goto("gap")}>Value gap</button>
        <button className="btn btn-primary" type="button" onClick={() => goto("market")}>Request a better proposal →</button>
      </div>
      <p className="muted">Fair Fee here is the sample negotiation book for this employer. It is not the published SEC fee, and it is not yet a live tape of 1,000 companies. Alpha, consistency and downside capture wait until a benchmark series is connected.</p>
    </>
  );
}
