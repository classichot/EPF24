"use client";

import { useState } from "react";
import { PageHead as Head } from "@/components/page-head";
import { COMPANY, PROVIDERS, baht, feeLabel, wealthDifference, type ScreenId } from "@/lib/model";
import {
  DEFENSE,
  DNA,
  FLYWHEEL,
  LAYERS,
  MANDATES,
  OUTCOMES,
  SHADOW_ALTS,
  TRANSACTIONS,
  TAPE,
  accuracy,
  fairPriceQuote,
  interventions,
  mandateMarket,
  twinRun,
  type TwinId,
} from "@/lib/moat";

function Trust({ items }: { items: string[] }) {
  return (
    <div className="trust">
      {items.map((t) => (
        <span key={t}>{t}</span>
      ))}
    </div>
  );
}

export function MoatScreens({ s, goto }: { s: ScreenId; goto: (id: ScreenId) => void }) {
  if (s === "cio") return <Cio goto={goto} />;
  if (s === "brain") return <Brain goto={goto} />;
  if (s === "shadow") return <Shadow goto={goto} />;
  if (s === "fair") return <Fair />;
  if (s === "dna") return <Dna />;
  if (s === "nego") return <Nego goto={goto} />;
  if (s === "twin") return <Twin />;
  if (s === "intervene") return <Intervene />;
  if (s === "outcome") return <Outcome />;
  if (s === "exchange") return <Exchange />;
  return null;
}

function Cio({ goto }: { goto: (id: ScreenId) => void }) {
  const [approved, setApproved] = useState(false);
  return (
    <>
      <Head k="Autonomous CIO" title="One action, not fifty alerts." lede="Agents watch performance, risk, fees, service, regulation, employee outcomes and rival providers. A challenger tries to knock the conclusion down. A person still decides." />
      <section className="poster">
        <div className="kicker">EPF24 found one action worth {baht(COMPANY.annualValue)}</div>
        <div className="poster-num" style={{ fontSize: 48 }}>Negotiate</div>
        <div>Siam Harbor AM is outside the observed price zone for this mandate. Switching is not required to capture the corporate piece.</div>
        <div className="poster-grid">
          <div><b>{baht(COMPANY.feeSaving)}</b><span>Corporate fee opportunity / year</span></div>
          <div><b>{baht(COMPANY.investOpp)}</b><span>Employee investment scenario / year</span></div>
          <div><b>87%</b><span>Sample confidence · 37 observations</span></div>
        </div>
      </section>
      <div className="actions">
        <button className="btn btn-secondary" type="button" onClick={() => goto("shadow")}>Review evidence</button>
        <button className="btn btn-secondary" type="button" onClick={() => goto("twin")}>Simulate</button>
        <button className="btn btn-primary" type="button" onClick={() => setApproved(true)}>{approved ? "Queued for approval" : "Approve mission"}</button>
      </div>
      {approved && <p>Mission queued for K. Suda. Nothing is sent to the provider until the committee secretary releases it.</p>}
      <div className="split">
        <div>
          <h6>Why this, and not a switch</h6>
          <div className="rule">
            <p>Fee Agent: 0.30% versus an observed competitive zone near 0.19–0.22%.</p>
            <p>Negotiation Agent: sample history says this provider moves when a rival price is credible, often into 0.22–0.24%, not always to the floor.</p>
            <p>Independent Challenger: the ฿6.4M employee figure is a scenario spread, not cash in hand. Do not add it to the fee saving and call the sum guaranteed.</p>
          </div>
        </div>
        <div>
          <h6>Watching, not paging you</h6>
          {["Performance", "Risk", "Regulatory", "Employee outcome", "Service"].map((n) => (
            <div key={n} className="rowline" style={{ display: "grid", gridTemplateColumns: "1fr auto" }}>
              <span>{n}</span><span className="muted">Inside threshold</span>
            </div>
          ))}
          <div className="rowline" style={{ display: "grid", gridTemplateColumns: "1fr auto" }}>
            <b>Fee</b><b className="warn">Exception</b>
          </div>
        </div>
      </div>
      <Trust items={["Autonomous CIO recommends. It does not replace the committee or the investment manager.", "Sample confidence is from the prototype transaction book, not a live tape.", "Employee wealth is a scenario. Corporate fee is a price comparison."]} />
    </>
  );
}

function Brain({ goto }: { goto: (id: ScreenId) => void }) {
  const [open, setOpen] = useState(TRANSACTIONS[0].id);
  return (
    <>
      <Head k="Market Brain" title="The transaction graph is the moat." lede="Public returns are the foundation. The private layer is what employers were actually offered, what they negotiated, what they chose, and what happened next." />
      <div className="split">
        <div>
          <h6>Defensibility stack</h6>
          {LAYERS.map((l) => (
            <div key={l.k} style={{ padding: "12px 0", borderBottom: "1px solid var(--color-divider)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><b>{l.k}</b><span className="tag tag-outline">{l.lock}</span></div>
              <div className="muted" style={{ marginTop: 4 }}>{l.v}</div>
            </div>
          ))}
          <h6>What a competitor can copy</h6>
          <table className="table">
            <thead><tr><th>Capability</th><th>Defensibility</th></tr></thead>
            <tbody>
              {DEFENSE.map((row) => (
                <tr key={row.capability}>
                  <td>{row.capability}</td>
                  <td><b>{row.level}</b></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h6>How the book compounds</h6>
          <div className="rule">
            {FLYWHEEL.map((step, i) => (
              <div key={step} style={{ display: "grid", gridTemplateColumns: "28px 1fr", gap: 8, padding: "8px 0", borderBottom: "1px solid var(--color-divider)" }}>
                <b>{i + 1}</b><span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <h6>Anonymized transactions in the sample book</h6>
      {TRANSACTIONS.map((t) => (
        <button key={t.id} type="button" onClick={() => setOpen(t.id)} style={{ textAlign: "left", border: 0, borderBottom: "1px solid var(--color-divider)", background: open === t.id ? "var(--color-surface)" : "transparent", padding: "14px 0", cursor: "pointer", color: "inherit", width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><b>{t.id}</b><span className="good">{t.result}</span></div>
          <div style={{ marginTop: 4 }}>{t.chain}</div>
          {open === t.id && <div className="muted" style={{ marginTop: 6 }}>{t.lesson}</div>}
        </button>
      ))}
      <div className="actions">
        <button className="btn btn-primary" type="button" onClick={() => goto("fair")}>Turn this into a fair price →</button>
      </div>
      <Trust items={["Employer names in the graph are withheld.", "These four cases are a prototype book so the screen has a shape. They are not live production records.", "Public ThaiPVD figures on the Intelligence screen stay labeled as public."]} />
    </>
  );
}

function Shadow({ goto }: { goto: (id: ScreenId) => void }) {
  const [mode, setMode] = useState<"now" | "fair">("now");
  const competitive = mode === "now";
  const ten = wealthDifference(10);
  return (
    <>
      <Head k="Shadow Market" title="A virtual tender, running without a letter to anyone." lede="If this mandate went to market today, what might it clear? Sometimes the answer is: do nothing.">
        <div className="seg">
          <button type="button" className={mode === "now" ? "on" : ""} onClick={() => setMode("now")}>This employer</button>
          <button type="button" className={mode === "fair" ? "on" : ""} onClick={() => setMode("fair")}>Already at fair price</button>
        </div>
      </Head>
      <div className="split">
        <div className="surface">
          <h6 style={{ margin: 0 }}>Current provider · Siam Harbor AM</h6>
          <div className="big">{mode === "now" ? baht(COMPANY.annualCost) : baht(COMPANY.altCost)}</div>
          <span className="muted">{mode === "now" ? "0.30% all-in" : "Repriced to the best-fit 0.206%"}</span>
          <div>Service 72/100 · net 3.8% · Life Path not offered</div>
        </div>
        <div className="poster">
          <span className="kicker">{competitive ? "Shadow market" : "Shadow market · no gap on fee"}</span>
          <span className="poster-num" style={{ fontSize: 42 }}>{competitive ? "Negotiate" : "No action"}</span>
          <span>{competitive ? `Competitive cost ${baht(1_520_000)}–${baht(1_760_000)}. Best fit ${baht(COMPANY.altCost)}.` : "Current price is already inside the observed zone. A tender would spend time to learn what you already know."}</span>
        </div>
      </div>
      {competitive && (
        <>
          <div className="stats">
            <div className="stat"><span className="muted">Potential fee saving</span><b style={{ fontSize: 28 }}>{baht(640_000)}–{baht(COMPANY.cheapestSaving)}</b></div>
            <div className="stat"><span className="muted">Best-fit point</span><b style={{ fontSize: 28 }}>{baht(COMPANY.feeSaving)}</b></div>
            <div className="stat"><span className="muted">Investment scenario</span><b style={{ fontSize: 28 }}>+0.80pt</b></div>
            <div className="stat"><span className="muted">10-year wealth difference</span><b style={{ fontSize: 28 }}>{baht(ten)}</b></div>
            <div className="stat"><span className="muted">Sample confidence</span><b style={{ fontSize: 28 }}>87%</b></div>
          </div>
          <h6>3 better-fit alternatives detected</h6>
          <div className="cards">
            {SHADOW_ALTS.map((p) => (
              <article className="card" key={p.id}>
                <div className="card-kicker">{p.id === "cp" ? "Best fit" : "Qualified"}</div>
                <div className="card-title">{p.name}</div>
                <div>{feeLabel(p.fee)} · {baht(annualOf(p.fee))} / year · Life Path yes</div>
              </article>
            ))}
          </div>
          <div className="actions">
            <button className="btn btn-primary" type="button" onClick={() => goto("nego")}>Negotiate current provider →</button>
            <button className="btn btn-secondary" type="button" onClick={() => goto("market")}>Run a real market test</button>
          </div>
        </>
      )}
      {!competitive && <p>Trust case: EPF24 does not manufacture a tender when the incumbent is already inside the observed range. The investment scenario can still be reviewed on its own.</p>}
      <Trust items={["Shadow prices are estimates from the sample book, not invitations sent to providers.", "87% is the prototype confidence label for 37 anonymized observations.", "10-year wealth compounds the 0.8 point scenario on current assets."]} />
    </>
  );
}

function annualOf(fee: number) {
  return fee * COMPANY.aum;
}

function Fair() {
  const [aumM, setAumM] = useState(800);
  const q = fairPriceQuote(aumM * 1_000_000);
  return (
    <>
      <Head k="Fair Price" title="What this mandate has actually cleared." lede="Published ranges and EPF24’s transaction range are shown apart. The second number is the one a factsheet cannot give you." />
      <div>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Assets in the query</span><b>฿{aumM.toLocaleString("en-US")}M</b></div>
        <input type="range" min={300} max={2800} step={50} value={aumM} onChange={(e) => setAumM(Number(e.target.value))} />
      </div>
      <div className="stats">
        <div className="stat"><span className="muted">Current fee</span><b style={{ fontSize: 26 }}>{feeLabel(q.currentRate)}</b><span className="muted">{baht(q.currentCost)} / year</span></div>
        <div className="stat"><span className="muted">Published reference</span><b style={{ fontSize: 26 }}>{feeLabel(q.publishedLow)}–{feeLabel(q.publishedHigh)}</b></div>
        <div className="stat"><span className="muted">Observed EPF24 range</span><b style={{ fontSize: 26 }}>{feeLabel(q.low)}–{feeLabel(q.high)}</b></div>
        <div className="stat"><span className="muted">Potential saving</span><b style={{ fontSize: 26 }}>{baht(q.saveLow)}–{baht(q.saveHigh)}</b></div>
      </div>
      <div className="ink">
        <span className="eyebrow">Evidence</span>
        <strong>Based on {q.observations} sufficiently comparable anonymized observations in the prototype book.</strong>
        <span>At ฿800M the zone brackets the ฿750K best-fit saving used on the homepage. Move the assets and both the range and the count move with the same rule.</span>
      </div>
      <Trust items={["Prototype price curve, calibrated so this employer’s known book matches the homepage.", "Not a quote. Not a forecast.", "Public reference and private range are never blended into one number."]} />
    </>
  );
}

function Dna() {
  const [id, setId] = useState("sh");
  const p = PROVIDERS.find((x) => x.id === id)!;
  const d = DNA[id];
  return (
    <>
      <Head k="Provider DNA" title="Which provider fits which employer." lede="A return is one field. DNA is pricing behavior, service after the win, and the workforce the firm is actually good at." />
      <div className="chips">
        {PROVIDERS.map((prov) => (
          <button key={prov.id} type="button" className={prov.id === id ? "chip on" : "chip"} onClick={() => setId(prov.id)}>{prov.name}</button>
        ))}
      </div>
      <div className="page-head" style={{ border: 0, padding: 0 }}>
        <div>
          <div className="kicker">{p.id === "sh" ? "Incumbent" : "Qualified provider"}</div>
          <h2 style={{ margin: 0 }}>{p.name}</h2>
        </div>
        <div className="muted">{feeLabel(p.fee)} all-in · 3Y {p.r3}% · vol {p.vol}% · Life Path {p.life ? "yes" : "no"}</div>
      </div>
      <div className="split">
        <Block title="Best at" items={d.best} />
        <Block title="Pricing behavior" items={d.price} />
        <Block title="Service behavior" items={d.service} />
        <Block title="Investment character" items={d.invest} />
      </div>
      <div className="surface"><b>Fit for this workforce. </b>{d.fit}</div>
      <Trust items={["Behavioral lines are labeled as sample-book patterns, not audited track records.", "Return, fee and volatility figures are the same normalized set used in Compare."]} />
    </>
  );
}

function Block({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h6>{title}</h6>
      {items.map((t) => <div key={t} className="rowline">{t}</div>)}
    </div>
  );
}

function Nego({ goto }: { goto: (id: ScreenId) => void }) {
  const [step, setStep] = useState(0);
  const steps = [
    "Counterproposal drafted at 0.21%, with 0.19% as the opening ask.",
    "Benchmark evidence attached: observed zone 0.19–0.22%, best fit 0.206%.",
    "Script for the secretary: fee layers, Life Path, and the rival zone.",
    "Held for human approval. Not sent.",
  ];
  return (
    <>
      <Head k="Negotiation Twin" title="What this provider has accepted before." lede="The letter is easy to copy. The range is not. It comes from how this firm has moved when a comparable mandate pushed back." />
      <div className="stats">
        <div className="stat"><span className="muted">Current</span><b>0.30%</b></div>
        <div className="stat"><span className="muted">Fair price zone</span><b>0.19–0.22%</b></div>
        <div className="stat"><span className="muted">Opening target</span><b>0.19%</b></div>
        <div className="stat"><span className="muted">Likely landing zone</span><b>0.22–0.24%</b></div>
        <div className="stat"><span className="muted">If they reach 0.235%</span><b>{baht(COMPANY.renegotiateSaving)}</b></div>
        <div className="stat"><span className="muted">Chance they move</span><b>High</b></div>
      </div>
      <p className="muted">High means the sample book has several cases where this pattern of provider conceded once a credible alternative existed. It is not a probability from a fitted model.</p>
      <button className="btn btn-primary" type="button" onClick={() => setStep((n) => Math.min(steps.length, n + 1))} disabled={step >= steps.length}>
        {step >= steps.length ? "Pack ready for approval" : "Negotiate for me →"}
      </button>
      <div className="rule" style={{ borderTop: "2px solid var(--color-text)" }}>
        {steps.map((t, i) => (
          <div key={t} style={{ display: "grid", gridTemplateColumns: "120px 1fr", padding: "12px 0", borderBottom: "1px solid var(--color-divider)", opacity: i < step ? 1 : 0.4 }}>
            <b className="good">{i < step ? "Ready" : "Waiting"}</b><span>{t}</span>
          </div>
        ))}
      </div>
      {step >= steps.length && (
        <div className="actions">
          <button className="btn btn-secondary" type="button" onClick={() => goto("committee")}>Take it to the committee</button>
        </div>
      )}
      <Trust items={["Nothing is delivered to Siam Harbor AM from this screen.", "Landing zone is the sample pattern for incumbents who are challenged, not a promise.", "A full best-fit switch is a different decision from a reprice."]} />
    </>
  );
}

function Twin() {
  const [id, setId] = useState<TwinId>("switch");
  const run = twinRun(id);
  const questions: { id: TwinId; q: string }[] = [
    { id: "switch", q: "What if we switch provider?" },
    { id: "fee20", q: "What if fees fall 20%?" },
    { id: "fee25", q: "What if fees fall 25%?" },
    { id: "contrib2", q: "What if employees contribute another 2%?" },
    { id: "life", q: "What if we add Life Path?" },
    { id: "match", q: "What if matching goes from 5% to 7%?" },
    { id: "shift", q: "What if 30% move toward Life Path?" },
    { id: "shock", q: "What if markets fall 30%?" },
  ];
  const lede = `${COMPANY.members.toLocaleString("en-US")} employees · ${baht(COMPANY.aum)} · age, pay, contributions, allocation, provider, fees and projections in one model. Member records stay out of HR’s view.`;
  return (
    <>
      <Head k="Corporate EPF Digital Twin" title="The whole fund, not one member." lede={lede} />
      <div className="stats">
        {[
          [COMPANY.members.toLocaleString("en-US"), "Employees"],
          [baht(COMPANY.aum), "Assets"],
          ["36", "Average age"],
          ["5%", "Employer match"],
          ["4", "Policies"],
          ["64%", "On track"],
        ].map(([v, k]) => (
          <div className="stat" key={k}><b style={{ fontSize: 26 }}>{v}</b><span className="muted">{k}</span></div>
        ))}
      </div>
      <div className="chips">
        {questions.map((item) => (
          <button key={item.id} type="button" className={id === item.id ? "chip on" : "chip"} onClick={() => setId(item.id)}>{item.q}</button>
        ))}
      </div>
      <div className="surface">
        <h6 style={{ margin: 0 }}>{run.title}</h6>
        {run.lines.map((line) => <div key={line} className="rowline">{line}</div>)}
        <p className="muted" style={{ margin: 0 }}>{run.note}</p>
      </div>
      <Trust items={["Match and fee cases use the deterministic engines.", "Life Path, mix-shift and shock adequacy moves are planning assumptions and are labeled as such."]} />
    </>
  );
}

function Intervene() {
  const rows = interventions();
  const [pick, setPick] = useState(0);
  const chosen = rows[pick];
  return (
    <>
      <Head k="Intervention engine" title="What should we do about the shortfall?" lede="36% of the workforce is projected below the 60% income-replacement target. The engine lays out the trade, including a path that does not ask for a large new match." />
      <table className="table">
        <thead><tr><th>Intervention</th><th className="num">Employer cost</th><th className="num">On-track</th><th>Basis</th><th></th></tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.name}>
              <td style={{ fontWeight: 600 }}>{r.name}</td>
              <td className="num">{r.cost < 0 ? `Saves ${baht(-r.cost)}` : r.cost === 0 ? "฿0" : `+${baht(r.cost)}`}</td>
              <td className="num">{r.from}% → {r.to.toFixed(0)}%</td>
              <td><span className={r.kind === "Calculated" ? "tag tag-accent" : "tag tag-neutral"}>{r.kind}</span></td>
              <td><button className="btn btn-secondary" type="button" onClick={() => setPick(i)}>{i === pick ? "Selected" : "Select"}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="ink">
        <span className="eyebrow">Management choice</span>
        <strong>{chosen.name}</strong>
        <span>{chosen.kind === "Calculated" ? "Cost and on-track rate are calculated from payroll and the cohort model." : "Treat the adequacy change as a planning assumption until the outcome engine has a measured result."}</span>
      </div>
      <Trust items={["There is no universal best intervention.", "Fee saving in the combined row is the ฿750K best-fit comparison, netted against the programme cost.", "Groups under 20 members stay hidden."]} />
    </>
  );
}

function Outcome() {
  const [id, setId] = useState(OUTCOMES[0].id);
  const row = OUTCOMES.find((o) => o.id === id)!;
  return (
    <>
      <Head k="Outcome engine" title="What actually happened after the decision." lede="Observe, predict, recommend, execute, measure, learn. A competitor with the same model and no history cannot answer these questions." />
      <div className="stats">
        <div className="stat"><span className="muted">This employer · predicted fee saving</span><b>{baht(COMPANY.feeSaving)}</b></div>
        <div className="stat"><span className="muted">Actual after 12 months</span><b>Not yet</b></div>
        <div className="stat"><span className="muted">Status</span><b>Open</b></div>
      </div>
      <h6>Closed cases in the sample book</h6>
      <div className="chips">
        {OUTCOMES.map((o) => (
          <button key={o.id} type="button" className={o.id === id ? "chip on" : "chip"} onClick={() => setId(o.id)}>{o.id}</button>
        ))}
      </div>
      <div className="stats">
        <div className="stat"><span className="muted">Predicted</span><b>{baht(row.predicted)}</b></div>
        <div className="stat"><span className="muted">Actual</span><b>{baht(row.actual)}</b></div>
        <div className="stat"><span className="muted">Accuracy</span><b>{accuracy(row.predicted, row.actual)}%</b></div>
      </div>
      <div className="surface">
        <b>{row.decision}. </b>{row.after}
      </div>
      <div className="split">
        <div>
          <h6>Questions only the loop can answer</h6>
          {["Which interventions moved retirement adequacy per baht of employer cost?", "Which providers delivered the fee they signed?", "Was a higher match worth more than a default redesign, after the fact?"].map((q) => <div key={q} className="rowline">{q}</div>)}
        </div>
        <div className="surface">
          <h6 style={{ margin: 0 }}>This book, so far</h6>
          <p style={{ margin: 0 }}>Where a market test existed, the fee prediction landed closer. Where negotiation ran alone, the model was too optimistic. That bias is the point of keeping score.</p>
        </div>
      </div>
      <Trust items={["Closed cases are a prototype book.", "Accuracy is 1 minus the absolute miss, divided by the prediction.", "Rattana’s own result stays blank until a decision is executed and measured."]} />
    </>
  );
}

function Exchange() {
  const [live, setLive] = useState(false);
  const [focus, setFocus] = useState(MANDATES[0].id);
  const board = live
    ? [{ id: "EPF-RATTANA", aum: COMPANY.aum, employees: COMPANY.members, policies: 6, life: true, global: true, target: 0.0021, bids: [0.0019, 0.0020625, 0.0022, 0.0025], current: COMPANY.feeRate }, ...MANDATES]
    : MANDATES;
  const current = board.find((m) => m.id === focus) ?? board[0];
  const mkt = mandateMarket(current);
  return (
    <>
      <Head k="EPF24 Exchange" title="A continuous market for mandates." lede="Not a request for a brochure. An anonymous mandate, qualified providers, one format, and a tape of ask, bid, counter, winner and what followed.">
        <button className="btn btn-primary" type="button" onClick={() => { setLive(true); setFocus("EPF-RATTANA"); }}>{live ? "Mandate published" : "Publish anonymous mandate"}</button>
      </Head>
      <div className="chips">
        {board.map((item) => (
          <button key={item.id} type="button" className={item.id === current.id ? "chip on" : "chip"} onClick={() => setFocus(item.id)}>{item.id}</button>
        ))}
      </div>
      <div className="stats">
        <div className="stat"><span className="muted">Assets</span><b style={{ fontSize: 24 }}>{baht(current.aum)}</b></div>
        <div className="stat"><span className="muted">Employees</span><b style={{ fontSize: 24 }}>{current.employees.toLocaleString("en-US")}</b></div>
        <div className="stat"><span className="muted">Policies</span><b style={{ fontSize: 24 }}>{current.policies}</b></div>
        <div className="stat"><span className="muted">Life Path / global</span><b style={{ fontSize: 24 }}>{current.life ? "Yes" : "No"} / {current.global ? "Yes" : "No"}</b></div>
      </div>
      <section className="poster">
        <div className="kicker">Live market · {mkt.n} qualified indications</div>
        <div className="poster-grid">
          <div><b>{feeLabel(mkt.best)}</b><span>Best fee</span></div>
          <div><b>{feeLabel(mkt.median)}</b><span>Median</span></div>
          <div><b>{feeLabel(current.current)}</b><span>Current</span></div>
        </div>
        <div>Potential corporate saving versus the best indication: {baht(mkt.saving)} / year. Identity of the employer is not on the mandate.</div>
      </section>
      <h6>What the exchange records</h6>
      <div className="rule">
        {TAPE.map((step, i) => (
          <div key={step} style={{ display: "grid", gridTemplateColumns: "28px 1fr auto", gap: 8, padding: "8px 0", borderBottom: "1px solid var(--color-divider)" }}>
            <b>{i + 1}</b>
            <span>{step}</span>
            <span className="muted">{current.id === "EPF-RATTANA" && i > 3 ? "Not yet" : "On the tape"}</span>
          </div>
        ))}
      </div>
      <p className="muted">Indications are standardized to the EPF24 all-in basis before they are shown. A provider’s portal fee, if any, does not change the order.</p>
      <Trust items={["Sample mandates plus, if you publish, this employer’s profile without the name.", "Saving is current rate minus the lowest indication, times assets.", "Cheapest indication is not a recommendation to award."]} />
    </>
  );
}
