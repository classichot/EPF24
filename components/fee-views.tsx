"use client";

import { useState, type ReactNode } from "react";
import { COMPANY, baht, feeLabel, meterScore, type ScreenId } from "@/lib/model";
import { FEE_LINES, feeScenario, feeTotal, projectFees, savingsMeter, trueCost } from "@/lib/fee";

function Head({ k, title, lede, children }: { k: string; title: string; lede?: string; children?: ReactNode }) {
  return (
    <div className="page-head">
      <div>
        <div className="kicker">{k}</div>
        <h1 style={{ margin: "8px 0 6px" }}>{title}</h1>
        {lede ? <p className="lede">{lede}</p> : null}
      </div>
      {children ? <div className="actions">{children}</div> : null}
    </div>
  );
}

export function FeeScreens({ s, goto }: { s: ScreenId; goto: (id: ScreenId) => void }) {
  if (s === "mypvd") return <MyPvd goto={goto} />;
  if (s === "xray") return <Xray />;
  if (s === "lab") return <Lab />;
  if (s === "gateway") return <Gateway />;
  return null;
}

function MyPvd({ goto }: { goto: (id: ScreenId) => void }) {
  const meter = savingsMeter();
  return (
    <>
      <Head k="My PVD" title="Pay less. Earn more." lede="Two numbers, kept apart. The employer figure is the negotiated fee gap. The employee figure is an investment scenario. They are not added into one guaranteed result.">
        <button className="btn btn-secondary" type="button" onClick={() => goto("xray")}>Fee X-Ray</button>
        <button className="btn btn-primary" type="button" onClick={() => goto("lab")}>Scenario lab →</button>
      </Head>
      <section className="poster">
        <div className="kicker">EPF24 savings meter</div>
        <div className="poster-grid">
          <div><b>{baht(meter.cost.total)}</b><span>Current annual PVD cost · negotiated</span></div>
          <div><b>{baht(meter.optimized)}</b><span>Best-fit market cost</span></div>
          <div><b>{baht(meter.annualSaving)}</b><span>Annual employer saving</span></div>
        </div>
        <div>5-year employer saving if assets stay flat: {baht(meter.fiveSaving)}. Employee wealth opportunity this year {baht(meter.employeeYear)}. Illustrative 10-year difference {baht(meter.employeeTen)}.</div>
      </section>
      <div className="stats">
        <div className="stat"><span className="muted">Assets</span><b>{baht(COMPANY.aum)}</b></div>
        <div className="stat"><span className="muted">Employees</span><b>{COMPANY.members.toLocaleString("en-US")}</b></div>
        <div className="stat"><span className="muted">Provider</span><b style={{ fontSize: 18 }}>{COMPANY.provider}</b></div>
        <div className="stat"><span className="muted">Effective negotiated fee</span><b>{feeLabel(meter.cost.rate)}</b></div>
        <div className="stat"><span className="muted">Cost per employee</span><b>{baht(meter.cost.perEmployee)}</b></div>
        <div className="stat"><span className="muted">PVD efficiency</span><b>{meterScore().toFixed(0)}/100</b></div>
      </div>
      <p className="muted">Efficiency is a transparent weighted score of cost, investment, risk, choice, service and governance. It is not a promise of future performance.</p>
    </>
  );
}

function Xray() {
  const [open, setOpen] = useState<string | null>(FEE_LINES[0].id);
  const cost = trueCost();
  const negotiated = feeTotal(FEE_LINES);
  const benchmark = FEE_LINES.reduce((sum, line) => sum + line.benchmark, 0);
  return (
    <>
      <Head k="Fee X-Ray" title="Every baht in the contract, with its clause." lede="These lines are the negotiated corporate schedule extracted from the uploaded file. A published factsheet price is a different lane and is not added into this total." />
      <div className="split">
        <div className="surface">
          <h6 style={{ margin: 0 }}>Negotiated corporate fee</h6>
          <div className="poster-num" style={{ fontSize: 42 }}>{baht(negotiated)}</div>
          <p className="muted">Effective {feeLabel(cost.rate)} of assets · {baht(cost.perEmployee)} per employee · confidence is per line, not one score for the whole contract.</p>
        </div>
        <div className="surface">
          <h6 style={{ margin: 0 }}>Published market lane</h6>
          <p>Not from this contract. The observed comparison case for a best-fit provider is {baht(benchmark)} a year. Do not average it with the negotiated total.</p>
          <p className="muted">Gap between the two lanes: {baht(negotiated - benchmark)} a year.</p>
        </div>
      </div>
      <table className="table">
        <thead><tr><th>Line</th><th>Layer</th><th className="num">Negotiated</th><th className="num">Comparison case</th><th className="num">Gap</th><th>Confidence</th><th></th></tr></thead>
        <tbody>
          {FEE_LINES.map((line) => (
            <tr key={line.id}>
              <td style={{ fontWeight: 600 }}>{line.name}</td>
              <td>{line.layer}</td>
              <td className="num">{baht(line.amount)}</td>
              <td className="num">{baht(line.benchmark)}</td>
              <td className="num">{baht(line.saving)}</td>
              <td>{line.confidence}%</td>
              <td><button className="btn btn-secondary" type="button" onClick={() => setOpen(open === line.id ? null : line.id)}>{open === line.id ? "Hide source" : "View source"}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {FEE_LINES.filter((line) => line.id === open).map((line) => (
        <div className="ink" key={line.id}>
          <span className="eyebrow">{line.source} · {line.ref}</span>
          <strong>{line.clause}</strong>
          <span>Retrieved from the employer upload in this workspace. The comparison-case column is not in that clause.</span>
        </div>
      ))}
      <div className="trust">
        <span>Total negotiated cost is the sum of the extracted lines: {baht(negotiated)}.</span>
        <span>Registrar is ฿150 per member × {COMPANY.members.toLocaleString("en-US")} = {baht(273_000)}.</span>
        <span>AI reads the clause. The total is added by the cost engine.</span>
      </div>
    </>
  );
}

function Lab() {
  const [feePct, setFeePct] = useState(0.3);
  const [growth, setGrowth] = useState(0);
  const [uplift, setUplift] = useState(0.8);
  const rate = feePct / 100;
  const run = feeScenario(rate, growth / 100, uplift / 100);
  const horizon = [1, 3, 5, 10].map((year) => {
    const now = projectFees(run.current.rate, year, growth / 100);
    const next = projectFees(rate, year, growth / 100);
    return { year, saving: now.total - next.total, wealth: run.tenWealth && year === 10 ? run.tenWealth : COMPANY.aum * (Math.pow(1 + COMPANY.netReturn + uplift / 100, year) - Math.pow(1 + COMPANY.netReturn, year)) };
  });
  return (
    <>
      <Head k="Scenario lab" title="Change one assumption. The baht figure moves." lede="Fee, asset growth and return spread are inputs. Employer saving and employee wealth are calculated separately." />
      <div className="split">
        <div className="stack">
          <label>Negotiated fee {feePct.toFixed(2)}%
            <input type="range" min={0.15} max={0.35} step={0.01} value={feePct} onChange={(e) => setFeePct(Number(e.target.value))} />
          </label>
          <label>Asset growth {growth.toFixed(0)}% a year
            <input type="range" min={0} max={8} step={1} value={growth} onChange={(e) => setGrowth(Number(e.target.value))} />
          </label>
          <label>Return difference {uplift.toFixed(1)} points
            <input type="range" min={0} max={1.5} step={0.1} value={uplift} onChange={(e) => setUplift(Number(e.target.value))} />
          </label>
        </div>
        <div className="stats">
          <div className="stat"><span className="muted">Annual employer cost</span><b>{baht(run.optimized.total)}</b></div>
          <div className="stat"><span className="muted">Annual employer saving vs 0.30%</span><b>{baht(run.annualSaving)}</b></div>
          <div className="stat"><span className="muted">5-year employer saving</span><b>{baht(run.fiveSaving)}</b></div>
          <div className="stat"><span className="muted">10-year employee wealth difference</span><b>{baht(run.tenWealth)}</b></div>
        </div>
      </div>
      <h6>Provider switch, fee only, on these assumptions</h6>
      <table className="table">
        <thead><tr><th>Horizon</th><th className="num">Employer fee saving</th><th className="num">Employee wealth difference</th></tr></thead>
        <tbody>
          {horizon.map((row) => (
            <tr key={row.year}>
              <td>Year {row.year}</td>
              <td className="num">{baht(row.saving)}</td>
              <td className="num">{baht(row.wealth)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="muted">Employee wealth compounds the return difference on today’s assets and does not include new contributions. Employer saving compounds only if you set asset growth above zero. Neither column is a forecast.</p>
    </>
  );
}

function Gateway() {
  const rows = [
    ["SEC Open Data · PVD", "15 datasets: managers, funds, policy, return, published fee, allocation, holdings, monthly NAV", "Public base", "Connector ready · path not pinned", "secopendata.sec.or.th"],
    ["SEC API portal", "Account, product subscription, subscription key", "Public base", "Not subscribed", "api-portal.sec.or.th"],
    ["ThaiPVD employer register", "Employer fund names", "Public", "Loaded · separated onto Employers", "thaipvd.com"],
    ["ThaiPVD management companies", "Who may run a PVD", "Public", "Loaded", "thaipvd.com"],
    ["SET / ThaiBMA / BOT", "Benchmark series for alpha and capture", "Market", "Not connected", "Index publishers"],
    ["Employer contract", "Negotiated fee, SLA, invoices", "Private", "Sample file only", "This workspace"],
    ["Tender quotations", "Quoted fee, negotiated fee, winner", "Moat", "Sample book only", "Market test"],
  ];
  return (
    <>
      <Head k="Public data gateway" title="SEC Open Data is the raw layer." lede="A paid SEC feed is not required to start. The open API is the backbone. Published fees stay in that store. The employer’s negotiated fee and every tender quote stay in a different store." />
      <table className="table">
        <thead><tr><th>Source</th><th>What it can supply</th><th>Lane</th><th>Status</th><th>Reference</th></tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]}>
              <td style={{ fontWeight: 600 }}>{row[0]}</td>
              <td>{row[1]}</td>
              <td>{row[2]}</td>
              <td>{row[3]}</td>
              <td>{row[4]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="muted">Reviewed 25 Sep 2026. SEC Open Data is free for commercial and personal use. This screen still does not pull it. Sync runs only after the current portal base URL, key header and subscription key are set. Pooled and master pooled factsheets do not replace an employer’s negotiated fee.</p>
    </>
  );
}
