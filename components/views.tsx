"use client";

import { useState, type ReactNode } from "react";
import { FeeScreens } from "@/components/fee-views";
import { NetworkScreen } from "@/components/network-view";
import { MoatScreens } from "@/components/moat-views";
import { PVD_EMPLOYERS, PVD_MANAGERS, PVD_PRODUCTS } from "@/lib/pvd-funds";
import { CATALOG_CATEGORIES, CATALOG_MISSIONS, ENTRY_MISSIONS } from "@/lib/catalog";
import { ENGINES, agiSteps, agiVerdict } from "@/lib/moat";
import {
  COMPANY,
  CRITERIA,
  METER,
  NAV,
  POLICY_TYPES,
  PROVIDERS,
  WATCH,
  annualCost,
  baht,
  feeLabel,
  marketQuote,
  meterScore,
  projectMember,
  scoreBids,
  wealthDifference,
  workforceAt,
  type ScreenId,
} from "@/lib/model";

const INK = "var(--color-text)";
const GOOD = "var(--color-accent)";
const WARN = "var(--color-accent-700)";

function toneColor(t: "ink" | "good" | "warn") {
  return t === "good" ? GOOD : t === "warn" ? WARN : INK;
}

export type Api = {
  goto: (s: ScreenId) => void;
  search: string;
  setSearch: (v: string) => void;
  ptype: string;
  setPtype: (v: string) => void;
  sel: string[];
  toggleProv: (id: string) => void;
  bench: number;
  benchStep: number;
  runBench: () => void;
  resetBench: () => void;
  weights: Record<string, number>;
  setWeight: (id: string, v: number) => void;
  tstep: number;
  setTstep: (n: number) => void;
  acked: number[];
  ack: (i: number) => void;
  ctab: string;
  setCtab: (v: string) => void;
  emp: Emp;
  setEmp: (p: Partial<Emp>) => void;
  copilot: string;
  setCopilot: (v: string) => void;
  match: number;
  setMatch: (n: number) => void;
  aum: number;
  setAum: (n: number) => void;
  life: boolean;
  setLife: (v: boolean) => void;
  esg: boolean;
  setEsg: (v: boolean) => void;
  digital: boolean;
  setDigital: (v: boolean) => void;
  tested: boolean;
  setTested: (v: boolean) => void;
  testing: boolean;
  runTest: () => void;
  showNeg: boolean;
  setShowNeg: (v: boolean) => void;
  design: Design;
  setDesign: (p: Partial<Design>) => void;
  mStep: number;
  runMission: () => void;
  agi: "single" | "team" | "swarm";
  setAgi: (v: "single" | "team" | "swarm") => void;
  docs: Doc[];
  addDoc: () => void;
  reports: number[];
  genReport: (i: number) => void;
};

export type Emp = {
  retAge: number;
  contrib: number;
  policy: string;
  scen: "weak" | "base" | "strong";
  growth: number;
  infl: number;
};

export type Design = {
  young: number;
  mid: number;
  tenured: number;
  employee: number;
  policy: string;
};

export type Doc = { n: string; t: string; src: string; f: string; s: string; d: string };

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

function Trust({ items }: { items: string[] }) {
  return (
    <div className="trust">
      {items.map((t) => (
        <span key={t}>{t}</span>
      ))}
    </div>
  );
}

function Seg({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="seg">
      {options.map((o) => (
        <button key={o.id} className={o.id === value ? "on" : ""} onClick={() => onChange(o.id)} type="button">
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Views({ s, api }: { s: ScreenId; api: Api }) {
  const moat = MoatScreens({ s, goto: api.goto });
  if (moat) return moat;
  const fee = FeeScreens({ s, goto: api.goto });
  if (fee) return fee;
  if (s === "home") return <Home api={api} />;
  if (s === "intel") return <Intel api={api} />;
  if (s === "network") return <NetworkScreen goto={api.goto} />;
  if (s === "employers") return <Employers />;
  if (s === "compare") return <Compare api={api} />;
  if (s === "bench") return <Bench api={api} />;
  if (s === "gap") return <Gap api={api} />;
  if (s === "market") return <Market api={api} />;
  if (s === "tender") return <Tender api={api} />;
  if (s === "marketplace") return <Marketplace />;
  if (s === "watch") return <Watch api={api} />;
  if (s === "committee") return <Committee api={api} />;
  if (s === "employees") return <Employees api={api} />;
  if (s === "workforce") return <Workforce api={api} />;
  if (s === "designer") return <Designer api={api} />;
  if (s === "switching") return <Switching />;
  if (s === "mission") return <Mission api={api} />;
  if (s === "docs") return <Docs api={api} />;
  if (s === "reports") return <Reports api={api} />;
  return <Settings />;
}

function Home({ api }: { api: Api }) {
  const eff = meterScore();
  const ten = wealthDifference(10);
  const questions: { q: string; a: string; d: string; c: string; color: string; go: ScreenId }[] = [
    {
      q: "Is our EPF performing well?",
      a: "Around range",
      d: "Comparable net return 3.8%. An alternative comparable strategy shows 4.6% — a scenario gap, not a forecast.",
      c: "Open benchmark",
      color: INK,
      go: "bench",
    },
    {
      q: "Are we paying too much?",
      a: baht(COMPANY.feeSaving),
      d: `Current annual cost ${baht(COMPANY.annualCost)} versus a best-fit market alternative near ${baht(COMPANY.altCost)}.`,
      c: "See the value gap",
      color: WARN,
      go: "gap",
    },
    {
      q: "Are employees getting good outcomes?",
      a: "64% on track",
      d: "36% are projected short of a 60% income-replacement target. The 51+ band is weakest.",
      c: "Workforce health",
      color: GOOD,
      go: "workforce",
    },
    {
      q: "Is there a better alternative?",
      a: "Test it",
      d: "An anonymous market test prices the fund before any decision to renegotiate or tender.",
      c: "Test the market",
      color: INK,
      go: "market",
    },
  ];
  return (
    <>
      <Head k="EPF24 AI · 23 Sep 2026" title="We continuously test whether your provident fund is still competitive.">
        <button className="btn btn-secondary" onClick={() => api.goto("twin")}>Simulate</button>
        <button className="btn btn-primary" onClick={() => api.goto("market")}>Run market test →</button>
      </Head>
      <section className="poster">
        <div className="kicker">Current EPF value gap</div>
        <div className="poster-num">{baht(COMPANY.annualValue)}<span style={{ fontSize: 22 }}>/year</span></div>
        <div>Corporate saving {baht(COMPANY.feeSaving)}. Employee wealth opportunity {baht(COMPANY.investOpp)}. Illustrative 10-year difference {baht(ten)}.</div>
        <div className="poster-grid">
          <div>
            <b>3</b>
            <span>Better-fit alternatives in the shadow market</span>
          </div>
          <div>
            <b>Negotiate</b>
            <span>AI recommended mission · incumbent, not a forced switch</span>
          </div>
          <div>
            <b>87%</b>
            <span>Sample confidence · 37 anonymized observations</span>
          </div>
        </div>
      </section>
      <div className="actions">
        <button className="btn btn-secondary" type="button" onClick={() => api.goto("shadow")}>Review the shadow market</button>
        <button className="btn btn-secondary" type="button" onClick={() => api.goto("nego")}>Negotiate current provider</button>
        <button className="btn btn-primary" type="button" onClick={() => api.goto("cio")}>Open Autonomous CIO →</button>
      </div>
      <div className="qgrid">
        {questions.map((x) => (
          <button key={x.q} onClick={() => api.goto(x.go)} type="button">
            <span className="qq">{x.q}</span>
            <span className="qa" style={{ color: x.color }}>{x.a}</span>
            <span className="qd">{x.d}</span>
            <span className="qc">{x.c} →</span>
          </button>
        ))}
      </div>
      <div className="stats">
        <div className="stat">
          <span className="muted">EPF market efficiency</span>
          <b>{eff.toFixed(0)}%</b>
          <span className="muted">Weighted peer score · fee and choice pull it down</span>
        </div>
        <div className="stat">
          <span className="muted">Assets</span>
          <b>{baht(COMPANY.aum)}</b>
          <span className="muted">{COMPANY.members.toLocaleString("en-US")} employees</span>
        </div>
        <div className="stat">
          <span className="muted">Current annual cost</span>
          <b>{baht(COMPANY.annualCost)}</b>
          <span className="muted">0.30% all-in · {COMPANY.provider}</span>
        </div>
        <div className="stat">
          <span className="muted">Renewal</span>
          <b>{COMPANY.renewalDays}d</b>
          <span className="muted">Contract ends {COMPANY.renewal}</span>
        </div>
      </div>
      <div>
        <h6>EPF health</h6>
        <div className="health">
          {WATCH.map((h) => (
            <div className="health-cell" key={h.k}>
              <span className="muted">{h.k}</span>
              <span className="big" style={{ fontSize: 28 }}>{h.score}<span className="muted"> /100</span></span>
              <div className="meter-track"><div className="meter-fill" style={{ width: `${h.score}%`, background: toneColor(h.tone) }} /></div>
              <span style={{ fontSize: 12, fontWeight: 600, color: toneColor(h.tone) }}>{h.status}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="split">
        <div>
          <h6>AI insights</h6>
          <div className="rule">
            <div className="rowline" style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 12 }}>
              <span className="tag tag-accent">Fee</span>
              <span>All-in 0.30% sits above the qualified range of 0.19–0.22%. About {baht(COMPANY.feeSaving)} a year versus a best-fit alternative.</span>
            </div>
            <div className="rowline" style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 12 }}>
              <span className="tag tag-accent">Design</span>
              <span>Four investment choices and no Life Path. 71% of members remain in the default balanced policy.</span>
            </div>
            <div className="rowline" style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 12 }}>
              <span className="tag tag-accent">Outcome</span>
              <span>A persisted 0.8 point net-return difference is about {baht(COMPANY.investOpp)} a year on current assets. Scenario only.</span>
            </div>
          </div>
        </div>
        <div>
          <h6>Active alerts</h6>
          <div className="rule">
            <div className="rowline"><b className="warn">Fee watch</b><span>Qualified providers are pricing materially below 0.30%. Estimated opportunity {baht(COMPANY.feeSaving)} / year.</span></div>
            <div className="rowline"><b className="warn">Performance watch</b><span>The selected strategy has trailed the comparable universe over the monitoring window.</span></div>
            <div className="rowline"><b className="warn">Retirement risk</b><span>36% of members are projected below the 60% income-replacement target.</span></div>
          </div>
          <button className="btn btn-ghost" onClick={() => api.goto("watch")}>Open EPF Watch →</button>
        </div>
        <div className="stack">
          <div>
            <h6>Committee actions</h6>
            <div className="rule">
              {[
                ["Request a repricing proposal from Siam Harbor AM", "30 Sep"],
                ["Approve the peer group for the benchmark", "8 Oct"],
                ["Decide: renegotiate, market-test, or tender", "8 Oct"],
              ].map(([t, due]) => (
                <div key={t} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, padding: "10px 0", borderBottom: "1px solid var(--color-divider)", fontSize: 13 }}>
                  <span>{t}</span><span className="muted">{due}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="ink">
            <span className="eyebrow">Upcoming renewal · tender not started</span>
            <strong style={{ fontFamily: "var(--font-heading)", fontSize: 22 }}>Siam Harbor AM contract ends {COMPANY.renewal}</strong>
            <span style={{ fontSize: 13, opacity: 0.85 }}>{COMPANY.renewalDays} days. A market test can price alternatives before a tender. A tender still needs about 14 weeks, including member communication.</span>
            <button className="btn btn-ink" style={{ alignSelf: "flex-start", marginTop: 6 }} onClick={() => api.goto("tender")}>Plan tender →</button>
          </div>
        </div>
      </div>
      <Trust items={["Fee saving: current 0.30% versus best-fit 0.206% on ฿800M", "Investment opportunity: 0.8 point historical/scenario spread × assets", `10-year figure: assets × ((1.046^10) − (1.038^10)) = ${baht(ten)}`, "Not a guaranteed future return", "Calc: deterministic · narrative: AI"]} />
    </>
  );
}

function Intel({ api }: { api: Api }) {
  const q = api.search.trim().toLowerCase();
  const rows = PVD_PRODUCTS.filter((fund) => (api.ptype === "All" || fund.type === api.ptype) && `${fund.en} ${fund.name}`.toLowerCase().includes(q));
  return (
    <>
      <Head k="02 — EPF Intelligence" title="Provident-fund companies and pooled products." lede="Employer funds are on the Employers list. This screen keeps the companies that provide provident-fund services, and pooled product names from the register." />
      <div className="stats">
        {[
          [String(PVD_MANAGERS.length), "PVD management companies"],
          [PVD_PRODUCTS.length.toLocaleString("en-US"), "Pooled product names"],
          ["23,779", "Employers (public, 2024)"],
          ["61.2%", "Employers offering choice"],
          ["6.7%", "Offering Life Path"],
        ].map(([v, k]) => (
          <div className="stat" key={k}><b style={{ fontSize: 28 }}>{v}</b><span className="muted">{k}</span></div>
        ))}
      </div>
      <h6>Companies that provide provident funds <span className="muted">{PVD_MANAGERS.length}</span></h6>
      <div className="mission-grid">
        {PVD_MANAGERS.map((company, i) => (
          <article key={company.name} className="mcard">
            <div className="mcard-id">{String(i + 1).padStart(2, "0")}</div>
            <div className="mcard-title">{company.en}</div>
            <p>Licensed to provide provident-fund services.</p>
            <div className="mcard-meta">
              <span className={`tag ${company.life ? "tag-outline" : "tag-neutral"}`}>{company.life ? "Life Path" : "No Life Path"}</span>
              <span className={`tag ${company.rmf ? "tag-outline" : "tag-neutral"}`}>{company.rmf ? "RMF for PVD" : "No RMF"}</span>
            </div>
          </article>
        ))}
      </div>
      <div className="filters">
        <input className="input" style={{ maxWidth: 360 }} placeholder="Search a pooled product" value={api.search} onChange={(e) => api.setSearch(e.target.value)} />
        <Seg options={POLICY_TYPES.map((p) => ({ id: p, label: p }))} value={api.ptype} onChange={api.setPtype} />
        <span className="muted">{rows.length.toLocaleString("en-US")} products</span>
      </div>
      <h6>Pooled products <span className="muted">{rows.length}</span></h6>
      <div className="scroll">
        <table className="table">
          <thead><tr><th>Product</th><th>Name signal</th></tr></thead>
          <tbody>
            {rows.map((fund) => (
              <tr key={fund.name}>
                <td style={{ fontWeight: 600 }}>{fund.en}</td>
                <td><span className="tag tag-neutral">{fund.type}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Trust items={["Employer funds are on Employers, in English.", "Pooled product names are the register nicknames that are not an employer, shown in English.", "Management companies and Life Path / RMF flags come from the public company list.", "Returns and fees are not on that register, so they are not filled in here."]} />
    </>
  );
}

function Employers() {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const rows = PVD_EMPLOYERS.filter((fund) => `${fund.en} ${fund.name}`.toLowerCase().includes(query));
  return (
    <>
      <Head k="Employers" title="Employers with a registered provident fund." lede="Taken off EPF Intelligence. Each name is the English form of an employer fund on the Thai register." />
      <div className="filters">
        <input className="input" style={{ maxWidth: 360 }} placeholder="Search an employer" value={q} onChange={(e) => setQ(e.target.value)} />
        <span className="muted">{rows.length.toLocaleString("en-US")} employers</span>
      </div>
      <div className="scroll">
        <table className="table">
          <thead><tr><th>Employer</th></tr></thead>
          <tbody>
            {rows.map((fund) => (
              <tr key={fund.name}>
                <td style={{ fontWeight: 600 }}>{fund.en}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Trust items={["Source: distinct fund names on the ThaiPVD employer register, displayed in English.", "This list is not the 17 management companies, and it does not include returns or fees."]} />
    </>
  );
}

function Compare({ api }: { api: Api }) {
  const cols = ["sh", ...api.sel].map((id) => PROVIDERS.find((p) => p.id === id)!);
  const metrics: { label: string; get: (p: (typeof PROVIDERS)[number]) => number | boolean; higher: boolean; fmt: (v: number | boolean) => string }[] = [
    { label: "1Y return", get: (p) => p.r1, higher: true, fmt: (v) => `${v}%` },
    { label: "3Y return (ann.)", get: (p) => p.r3, higher: true, fmt: (v) => `${v}%` },
    { label: "5Y return (ann.)", get: (p) => p.r5, higher: true, fmt: (v) => `${v}%` },
    { label: "Volatility", get: (p) => p.vol, higher: false, fmt: (v) => `${v}%` },
    { label: "Max drawdown", get: (p) => p.dd, higher: true, fmt: (v) => `${v}%` },
    { label: "Total cost (all-in)", get: (p) => p.fee, higher: false, fmt: (v) => feeLabel(v as number) },
    { label: "Annual cost on your assets", get: (p) => annualCost(p.fee), higher: false, fmt: (v) => baht(v as number) },
    { label: "Investment choices", get: (p) => p.choices, higher: true, fmt: (v) => String(v) },
    { label: "Life Path", get: (p) => p.life, higher: true, fmt: (v) => (v ? "Yes" : "No") },
    { label: "ESG option", get: (p) => p.esg, higher: true, fmt: (v) => (v ? "Yes" : "No") },
    { label: "Digital service", get: (p) => p.digital, higher: true, fmt: (v) => `${v}/100` },
    { label: "Member education", get: (p) => p.edu, higher: true, fmt: (v) => `${v}/100` },
  ];
  return (
    <>
      <Head k="03 — Compare" title="Best fit for this workforce, not a universal winner." lede={`Balanced-policy figures for ${COMPANY.name}: ${baht(COMPANY.aum)}, ${COMPANY.members.toLocaleString("en-US")} members, average age ${COMPANY.avgAge}. You set the priorities.`} />
      <div className="stats">
        {[
          ["Company", "Large listed"],
          ["Members", COMPANY.members.toLocaleString("en-US")],
          ["Assets", baht(COMPANY.aum)],
          ["Avg. age", String(COMPANY.avgAge)],
          ["Provider", COMPANY.provider],
          ["Policies", String(COMPANY.choices)],
        ].map(([k, v]) => (
          <div className="stat" key={k}><span className="muted">{k}</span><b style={{ fontSize: 18 }}>{v}</b></div>
        ))}
      </div>
      <div className="stack">
        <span className="muted">Compare against the incumbent (pick up to 3)</span>
        <div className="chips">
          {PROVIDERS.filter((p) => p.id !== "sh").map((p) => (
            <button key={p.id} className={api.sel.includes(p.id) ? "chip on" : "chip"} onClick={() => api.toggleProv(p.id)} type="button">{p.name}</button>
          ))}
        </div>
      </div>
      <div className="scroll">
        <table className="table">
          <thead>
            <tr>
              <th>Metric</th>
              {cols.map((c) => <th key={c.id} className="num">{c.id === "sh" ? `${c.name} (current)` : c.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {metrics.map((m) => {
              const vals = cols.map((c) => m.get(c));
              const nums = vals.map((v) => (typeof v === "boolean" ? (v ? 1 : 0) : v));
              const best = m.higher ? Math.max(...nums) : Math.min(...nums);
              const unique = nums.filter((n) => n === best).length === 1;
              return (
                <tr key={m.label}>
                  <td style={{ fontWeight: 600 }}>{m.label}</td>
                  {cols.map((c, i) => {
                    const win = unique && nums[i] === best;
                    return (
                      <td key={c.id} className="num" style={{ fontWeight: win ? 800 : 400, color: win ? "var(--color-accent-800)" : undefined, background: win ? "var(--color-accent-100)" : undefined }}>
                        {m.fmt(vals[i])}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="actions">
        <span className="muted">Highlighted cell = best in that row only. EPF24 does not declare one provider best.</span>
        <button className="btn btn-primary" onClick={() => api.goto("tender")}>Invite these to a tender →</button>
        <button className="btn btn-secondary" onClick={() => api.goto("market")}>Or test anonymously</button>
      </div>
      <Trust items={["Source: AMC factsheets, service registry — prototype sample", "Benchmark: Thai EPF balanced peer group", "Period: to 30 Jun 2026", "Annual cost = stated all-in rate × ฿800M", "Calc: deterministic"]} />
    </>
  );
}

const BENCH_STEPS = [
  "Reading the fund agreement",
  "Extracting the fee schedule — management, TER, member and employer charges",
  "Parsing factsheets and contribution history",
  "Matching a peer group of similar headcount and assets",
  "Computing the value gap — deterministic engine",
];

function Bench({ api }: { api: Api }) {
  const rows = [
    ["Performance", "Net 3.8%", 28, 70, 48, "Around peer range", "ink"],
    ["Risk", "Vol 6.8%", 25, 70, 32, "Below median risk", "good"],
    ["Fee", "0.30% all-in", 22, 58, 86, "Above comparable range", "warn"],
    ["Investment choice", "4 policies", 35, 78, 18, "Limited", "warn"],
    ["Life Path", "Not offered", 40, 80, 4, "Unavailable", "warn"],
    ["Service", "Moderate", 30, 72, 46, "Adequate", "ink"],
    ["Employee outcome", "64% on track", 40, 75, 38, "Below a 70% floor", "warn"],
  ] as const;
  return (
    <>
      <Head k="04 — AI Benchmark · Free EPF Health Check" title="Your EPF versus the relevant market." lede="Upload the agreement, factsheets and fee schedule. EPF24 extracts the terms and places the fund against comparable employers." />
      {api.bench === 0 && (
        <>
          <div className="stats">
            {[
              ["Agreement", "EPF Management Agreement.pdf", "Ready"],
              ["Fee schedule", "Fee Schedule 2026.xlsx", "Ready · 11 lines"],
              ["Factsheets", "4 policy factsheets", "Ready"],
            ].map(([k, n, st]) => (
              <div className="stat" key={k}><span className="muted">{k}</span><b style={{ fontSize: 16 }}>{n}</b><span className="good" style={{ fontSize: 12, fontWeight: 700 }}>{st}</span></div>
            ))}
          </div>
          <button className="btn btn-primary" onClick={api.runBench}>Run AI extraction →</button>
        </>
      )}
      {api.bench === 1 && (
        <div className="rule" style={{ borderTop: "2px solid var(--color-text)" }}>
          {BENCH_STEPS.map((t, i) => (
            <div key={t} style={{ display: "grid", gridTemplateColumns: "110px 1fr", padding: "12px 0", borderBottom: "1px solid var(--color-divider)", opacity: i <= api.benchStep ? 1 : 0.4 }}>
              <b className="good">{i < api.benchStep ? "Done" : i === api.benchStep ? "Running" : "Queued"}</b>
              <span>{t}</span>
            </div>
          ))}
        </div>
      )}
      {api.bench === 2 && (
        <>
          <div>
            <h6>Current EPF X-Ray</h6>
            <div className="stats">
              {[
                [baht(COMPANY.aum), "Assets"],
                [COMPANY.members.toLocaleString("en-US"), "Employees"],
                [baht(COMPANY.annualCost), "Annual cost"],
                ["3.8%", "Net performance"],
                ["4", "Investment choices"],
                ["No", "Life Path"],
                ["Moderate", "Service"],
                ["82%", "Participation"],
              ].map(([v, k]) => (
                <div className="stat" key={k}><b style={{ fontSize: 26 }}>{v}</b><span className="muted">{k}</span></div>
              ))}
            </div>
          </div>
          <div className="split">
            <div style={{ borderTop: "2px solid var(--color-text)" }}>
              {rows.map(([dim, you, lo, hi, pos, verdict, t]) => (
                <div className="peer" key={dim}>
                  <div><b>{dim}</b><div className="muted">{you}</div></div>
                  <div className="peer-track">
                    <div className="peer-base" />
                    <div className="peer-iqr" style={{ left: `${lo}%`, width: `${hi - lo}%` }} />
                    <div className="peer-you" style={{ left: `${pos}%` }} />
                  </div>
                  <b style={{ color: toneColor(t), fontSize: 13 }}>{verdict}</b>
                </div>
              ))}
              <p className="muted" style={{ paddingTop: 8 }}>Bar = peer interquartile range. Black mark = your EPF.</p>
            </div>
            <div className="stack">
              <div className="poster">
                <span className="kicker">Potential annual fee improvement</span>
                <span className="poster-num" style={{ fontSize: 48 }}>{baht(COMPANY.feeSaving)}</span>
                <span>Versus a best-fit alternative at about {baht(COMPANY.altCost)}. Employee investment opportunity, shown separately, is {baht(COMPANY.investOpp)} / year.</span>
              </div>
              <div>
                <h6>AI action</h6>
                <p>Consider repricing with Siam Harbor AM, or run an anonymous market test before a tender.</p>
                {[
                  "Employer-borne admin is the largest fee outlier.",
                  "Add a Life Path default. 71% of members are in Balanced by inertia.",
                  "Member app use is 18%. Ask for an engagement plan with a participation target.",
                ].map((f) => <div key={f} style={{ padding: "8px 0", borderBottom: "1px solid var(--color-divider)" }}>{f}</div>)}
              </div>
              <div className="actions">
                <button className="btn btn-secondary" onClick={api.resetBench}>Re-run</button>
                <button className="btn btn-primary" onClick={() => api.goto("market")}>Test the market →</button>
              </div>
            </div>
          </div>
          <Trust items={["Source: 3 uploaded documents, peer set illustrative", "Extraction: AI, human-reviewable", "Calc: deterministic", "Period: 3Y to 30 Jun 2026", "Audit trail: #BM-2026-0923"]} />
        </>
      )}
    </>
  );
}

function Gap({ api }: { api: Api }) {
  const ten = wealthDifference(10);
  const eff = meterScore();
  const gaps = [
    ["Fee gap", baht(COMPANY.feeSaving), "0.30% versus a best-fit at 0.206% (฿1.65M a year).", "warn"],
    ["Performance gap", baht(COMPANY.investOpp), "3.8% versus a 4.6% comparable strategy. Scenario, not a promise.", "warn"],
    ["Risk gap", "Modest", "Volatility is below peers. The return lag is not explained by extra risk.", "ink"],
    ["Service gap", "Moderate", "SLA is mostly met. Digital and education trail closer alternatives.", "ink"],
    ["Investment choice gap", "Limited", "4 policies. Life Path, ESG and a richer global option are missing.", "warn"],
    ["Retirement gap", "36% shortfall", "Projected share of members below a 60% income-replacement target.", "warn"],
    ["Participation gap", "82% in, 71% default", "Most members contribute, then stay in the default policy.", "ink"],
  ] as const;
  return (
    <>
      <Head k="05 — Value Gap Engine" title="How much value is the current fund leaving on the table?" lede="One number for the CEO, CFO, CHRO and the provident-fund committee. Built from fee, performance, risk, service, choice, retirement and participation." />
      <section className="poster">
        <div className="kicker">Your EPF value gap</div>
        <div className="poster-num">{baht(COMPANY.annualValue)}<span style={{ fontSize: 22 }}>/year</span></div>
        <div>Market efficiency {eff.toFixed(0)}%. Corporate fee opportunity {baht(COMPANY.feeSaving)}. Employee investment opportunity {baht(COMPANY.investOpp)}.</div>
      </section>
      <div>
        {gaps.map(([k, v, d, t]) => (
          <div className="gap-row" key={k}>
            <b>{k}</b>
            <span className="muted">{d}</span>
            <b style={{ color: toneColor(t) }}>{v}</b>
          </div>
        ))}
      </div>
      <div>
        <h6>Value meter · {eff.toFixed(0)}% market efficient</h6>
        <div className="rule">
          {METER.map((p) => (
            <div key={p.k} style={{ display: "grid", gridTemplateColumns: "140px 48px 1fr 1fr", gap: 12, alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--color-divider)" }}>
              <b>{p.k}</b>
              <span className="muted">{p.w}%</span>
              <div className="meter-track" style={{ margin: 0 }}><div className="meter-fill" style={{ width: `${p.score}%`, background: "var(--color-accent)" }} /></div>
              <span className="muted">{p.note}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h6>What if we change?</h6>
        <div className="scenarios">
          <article>
            <span className="kicker">Stay</span>
            <span className="big">{baht(COMPANY.annualCost)}</span>
            <span className="muted">per year, current provider</span>
            <p>Employee outcome stays on the current baseline. Renewal arrives with the same information disadvantage.</p>
          </article>
          <article>
            <span className="kicker">Renegotiate</span>
            <span className="big good">{baht(COMPANY.renegotiateSaving)}</span>
            <span className="muted">estimated annual saving if price moves toward 0.235%</span>
            <p>Uses benchmark evidence. No provider change. Investment lineup stays unless the incumbent agrees to add Life Path.</p>
            <button className="btn btn-secondary" onClick={() => { api.setShowNeg(true); api.goto("market"); }}>Open negotiation pack</button>
          </article>
          <article>
            <span className="kicker">Switch · best fit</span>
            <span className="big good">{baht(COMPANY.feeSaving)}</span>
            <span className="muted">corporate fee saving / year</span>
            <p>Historical/scenario net-return difference +0.80%. Illustrative 10-year employee wealth difference {baht(ten)}. Cheapest bid would save {baht(COMPANY.cheapestSaving)} — cheapest is not best.</p>
            <button className="btn btn-primary" onClick={() => api.goto("market")}>Test before you switch →</button>
          </article>
        </div>
      </div>
      <Trust items={["Annual value = fee opportunity + one-year investment scenario", `10-year wealth = ${baht(COMPANY.aum)} × ((1.046^10) − (1.038^10))`, "Renegotiate target 0.235% is a planning case, not an offer", "Switch fee uses best-fit Chao Phraya at 0.206% (฿1.65M), not the 0.19% floor", "Calc: deterministic · AI explains only"]} />
    </>
  );
}

function Market({ api }: { api: Api }) {
  const q = marketQuote(api.aum, api.life, api.esg, api.digital);
  return (
    <>
      <Head k="06 — Market Test · core product" title="Price the market before you promise to move." lede="The company stays anonymous. Providers see a profile, not a name. Use the result to renegotiate the incumbent or to open a tender.">
        <span className="tag tag-outline">Identity hidden</span>
      </Head>
      <div className="split">
        <div className="stack">
          <div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Assets in the test</span><b>{baht(api.aum)}</b></div>
            <input type="range" min={400} max={2000} step={50} value={api.aum / 1_000_000} onChange={(e) => { api.setAum(Number(e.target.value) * 1_000_000); api.setTested(false); }} />
          </div>
          <div className="stats">
            <div className="stat"><span className="muted">Employees</span><b style={{ fontSize: 22 }}>{Math.round(COMPANY.members * (api.aum / COMPANY.aum)).toLocaleString("en-US")}</b></div>
            <div className="stat"><span className="muted">Avg. age</span><b style={{ fontSize: 22 }}>{COMPANY.avgAge}</b></div>
            <div className="stat"><span className="muted">Current rate</span><b style={{ fontSize: 22 }}>0.30%</b></div>
          </div>
          {[
            ["Life Path required", api.life, api.setLife],
            ["ESG option required", api.esg, api.setEsg],
            ["Digital app required", api.digital, api.setDigital],
          ].map(([label, on, set]) => (
            <label key={label as string} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 0", borderBottom: "1px solid var(--color-divider)" }}>
              <span>{label as string}</span>
              <input type="checkbox" checked={on as boolean} onChange={(e) => { (set as (v: boolean) => void)(e.target.checked); api.setTested(false); }} />
            </label>
          ))}
          <button className="btn btn-primary" onClick={api.runTest} disabled={api.testing}>{api.testing ? "Providers responding…" : "Test the market →"}</button>
          <p className="muted">Qualified providers in this filter: {q.set.map((p) => p.name).join(", ") || "None — relax a requirement."}</p>
        </div>
        <div className="stack">
          {!api.tested && !api.testing && <div className="surface"><h6 style={{ margin: 0 }}>Waiting for a test</h6><p style={{ margin: 0 }}>Nothing is sent to a named provider. The engine prices your profile against the normalized book.</p></div>}
          {api.testing && <div className="surface"><h6 style={{ margin: 0 }}>Collecting anonymous indications</h6><p style={{ margin: 0 }}>Standardizing fees onto the EPF24 all-in basis so a 0.19% and a 0.30% mean the same thing.</p></div>}
          {api.tested && (
            <div className="poster">
              <span className="kicker">Potential saving · best fit</span>
              <span className="poster-num" style={{ fontSize: 52 }}>{baht(q.saving)}</span>
              <span>/ year versus current {baht(q.current)}</span>
              <div className="poster-grid">
                <div><b>{baht(q.median)}</b><span>Qualified median</span></div>
                <div><b>{baht(q.competitive)}</b><span>Competitive best fit{q.fitName ? ` · ${q.fitName}` : ""}</span></div>
                <div><b>{baht(q.cheapest)}</b><span>Lowest qualified fee</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
      {api.tested && (
        <>
          <div className="actions">
            <button className="btn btn-primary" onClick={() => api.setShowNeg(true)}>Make the incumbent compete →</button>
            <button className="btn btn-secondary" onClick={() => api.goto("tender")}>Start a tender</button>
          </div>
          <p className="muted">Cheapest is not best. The best-fit line prefers a qualified provider that also covers Life Path, service and a comparable strategy. The floor is shown so the committee can see the price of ignoring everything except fee.</p>
        </>
      )}
      {api.showNeg && <Negotiation aum={api.aum} />}
      <Trust items={["Anonymous profile: headcount, assets, requirements. No company name.", "Provider commercial relationships are disclosed in Settings and do not change this ranking.", "Indications are prototype scenarios, not live bids.", "Calc: deterministic"]} />
    </>
  );
}

function Negotiation({ aum }: { aum: number }) {
  const current = annualCost(0.003, aum);
  const low = current - annualCost(0.0019, aum);
  const mid = current - annualCost(0.0022, aum);
  const realistic = current - annualCost(0.00235, aum);
  return (
    <div className="split">
      <div>
        <h6>Negotiation pack · stay with Siam Harbor AM</h6>
        <div className="rule">
          {[
            ["Current pricing", "0.30% all-in"],
            ["Comparable qualified range", "0.19–0.22%"],
            ["Target to open with", "0.206% · ฿1.65M on current assets"],
            ["Planning case if they meet you part-way", `0.235% · save ${baht(realistic)} / year`],
            ["Full range of opportunity", `${baht(mid)} – ${baht(low)} / year`],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--color-divider)" }}><span>{k}</span><b>{v}</b></div>
          ))}
        </div>
      </div>
      <div className="surface">
        <h6 style={{ margin: 0 }}>Talking points for management</h6>
        {[
          "Our all-in rate is outside the qualified range for this asset size.",
          "Three alternatives offer Life Path. We do not. 71% of members sit in the default.",
          "We can reprice and add Life Path, or we will test the market in a formal tender.",
          "Ask for a 5-year fee schedule on the EPF24 all-in template, including admin, TER and member charges.",
          "Performance will be judged on a pre-agreed peer group, not the provider’s own factsheet chart.",
        ].map((t) => <p key={t} style={{ margin: 0, paddingBottom: 8, borderBottom: "1px solid var(--color-divider)" }}>{t}</p>)}
        <p className="muted" style={{ margin: 0 }}>Route A — switch. Route B — make the existing provider compete. Both use the same evidence.</p>
      </div>
    </div>
  );
}

function Tender({ api }: { api: Api }) {
  const steps = ["Requirements", "RFP draft", "Bids & auction", "Decision"];
  const ranked = scoreBids(api.weights);
  const wSum = Object.values(api.weights).reduce((a, b) => a + b, 0) || 1;
  const auction = PROVIDERS.filter((p) => p.id !== "ng").sort((a, b) => b.fee - a.fee);
  return (
    <>
      <Head k="07 — AI EPF Tender · RFP-2026-031" title="From requirements to a committee decision." lede="EPF24 drafts, distributes and normalizes. The committee sets the weights. Cheapest is not best." />
      <div className="steps">
        {steps.map((label, i) => (
          <button key={label} className={i === api.tstep ? "on" : i < api.tstep ? "done" : ""} onClick={() => api.setTstep(i)} type="button">
            <div style={{ fontSize: 11 }}>Step {i + 1}</div>
            <div style={{ fontWeight: 800 }}>{label}</div>
          </button>
        ))}
      </div>
      {api.tstep === 0 && (
        <div className="split">
          <div>
            {[
              ["Number of employees?", COMPANY.members.toLocaleString("en-US")],
              ["Total EPF assets?", baht(COMPANY.aum)],
              ["Average age?", String(COMPANY.avgAge)],
              ["Salary distribution?", "Median ฿32,000 · P90 ฿110,000"],
              ["Contribution structure?", "Employee 3–15% · employer 5% flat"],
              ["Required policies?", "At least 6, including global equity"],
              ["Life Path?", "Required, as the default"],
              ["ESG?", "At least one option"],
              ["Foreign investment?", "Up to 60%"],
              ["Member services?", "Bilingual app, quarterly education, advice line"],
            ].map(([q, a]) => (
              <div key={q} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--color-divider)" }}>
                <span><b className="good" style={{ fontSize: 11, marginRight: 8 }}>AI</b>{q}</span>
                <input className="input" defaultValue={a} />
              </div>
            ))}
          </div>
          <div className="surface" style={{ alignSelf: "start" }}>
            <h6 style={{ margin: 0 }}>Procurement Agent</h6>
            <p style={{ margin: 0 }}>Pre-filled from the benchmark and the member census. Confirm the answers and EPF24 drafts the RFP, including migration and the SLA.</p>
            <button className="btn btn-primary" onClick={() => api.setTstep(1)}>Generate RFP →</button>
          </div>
        </div>
      )}
      {api.tstep === 1 && (
        <div className="split">
          <div className="rfp">
            <div className="muted" style={{ letterSpacing: "0.12em", textTransform: "uppercase", fontSize: 11 }}>Request for proposal · Draft v1</div>
            <h2 style={{ margin: 0 }}>Provident Fund Management Services — {COMPANY.name}</h2>
            {[
              ["1", "Fund profile", `${COMPANY.members.toLocaleString("en-US")} members, ${baht(COMPANY.aum)} assets, 4 current policies, transfer date 1 Apr 2027.`],
              ["2", "Investment architecture", "Minimum 6 policies including a Life Path default, an ESG option and global equity."],
              ["3", "Fees", "Every layer on the EPF24 all-in template: management, TER, member charges, employer charges, underlying funds."],
              ["4", "Service level", "NAV by T+1, member queries within 2 business days, quarterly committee reporting."],
              ["5", "Member experience", "Bilingual app, retirement projections, an education programme with a participation target."],
              ["6", "Migration", "Timeline, blackout, reconciliation, data migration and member communication."],
            ].map(([n, h, b]) => (
              <div className="rfp-sec" key={n}><b>{n}</b><div><b>{h}</b><div className="muted">{b}</div></div></div>
            ))}
          </div>
          <div className="stack" style={{ alignSelf: "start" }}>
            <h6 style={{ margin: 0 }}>Response deadline</h6>
            <div className="big" style={{ fontSize: 28 }}>4 Nov 2026</div>
            <h6 style={{ margin: 0 }}>Committee sign-off</h6>
            <div>Approved 3 of 5 · pending M. Chai, P. Anong</div>
            <button className="btn btn-primary" onClick={() => api.setTstep(2)}>Send to providers →</button>
          </div>
        </div>
      )}
      {api.tstep === 2 && (
        <div className="stack">
          <table className="table">
            <thead><tr><th>Provider</th><th>Invited</th><th>Status</th><th>Q&A</th><th className="num">Normalized</th></tr></thead>
            <tbody>
              {[
                ["Chao Phraya Capital", "Submitted", "3", "Yes", "tag-accent"],
                ["Lanna Asset", "Submitted", "5", "Yes", "tag-accent"],
                ["Andaman Investment", "Submitted", "2", "Yes", "tag-accent"],
                ["Krungthep Fund Partners", "Submitted", "4", "Yes", "tag-accent"],
                ["Siam Harbor AM (incumbent)", "Repriced offer", "1", "Yes", "tag-outline"],
                ["Northgate AM", "Declined", "0", "—", "tag-neutral"],
              ].map(([name, status, qa, norm, tag]) => (
                <tr key={name}><td style={{ fontWeight: 600 }}>{name}</td><td>7 Oct</td><td><span className={`tag ${tag}`}>{status}</span></td><td>{qa}</td><td className="num">{norm}</td></tr>
              ))}
            </tbody>
          </table>
          <h6>Controlled bid · all-in fee</h6>
          <div className="auction">
            {auction.map((p) => (
              <div className="auction-row" key={p.id}>
                <span>{p.id === "sh" ? `${p.name} (current)` : p.name}</span>
                <b>{feeLabel(p.fee)}</b>
                <div className="track"><i style={{ width: `${(p.fee / 0.003) * 100}%`, background: p.fee === Math.min(...auction.map((x) => x.fee)) ? "var(--color-neutral-600)" : "var(--color-accent)" }} /></div>
              </div>
            ))}
          </div>
          <div className="ink">
            <span className="eyebrow">Potential fee saving versus cheapest</span>
            <strong style={{ fontSize: 28 }}>{baht(COMPANY.cheapestSaving)} / year</strong>
            <span>0.30% → 0.19% on {baht(COMPANY.aum)}. The committee still scores performance, risk, service, technology and employee outcome. Cheapest ≠ best.</span>
          </div>
          <button className="btn btn-primary" style={{ alignSelf: "flex-start" }} onClick={() => api.setTstep(3)}>Open decision matrix →</button>
        </div>
      )}
      {api.tstep === 3 && (
        <div className="split">
          <div>
            <h6>Committee weights · displayed share of {wSum}</h6>
            {CRITERIA.map((c) => (
              <div key={c.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--color-divider)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span>{c.label}</span><b>{Math.round((api.weights[c.id] / wSum) * 100)}%</b></div>
                <input type="range" min={0} max={40} value={api.weights[c.id]} onChange={(e) => api.setWeight(c.id, Number(e.target.value))} />
              </div>
            ))}
          </div>
          <div style={{ borderTop: "2px solid var(--color-text)" }}>
            {ranked.map((m, i) => (
              <div key={m.id} style={{ display: "grid", gridTemplateColumns: "36px 1.3fr 1fr 56px", gap: 12, alignItems: "center", padding: "14px 0", borderBottom: "1px solid var(--color-divider)" }}>
                <span className="big" style={{ fontSize: 22 }}>{i + 1}</span>
                <div><b>{m.name}</b><div className="muted">{m.note}</div></div>
                <div className="meter-track" style={{ margin: 0 }}><div className="meter-fill" style={{ width: `${m.score}%`, background: i === 0 ? "var(--color-accent)" : "var(--color-neutral-500)" }} /></div>
                <b style={{ textAlign: "right" }}>{m.score.toFixed(1)}</b>
              </div>
            ))}
            <p className="muted">Weighted from normalized proposals. Independent Challenger: Andaman’s return lead leans on a 2024 foreign-equity overweight. Krungthep’s fee holds on a 5-year term. Chao Phraya leads when employee outcome and Life Path carry weight. Scores use the sample matrix in this prototype, not a live auction.</p>
          </div>
        </div>
      )}
    </>
  );
}

function Marketplace() {
  const [tab, setTab] = useState("emp");
  const cards = [...PROVIDERS].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <>
      <Head k="08 — Marketplace" title="Employers and providers, on one standard." lede="Every submission is restated into the same fields. Listing order is alphabetical. A portal fee never changes the analysis.">
        <Seg options={[{ id: "emp", label: "Employer view" }, { id: "amc", label: "Provider portal" }]} value={tab} onChange={setTab} />
      </Head>
      {tab === "emp" && (
        <>
          <div className="cards">
            {cards.map((p) => (
              <article className="card" key={p.id}>
                <div className="card-kicker">{p.id === "sh" ? "Your current provider" : "EPF provider"}</div>
                <div className="card-title">{p.name}</div>
                <div className="trio">
                  <div><div className="muted">Policies</div><b>{p.choices}</b></div>
                  <div><div className="muted">All-in</div><b>{feeLabel(p.fee)}</b></div>
                  <div><div className="muted">Life Path</div><b>{p.life ? "Yes" : "No"}</b></div>
                </div>
                <div className="muted">Digital {p.digital} · Education {p.edu} · ESG {p.esg ? "Yes" : "No"}</div>
              </article>
            ))}
          </div>
          <p className="muted">EPF24 is provider-agnostic. Providers may later pay a flat, disclosed participation fee. That relationship is structurally separate from benchmarks, value gap and tender scores.</p>
        </>
      )}
      {tab === "amc" && (
        <div className="split">
          <div className="stack">
            <span className="tag tag-accent" style={{ alignSelf: "flex-start" }}>Provider portal · Lanna Asset</span>
            <h2 style={{ margin: 0 }}>Incoming RFP — profile withheld</h2>
            <p>About {baht(COMPANY.aum)} · about {COMPANY.members.toLocaleString("en-US")} members · Life Path, ESG and a bilingual app required. Deadline 4 Nov 2026. Employer name stays hidden until the committee opens the shortlist.</p>
            <div style={{ borderTop: "2px solid var(--color-text)" }}>
              {[
                ["Fee schedule (all-in template)", true],
                ["Investment policies and track record", true],
                ["SLA commitments", true],
                ["Member services", true],
                ["Technology and app", true],
                ["Education programme", true],
                ["Migration plan", false],
                ["ESG methodology", false],
                ["Other proposal terms", false],
              ].map(([t, done]) => (
                <div className="check" key={t as string}>
                  <b style={{ color: done ? GOOD : "var(--color-neutral-700)" }}>{done ? "✓" : "○"}</b>
                  <span>{t as string}</span>
                  <span className="muted">{done ? "Complete" : "Draft"}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="surface" style={{ alignSelf: "start" }}>
            <h6 style={{ margin: 0 }}>Submission</h6>
            <div className="big">6 / 9</div>
            <p style={{ margin: 0 }}>On submit, fees are restated to the EPF24 all-in basis. You see that restatement before the employer does.</p>
            <button className="btn btn-primary">Continue proposal →</button>
          </div>
        </div>
      )}
    </>
  );
}

function Watch({ api }: { api: Api }) {
  const alerts = [
    ["Fee watch", `Comparable providers are offering materially lower all-in costs. Estimated opportunity ${baht(COMPANY.feeSaving)} / year.`, "Fee Analyst · deterministic · 22 Sep", "Consider requesting a reprice."],
    ["Performance watch", "The selected strategy has trailed the defined comparable universe over the monitoring window.", "Performance Analyst · rolling · 21 Sep", "Initiate an investment-policy review."],
    ["Retirement risk", "36% of members are projected below the 60% income-replacement target. The 51+ band is at 49% on track.", "Retirement Agent · member twins · 20 Sep", "Review default policy and match."],
  ];
  const trend = [8, 14, 6, 22, 10, 4, 18, 28, 12, 6, 20, 16];
  return (
    <>
      <Head k="09 — EPF Watch" title="Continuous monitoring. Exceptions only." lede="Performance, risk, fee, service, employee outcome and governance, checked against thresholds the committee set." />
      <div className="health">
        {WATCH.map((h) => (
          <div className="health-cell" key={h.k}>
            <span className="muted">{h.k}</span>
            <b>{h.score}</b>
            <span className="muted">{h.detail}</span>
            <span style={{ fontWeight: 700, color: toneColor(h.tone), fontSize: 12 }}>{h.status}</span>
          </div>
        ))}
      </div>
      <div className="split">
        <div>
          <h6>Exception alerts</h6>
          <div className="rule">
            {alerts.map(([title, body, meta, action], i) => (
              <div key={title} className="rowline" style={{ opacity: api.acked.includes(i) ? 0.45 : 1 }}>
                <b className="warn">{title}</b>
                <span>{body}</span>
                <span className="muted">AI action: {action}</span>
                <span className="muted">{meta}</span>
                <button className="btn btn-secondary" onClick={() => api.ack(i)}>{api.acked.includes(i) ? "Acknowledged" : "Acknowledge"}</button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h6>Balanced policy vs peer median · monthly excess return</h6>
          <div className="trend">
            <div className="zero" />
            {trend.map((t, i) => (
              <div className="col" key={i}>
                <div style={{ height: 90, display: "flex", alignItems: "flex-end" }}>{i % 3 !== 2 ? <div style={{ width: "100%", height: t, background: "var(--color-accent)" }} /> : null}</div>
                <div style={{ height: 90 }}>{i % 3 === 2 ? <div style={{ width: "100%", height: t, background: "var(--color-neutral-600)" }} /> : null}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }} className="muted"><span>Oct 2025</span><span>Sep 2026</span></div>
        </div>
      </div>
    </>
  );
}

function Committee({ api }: { api: Api }) {
  return (
    <>
      <Head k="10 — Committee AI · Q3 2026 meeting, 8 Oct" title="Secretary, analyst and memory for the committee." lede="Prepared from the fund record. Decisions and actions stay attached to the meeting that made them." />
      <div className="tabs">
        {[["before", "Before"], ["during", "During"], ["after", "After"]].map(([id, label]) => (
          <button key={id} className={api.ctab === id ? "on" : ""} onClick={() => api.setCtab(id)} type="button">{label}</button>
        ))}
      </div>
      {api.ctab === "before" && (
        <div className="split">
          <div>
            <h6>Executive summary</h6>
            {[
              "Performance is around the peer range, with lower volatility than the median.",
              `All-in cost is 0.30%. Best-fit fee opportunity is about ${baht(COMPANY.feeSaving)} a year.`,
              `A 0.8 point scenario return gap is about ${baht(COMPANY.investOpp)} a year on current assets.`,
              "No Life Path. 71% of members sit in the default.",
              `Contract ends ${COMPANY.renewal}. This meeting should choose: reprice, market-test, or tender.`,
            ].map((b) => <p key={b} style={{ borderBottom: "1px solid var(--color-divider)", paddingBottom: 10 }}>{b}</p>)}
          </div>
          <div>
            <h6>Agenda</h6>
            {[
              ["10:00", "Performance and risk"],
              ["10:20", "Value gap and fee benchmark"],
              ["10:40", "Workforce retirement health"],
              ["11:00", "Decision: renegotiate, test, or tender"],
              ["11:20", "Actions"],
            ].map(([t, i]) => (
              <div key={t} style={{ display: "grid", gridTemplateColumns: "64px 1fr", padding: "8px 0", borderBottom: "1px solid var(--color-divider)" }}><b>{t}</b><span>{i}</span></div>
            ))}
          </div>
          <div>
            <h6>Questions for Siam Harbor AM</h6>
            {[
              "Which fee layers explain 0.30% against a qualified range of 0.19–0.22%?",
              "What drove the lag versus the comparable universe, and what has changed?",
              "Can you offer a Life Path default by 1 April 2027?",
              "What does a 5-year repriced all-in schedule look like?",
            ].map((b) => <p key={b} style={{ borderBottom: "1px solid var(--color-divider)", paddingBottom: 10 }}>{b}</p>)}
            <button className="btn btn-secondary">Export board pack</button>
          </div>
        </div>
      )}
      {api.ctab === "during" && (
        <div className="split">
          <div style={{ borderTop: "2px solid var(--color-text)" }}>
            <div className="good" style={{ fontWeight: 800, padding: "10px 0" }}>● Live transcription · 00:42:18</div>
            {[
              ["M. Chai", "The fee gap is material. I want a reprice and a market test in parallel."],
              ["K. Suda", "We can issue the RFP after today if the committee agrees the weights."],
              ["P. Anong", "Put more weight on risk. Our members are conservative."],
              ["Chair", "Agreed. Market test first. Tender if the reprice misses 0.22%."],
              ["K. Suda", "I will circulate the anonymous profile today."],
            ].map(([who, said]) => (
              <div key={who} style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--color-divider)" }}><b>{who}</b><span>{said}</span></div>
            ))}
          </div>
          <div>
            <h6>Detected</h6>
            {[
              ["Decision", "Run an anonymous market test in parallel with the repricing request."],
              ["Decision", "Open a tender if the reprice does not reach 0.22%."],
              ["Action", "K. Suda circulates the anonymous profile today."],
            ].map(([k, t]) => (
              <div key={t} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--color-divider)" }}><span className="tag tag-accent">{k}</span><span>{t}</span></div>
            ))}
          </div>
        </div>
      )}
      {api.ctab === "after" && (
        <div className="stack">
          <table className="table">
            <thead><tr><th>Action</th><th>Owner</th><th>Due</th><th>Status</th></tr></thead>
            <tbody>
              {[
                ["Circulate anonymous market-test profile", "K. Suda", "24 Sep 2026", "Open"],
                ["Obtain a repricing offer", "M. Chai", "20 Oct 2026", "Open"],
                ["Confirm evaluation weights", "Committee", "15 Oct 2026", "Open"],
                ["Draft Life Path default", "P. Anong", "5 Nov 2026", "Open"],
                ["Approve Q2 minutes", "Chair", "8 Oct 2026", "Done"],
              ].map(([t, o, d, st]) => (
                <tr key={t}><td>{t}</td><td>{o}</td><td>{d}</td><td><span className={`tag ${st === "Done" ? "tag-accent" : "tag-outline"}`}>{st}</span></td></tr>
              ))}
            </tbody>
          </table>
          <div className="actions">
            <button className="btn btn-primary">Circulate minutes</button>
            <button className="btn btn-secondary">Governance record</button>
          </div>
        </div>
      )}
    </>
  );
}

function Employees({ api }: { api: Api }) {
  const proj = projectMember({
    age: 34,
    retireAge: api.emp.retAge,
    balance: 1_280_000,
    salaryMonthly: 32_000,
    contrib: api.emp.contrib,
    employer: 5,
    growth: api.emp.growth,
    infl: api.emp.infl,
    policy: api.emp.policy,
    scenario: api.emp.scen,
  });
  const max = Math.max(proj.target, proj.bal, 1) * 1.08;
  const answers: Record<string, string> = {
    "10%": `At a 10% employee contribution the engine projects ${baht(projectMember({ age: 34, retireAge: api.emp.retAge, balance: 1_280_000, salaryMonthly: 32_000, contrib: 10, employer: 5, growth: api.emp.growth, infl: api.emp.infl, policy: api.emp.policy, scenario: api.emp.scen }).bal)} at ${api.emp.retAge}, before stating that as a guarantee. Your employer’s 5% is already inside the sum.`,
    "60": `At 60, on the controls you have set, the projected balance is ${baht(projectMember({ ...baseEmp(api), retireAge: 60 }).bal)} in future baht, about ${baht(projectMember({ ...baseEmp(api), retireAge: 60 }).real)} in today’s money.`,
    "policy": policyPlain(api.emp.policy),
    "fall": "A weak-market case reduces the planning return by 1.5 points a year. It changes the picture. It is still a scenario, not a prediction of the next crash. Try the Weak control.",
    "save": proj.gap > 0 ? `The illustrative gap is ${baht(proj.gap)}. Raising your own contribution is the lever you control. The employer match is already included at 5%.` : "On these assumptions the projection meets the target. Review it after a salary change.",
  };
  return (
    <>
      <Head k="11 — Employees · Retirement Digital Twin" title="Will I have enough when I retire?" lede="Somchai P. · age 34 · salary ฿32,000 / month · member since 2017. The chart is a deterministic projection. The words around it are the copilot.">
        <span className="tag tag-outline">Preview as member · HR cannot see this record</span>
      </Head>
      <div className="stats">
        <div className="stat"><span className="muted">Current balance</span><b style={{ fontSize: 28 }}>฿1.28M</b></div>
        <div className="stat"><span className="muted">Projected at {api.emp.retAge}</span><b style={{ fontSize: 28 }}>{baht(proj.bal)}</b><span className="muted">{baht(proj.real)} in today’s money</span></div>
        <div className="stat"><span className="muted">Target retirement wealth</span><b style={{ fontSize: 28 }}>{baht(proj.target)}</b></div>
        <div className="stat"><span className="muted">{proj.gap > 0 ? "Projected gap" : "Projected surplus"}</span><b style={{ fontSize: 28, color: proj.gap > 0 ? WARN : GOOD }}>{baht(Math.abs(proj.gap))}</b></div>
      </div>
      <div className="split">
        <div className="stack">
          <div><div className="muted">Retire at</div><Seg options={[{ id: "55", label: "55" }, { id: "60", label: "60" }, { id: "65", label: "65" }]} value={String(api.emp.retAge)} onChange={(v) => api.setEmp({ retAge: Number(v) })} /></div>
          <div><div className="muted">My contribution (employer adds 5%)</div><Seg options={[{ id: "3", label: "3%" }, { id: "5", label: "5%" }, { id: "10", label: "10%" }, { id: "15", label: "15%" }]} value={String(api.emp.contrib)} onChange={(v) => api.setEmp({ contrib: Number(v) })} /></div>
          <div><div className="muted">Investment policy</div><Seg options={[{ id: "cons", label: "Conservative" }, { id: "bal", label: "Balanced" }, { id: "life", label: "Life Path" }, { id: "grow", label: "Growth" }]} value={api.emp.policy} onChange={(v) => api.setEmp({ policy: v })} /></div>
          <div><div className="muted">Market scenario</div><Seg options={[{ id: "weak", label: "Weak" }, { id: "base", label: "Base" }, { id: "strong", label: "Strong" }]} value={api.emp.scen} onChange={(v) => api.setEmp({ scen: v as Emp["scen"] })} /></div>
          <div><div style={{ display: "flex", justifyContent: "space-between" }}><span>Salary growth</span><b>{api.emp.growth}% / yr</b></div><input type="range" min={0} max={6} step={0.5} value={api.emp.growth} onChange={(e) => api.setEmp({ growth: Number(e.target.value) })} /></div>
          <div><div style={{ display: "flex", justifyContent: "space-between" }}><span>Expected inflation</span><b>{api.emp.infl}% / yr</b></div><input type="range" min={0} max={5} step={0.5} value={api.emp.infl} onChange={(e) => api.setEmp({ infl: Number(e.target.value) })} /></div>
        </div>
        <div className="stack">
          <h6 style={{ margin: 0 }}>Projected balance by age · dashed line = target</h6>
          <div className="bars">
            <div className="dash" style={{ bottom: `${(proj.target / max) * 100}%` }} />
            {proj.pts.map((p) => (
              <i key={p.age} style={{ height: `${(p.bal / max) * 100}%`, background: p.age === api.emp.retAge ? "var(--color-accent)" : "var(--color-neutral-400)" }} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {proj.pts.map((p) => <span key={p.age} style={{ flex: 1 }} className="muted">{p.age}</span>)}
          </div>
          <div className="surface"><b>Retirement copilot. </b>{answers[api.copilot] ?? (proj.gap > 0 ? "The projection is short of the target on these assumptions. Contribution rate is the lever you control." : "The projection meets the target on these assumptions.")}</div>
          <div className="chips">
            {[
              ["10%", "What if I contribute 10%?"],
              ["60", "How much at 60?"],
              ["policy", "What does this policy mean?"],
              ["fall", "What if markets fall?"],
              ["save", "How much more should I save?"],
            ].map(([id, label]) => (
              <button key={id} className={api.copilot === id ? "chip on" : "chip"} onClick={() => api.setCopilot(id)} type="button">{label}</button>
            ))}
          </div>
          <p className="muted">Illustrative projection, not a guarantee. Planning returns before the scenario adjustment: Conservative 3%, Balanced 5%, Life Path 5.8%, Growth 6.5%. Target = 46% of final salary × years from retirement to 85. AI interprets the engine. It does not invent the number.</p>
        </div>
      </div>
    </>
  );
}

function baseEmp(api: Api) {
  return {
    age: 34,
    retireAge: api.emp.retAge,
    balance: 1_280_000,
    salaryMonthly: 32_000,
    contrib: api.emp.contrib,
    employer: 5,
    growth: api.emp.growth,
    infl: api.emp.infl,
    policy: api.emp.policy,
    scenario: api.emp.scen,
  };
}

function policyPlain(id: string) {
  const map: Record<string, string> = {
    cons: "Conservative means a larger share of steadier assets. The planning return used here is 3% a year. Less swing, less expected growth.",
    bal: "Balanced mixes growth assets and steadier assets. The planning return used here is 5% a year. It is the usual default, which is why so many members never choose.",
    life: "Life Path takes more growth risk while you are younger and eases down later. The planning return used here is 5.8% a year. You do not have to pick a new fund at 50.",
    grow: "Growth holds more equities. The planning return used here is 6.5% a year, with larger falls along the way.",
  };
  return map[id] ?? map.bal;
}

function Workforce({ api }: { api: Api }) {
  const wf = workforceAt(api.match);
  return (
    <>
      <Head k="12 — Workforce Retirement Intelligence" title="Is the workforce on track?" lede={`Aggregated from ${COMPANY.members.toLocaleString("en-US")} member twins. HR sees bands, not individual balances. Groups under 20 members are hidden.`} />
      <div className="stats">
        <div className="stat"><span className="muted">Members</span><b>{COMPANY.members.toLocaleString("en-US")}</b></div>
        <div className="stat"><span className="muted">Projected on track</span><b className="good">{wf.onPct.toFixed(0)}%</b></div>
        <div className="stat"><span className="muted">Potential shortfall</span><b>{(100 - wf.onPct).toFixed(0)}%</b></div>
        <div className="stat"><span className="muted">Target</span><b>60%</b><span className="muted">income replacement at 60</span></div>
      </div>
      <div className="split">
        <div>
          <h6>On track by age band</h6>
          <div className="rule">
            {wf.cohorts.map((c) => (
              <div className="cohort" key={c.band}>
                <b>{c.band}</b>
                <span className="muted">{c.n} ppl</span>
                <div className="hbar">
                  <div style={{ width: `${c.base}%`, background: "var(--color-accent)" }} />
                  <div style={{ width: `${c.lift}%`, background: "var(--color-accent-400)" }} />
                </div>
                <b style={{ textAlign: "right" }}>{c.on.toFixed(0)}% on track</b>
              </div>
            ))}
          </div>
          <p className="muted">Dark = on track today. Light = added by the simulated match.</p>
        </div>
        <div className="surface">
          <h6 style={{ margin: 0 }}>Simulate employer matching</h6>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><span>5% →</span><span className="big">{api.match}%</span></div>
          <input type="range" min={5} max={10} step={1} value={api.match} onChange={(e) => api.setMatch(Number(e.target.value))} />
          <div className="stats" style={{ borderTop: "2px solid var(--color-divider)" }}>
            <div className="stat"><span className="muted">Additional employer cost</span><b style={{ fontSize: 22 }}>{api.match === 5 ? "฿0" : baht(wf.cost) + " / yr"}</b></div>
            <div className="stat"><span className="muted">Members moved on track</span><b style={{ fontSize: 22 }} className="good">{api.match === 5 ? "0" : `+${wf.moved}`}</b></div>
          </div>
          <p style={{ margin: 0 }}>{api.match === 5 ? "Move the slider. The cost and the retirement effect update together." : "Most of the lift lands under age 40, where compounding has time. The 51+ band barely moves — a targeted catch-up or a Life Path default does more for them than a higher flat match."}</p>
        </div>
      </div>
    </>
  );
}

function Designer({ api }: { api: Api }) {
  const d = api.design;
  const avgMatch = 0.3 * d.young + 0.4 * d.mid + 0.3 * d.tenured;
  const cost = COMPANY.members * COMPANY.avgSalary * 12 * (avgMatch / 100);
  const baseCost = COMPANY.members * COMPANY.avgSalary * 12 * 0.05;
  const proposed = projectMember({ age: 34, retireAge: 60, balance: 1_280_000, salaryMonthly: 32_000, contrib: d.employee, employer: avgMatch, growth: 3, infl: 2, policy: d.policy, scenario: "base" });
  const baseline = projectMember({ age: 34, retireAge: 60, balance: 1_280_000, salaryMonthly: 32_000, contrib: 3, employer: 5, growth: 3, infl: 2, policy: "bal", scenario: "base" });
  return (
    <>
      <Head k="13 — AI EPF Designer" title="Design the fund around the workforce." lede="Contribution, tenure-based matching and an investment architecture, then a straight comparison of employer cost and projected retirement wealth." />
      <div className="split">
        <div className="stack">
          <h6 style={{ margin: 0 }}>Contribution</h6>
          <div><div style={{ display: "flex", justifyContent: "space-between" }}><span>Employee default</span><b>{d.employee}%</b></div><input type="range" min={3} max={15} value={d.employee} onChange={(e) => api.setDesign({ employee: Number(e.target.value) })} /><span className="muted">Allowed range 3–15%</span></div>
          <div><div style={{ display: "flex", justifyContent: "space-between" }}><span>Employer match · under 3 years</span><b>{d.young}%</b></div><input type="range" min={0} max={10} value={d.young} onChange={(e) => api.setDesign({ young: Number(e.target.value) })} /></div>
          <div><div style={{ display: "flex", justifyContent: "space-between" }}><span>Employer match · 3–7 years</span><b>{d.mid}%</b></div><input type="range" min={0} max={12} value={d.mid} onChange={(e) => api.setDesign({ mid: Number(e.target.value) })} /></div>
          <div><div style={{ display: "flex", justifyContent: "space-between" }}><span>Employer match · 7 years and over</span><b>{d.tenured}%</b></div><input type="range" min={0} max={15} value={d.tenured} onChange={(e) => api.setDesign({ tenured: Number(e.target.value) })} /></div>
          <div>
            <div className="muted">Investment architecture</div>
            <Seg
              options={[
                { id: "preserve", label: "Capital preservation" },
                { id: "cons", label: "Conservative" },
                { id: "bal", label: "Balanced" },
                { id: "grow", label: "Growth" },
                { id: "global", label: "Global growth" },
                { id: "life", label: "Life Path" },
              ]}
              value={d.policy}
              onChange={(v) => api.setDesign({ policy: v })}
            />
          </div>
        </div>
        <div className="stack">
          <div className="poster">
            <span className="kicker">Employer cost vs employee benefit</span>
            <span className="poster-num" style={{ fontSize: 42 }}>{baht(cost)}</span>
            <span>Illustrative annual employer match at a blended {avgMatch.toFixed(1)}%.</span>
          </div>
          <div className="stats">
            <div className="stat"><span className="muted">Versus today’s flat 5%</span><b style={{ fontSize: 22 }}>{baht(cost - baseCost)}</b></div>
            <div className="stat"><span className="muted">Sample member at 60</span><b style={{ fontSize: 22 }}>{baht(proposed.bal)}</b></div>
            <div className="stat"><span className="muted">Versus current default design</span><b style={{ fontSize: 22 }} className="good">{baht(proposed.bal - baseline.bal)}</b></div>
          </div>
          <p className="muted">Sample member: age 34, balance ฿1.28M, salary ฿32,000, retire at 60, base scenario. The architecture list is the menu employees would see. One policy is selected here only to run the cost-and-benefit case. This is a design scenario, not a forecast.</p>
        </div>
      </div>
    </>
  );
}

function Switching() {
  const tasks = [
    ["Committee approval", "Committee", "2 Sep", "Done"],
    ["Provider coordination", "Procurement", "12 Sep", "Done"],
    ["Document checklist", "Legal", "18 Sep", "Done"],
    ["Asset-transition plan", "Treasury", "25 Sep", "Done"],
    ["Data migration", "HRIS", "2 Oct", "Done"],
    ["Investment-policy mapping", "Committee", "6 Oct", "Done"],
    ["Approvals pack", "CFO", "9 Oct", "Done"],
    ["Employee communication", "HR", "12 Oct", "Next"],
    ["Completion monitoring", "EPF24", "31 Oct", "Queued"],
  ];
  return (
    <>
      <Head k="14 — Switching Engine" title="Changing provider is a managed transition." lede="Winning the comparison is not enough. EPF24 keeps the plan, the owners and the open items in one place so switching friction falls." />
      <div className="poster">
        <span className="kicker">Provider transition</span>
        <span className="poster-num" style={{ fontSize: 56 }}>78%</span>
        <div className="progress" style={{ background: "color-mix(in srgb, var(--color-on-accent) 35%, transparent)" }}><div style={{ width: "78%", background: "var(--color-on-accent)" }} /></div>
        <div>Next mission: Employee communication · Owner: HR · Deadline: 12 October</div>
      </div>
      <table className="table">
        <thead><tr><th>Workstream</th><th>Owner</th><th>Deadline</th><th>Status</th></tr></thead>
        <tbody>
          {tasks.map(([t, o, d, s]) => (
            <tr key={t}><td style={{ fontWeight: 600 }}>{t}</td><td>{o}</td><td>{d}</td><td><span className={`tag ${s === "Done" ? "tag-accent" : s === "Next" ? "tag-outline" : "tag-neutral"}`}>{s}</span></td></tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function Mission({ api }: { api: Api }) {
  const [competitive, setCompetitive] = useState(true);
  const [entry, setEntry] = useState<string | null>(null);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const visible = agiSteps(api.agi, competitive);
  const done = api.mStep >= visible.length;
  const verdict = agiVerdict(competitive);
  return (
    <>
      <Head k="15 — AGI mode" title="The intelligence and exchange layer." lede="The moat is the tape, the provider’s behavior, this employer’s twin, and what happened after the last decision. The model only orchestrates that record. It does not replace the committee." />
      <div className="filters">
        <span className="muted">AGI mode</span>
        <Seg
          options={[{ id: "single", label: "Single" }, { id: "team", label: "Team" }, { id: "swarm", label: "Swarm" }]}
          value={api.agi}
          onChange={(v) => api.setAgi(v as Api["agi"])}
        />
        <Seg
          options={[{ id: "now", label: "This employer" }, { id: "fair", label: "Already at fair price" }]}
          value={competitive ? "now" : "fair"}
          onChange={(v) => setCompetitive(v === "now")}
        />
      </div>
      <div className="stats">
        {ENGINES.map((engine) => (
          <button key={engine.id} className="stat" type="button" onClick={() => api.goto(engine.screen)} style={{ textAlign: "left", cursor: "pointer", font: "inherit", color: "inherit" }}>
            <span className="muted">{engine.name}</span>
            <b style={{ fontSize: 16 }}>{engine.q}</b>
          </button>
        ))}
      </div>
      <div className="mission-box">
        <h6 style={{ margin: 0 }}>Mission</h6>
        <p style={{ fontSize: 17, margin: 0, maxWidth: 900 }}>Is this provident fund still competitive? If the tape says yes, stop. If it says no, name the action: negotiate, market-test, redesign, or switch. A person approves before anything is sent.</p>
        <button className="btn btn-primary" onClick={api.runMission}>{api.mStep < 0 ? "Run mission →" : done ? "Mission complete — review" : "Running…"}</button>
      </div>
      {done && (
        <section className="poster">
          <div className="kicker">Autonomous CIO · {api.agi === "single" ? "Market Brain only" : api.agi === "team" ? "Four engines" : "Swarm, held for a person"}</div>
          <div className="poster-num" style={{ fontSize: 48 }}>{verdict.action}</div>
          <div>{verdict.body}</div>
          <div className="poster-grid">
            <div><b>{verdict.paying}</b><span>Paying too much?</span></div>
            <div><b>{verdict.outcomes}</b><span>Employee outcomes</span></div>
            <div><b>{verdict.alternatives}</b><span>Better alternatives</span></div>
          </div>
        </section>
      )}
      <div className="split">
        <div style={{ borderTop: "2px solid var(--color-text)" }}>
          {visible.map((step, i) => {
            const st = api.mStep < 0 ? "Planned" : i < api.mStep ? (i === visible.length - 1 && api.agi === "swarm" ? "Held" : "Done") : i === api.mStep ? "Running" : "Queued";
            return (
              <button key={step.agent} type="button" onClick={() => api.goto(step.screen)} style={{ display: "grid", gridTemplateColumns: "28px 1fr 88px", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--color-divider)", borderLeft: 0, borderRight: 0, borderTop: 0, background: "transparent", textAlign: "left", width: "100%", font: "inherit", color: "inherit", cursor: "pointer", opacity: api.mStep < 0 || i <= api.mStep ? 1 : 0.45 }}>
                <b>{i + 1}</b>
                <span><b>{step.agent}</b><span className="muted"> · {step.kind}</span><div>{step.task}</div></span>
                <b style={{ color: st === "Done" ? GOOD : st === "Running" || st === "Held" ? WARN : "var(--color-neutral-700)", fontSize: 12 }}>{st}</b>
              </button>
            );
          })}
        </div>
        <div>
          <h6>What each mode is allowed to see</h6>
          <div className="rule">
            <p><b>Single.</b> Market Brain only. One reading of the transaction tape.</p>
            <p><b>Team.</b> Market Brain, Digital Twin, Shadow Market, Outcome Engine. A conclusion, no letter.</p>
            <p><b>Swarm.</b> The four engines, an intervention search, a challenger, then Autonomous CIO. The last step stays held until a person acts.</p>
          </div>
          <p className="muted">Single does not see the employer twin. Team does not draft a negotiation. Swarm can recommend doing nothing when the price is already fair. None of them send a message to the provider.</p>
        </div>
      </div>
      <Catalog api={api} entry={entry} setEntry={setEntry} category={category} setCategory={setCategory} query={query} setQuery={setQuery} />
    </>
  );
}

function Catalog({
  api, entry, setEntry, category, setCategory, query, setQuery,
}: {
  api: Api;
  entry: string | null;
  setEntry: (id: string | null) => void;
  category: string;
  setCategory: (id: string) => void;
  query: string;
  setQuery: (q: string) => void;
}) {
  const picked = ENTRY_MISSIONS.find((item) => item.id === entry);
  const q = query.trim().toLowerCase();
  const list = CATALOG_MISSIONS.filter((mission) => {
    if (picked && !picked.ids.includes(mission.id)) return false;
    if (category !== "all" && mission.category !== category) return false;
    if (!q) return true;
    return `${mission.id} ${mission.title} ${mission.work} ${mission.categoryName}`.toLowerCase().includes(q);
  });
  const groups = CATALOG_CATEGORIES.map((group) => ({
    ...group,
    items: list.filter((mission) => mission.category === group.id),
  })).filter((group) => group.items.length > 0);
  return (
    <div className="mission-board">
      <div>
        <h6>Entry missions</h6>
        <p className="muted">Six ways in. Each card opens a set from the 120-mission catalog. Starting a mission opens the related workspace. It does not contact a provider.</p>
        <div className="mission-grid">
          {ENTRY_MISSIONS.map((item) => (
            <button key={item.id} className={entry === item.id ? "mcard on" : "mcard"} type="button" onClick={() => setEntry(entry === item.id ? null : item.id)} style={{ textAlign: "left", color: "inherit", cursor: "pointer" }}>
              <div className="mcard-id">Entry · {item.ids.length}</div>
              <div className="mcard-title">{item.title}</div>
              <p>{item.request}</p>
              <div className="mcard-foot"><span className="muted">{item.deliverable}</span></div>
            </button>
          ))}
        </div>
      </div>
      <div>
        <h6>Mission catalog <span className="muted">{list.length} / {CATALOG_MISSIONS.length}</span></h6>
        <div className="filters">
          <input className="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search mission name or category" aria-label="Search missions" />
          <div className="chips">
            <button type="button" className={category === "all" ? "chip on" : "chip"} onClick={() => setCategory("all")}>All</button>
            {CATALOG_CATEGORIES.map((group) => (
              <button key={group.id} type="button" className={category === group.id ? "chip on" : "chip"} onClick={() => setCategory(group.id)}>{group.id}</button>
            ))}
          </div>
        </div>
      </div>
      {groups.map((group) => (
        <section key={group.id} className="mission-group">
          <h6>{group.id} · {group.name} <span className="muted">{group.items.length}</span></h6>
          <div className="mission-grid">
            {group.items.map((mission) => {
              const dest = NAV.find((item) => item.id === mission.screen)?.label ?? "Open";
              return (
                <article key={mission.id} className="mcard">
                  <div className="mcard-id">{mission.id}{mission.first ? " · First release" : ""}</div>
                  <div className="mcard-title">{mission.title}</div>
                  <p>{mission.work}</p>
                  <div className="mcard-meta">
                    <span className="tag tag-outline">{mission.mode}</span>
                    <span className="tag tag-neutral">{mission.beneficiary}</span>
                  </div>
                  <div className="mcard-foot">
                    <span className="muted">{mission.measure}</span>
                    <button className="btn-start" type="button" onClick={() => api.goto(mission.screen)}>Start</button>
                  </div>
                  <span className="muted">Opens {dest}</span>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function Docs({ api }: { api: Api }) {
  return (
    <>
      <Head k="16 — Documents" title="The fund’s document record.">
        <button className="btn btn-primary" onClick={api.addDoc}>Upload document</button>
      </Head>
      <table className="table">
        <thead><tr><th>Document</th><th>Type</th><th>Source</th><th className="num">Fields extracted</th><th>Status</th><th>Added</th></tr></thead>
        <tbody>
          {api.docs.map((d) => (
            <tr key={d.n + d.d}><td style={{ fontWeight: 600 }}>{d.n}</td><td>{d.t}</td><td>{d.src}</td><td className="num">{d.f}</td><td><span className={`tag ${d.s === "Extracting" ? "tag-outline" : d.s === "Monitored" ? "tag-neutral" : "tag-accent"}`}>{d.s}</span></td><td>{d.d}</td></tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function Reports({ api }: { api: Api }) {
  const rows = [
    ["Free EPF Health Check", "Performance, risk, fee, choice, service and retirement design versus peers", "12 Sep 2026"],
    ["Value opportunity brief", `${baht(COMPANY.annualValue)} annual identified value, with fee and investment shown apart`, "—"],
    ["CFO fee business case", "Annual fee gap, 10-year member impact, reprice versus switch", "—"],
    ["Committee board pack — Q3 2026", "Summary, alerts, questions for the provider, agenda", "30 Jun 2026"],
    ["Anonymous market test", "Qualified median, best fit and cheapest, identity withheld", "—"],
    ["Tender evaluation", "Normalized proposals, weights, decision matrix, challenger notes", "—"],
    ["Workforce retirement health", "On-track rates, age bands, match scenarios", "1 Sep 2026"],
    ["Negotiation paper", "Target price, evidence, talking points, approval draft", "—"],
  ];
  return (
    <>
      <Head k="17 — Reports" title="Reports for the CFO, the board and the committee." />
      <div style={{ borderTop: "2px solid var(--color-text)" }}>
        {rows.map(([n, d, last], i) => {
          const done = api.reports.includes(i);
          return (
            <div key={n} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 140px 140px", gap: 16, alignItems: "center", padding: "14px 0", borderBottom: "1px solid var(--color-divider)" }}>
              <div><b>{n}</b><div className="muted">{d}</div></div>
              <span className="muted">{done ? "Generated just now" : last}</span>
              <button className="btn btn-secondary" onClick={() => api.genReport(i)}>{done ? "Ready" : "Generate"}</button>
            </div>
          );
        })}
      </div>
    </>
  );
}

function Settings() {
  return (
    <>
      <Head k="18 — Settings" title="Trust, methodology and the workspace." />
      <div className="split">
        <div className="stack">
          <h6 style={{ margin: 0 }}>Product</h6>
          <p>EPF24 — employee provident fund intelligence, procurement and retirement infrastructure. The commercial relationship with a provider, if any, is disclosed here and kept out of the analytical method.</p>
          <h6 style={{ margin: 0 }}>Monitoring thresholds</h6>
          {[
            ["Performance lag vs the comparable set", "Material over the monitoring window"],
            ["Fee above the qualified range", "Outside 0.19–0.22%"],
            ["Retirement on-track floor", "Below 70%"],
            ["SLA misses", "More than 1 per quarter"],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, padding: "8px 0", borderBottom: "1px solid var(--color-divider)" }}><span>{k}</span><b>{v}</b></div>
          ))}
        </div>
        <div className="stack">
          <h6 style={{ margin: 0 }}>Trust disclosures</h6>
          {[
            ["Provider-agnostic", "Benchmarks, value gap, market test and tender scores do not change because a provider pays a fee."],
            ["Disclosure", "Any marketplace or portal fee is flat, published, and structurally separate from methodology."],
            ["Sources", "Regulatory and public data, factsheets, employer uploads, tender submissions, historical offers, service performance."],
            ["Methodology", "Fee normalization and peer grouping are versioned. This prototype uses sample v1 figures."],
            ["AI versus deterministic", "Returns, fees, compounding, scenarios and scores are calculated. AI extracts, drafts and explains, and is labelled."],
            ["Audit trail", "Each comparison can show source, period, benchmark, assumptions, update time and whether a figure is calculated or interpreted."],
            ["Member privacy", "HR sees aggregates. Groups under 20 members are suppressed. A member preview is not an individual HR view."],
          ].map(([k, v]) => (
            <div key={k} style={{ padding: "8px 0", borderBottom: "1px solid var(--color-divider)" }}><b>{k}</b><div className="muted">{v}</div></div>
          ))}
        </div>
      </div>
    </>
  );
}
