"use client";

import { useEffect, useState, type FormEvent, type MouseEvent as ReactMouseEvent } from "react";
import { agiSteps, type AgiMode } from "@/lib/moat";
import { COMPANY, DEFAULT_WEIGHTS, NAV, answerFor, baht, type ScreenId } from "@/lib/model";
import { Views, type Api, type Design, type Doc, type Emp } from "@/components/views";

const DOCS: Doc[] = [
  { n: "EPF Management Agreement 2022.pdf", t: "Contract", src: "Siam Harbor AM", f: "128", s: "Reviewed", d: "14 Aug 2026" },
  { n: "Fee Schedule 2026.xlsx", t: "Fee schedule", src: "HR upload", f: "44", s: "Reviewed", d: "14 Aug 2026" },
  { n: "Balanced Fund Factsheet Jun-26.pdf", t: "Factsheet", src: "ThaiPVD", f: "36", s: "Reviewed", d: "2 Jul 2026" },
  { n: "Q2 Investment Report.pdf", t: "Provider report", src: "Siam Harbor AM", f: "92", s: "Reviewed", d: "28 Jul 2026" },
  { n: "Committee Minutes Q2.docx", t: "Minutes", src: "Committee AI", f: "18", s: "Approved", d: "15 Jul 2026" },
  { n: "Investment Policy Statement v3.pdf", t: "Policy", src: "Committee", f: "27", s: "Reviewed", d: "10 Mar 2026" },
  { n: "SEC Consultation Jul-26.pdf", t: "Regulation", src: "SEC", f: "12", s: "Monitored", d: "22 Jul 2026" },
];

export function EpfApp() {
  const [screen, setScreen] = useState<ScreenId>("home");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [sideW, setSideW] = useState(248);
  const [collapsed, setCollapsed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [q, setQ] = useState("");
  const [ai, setAi] = useState<ReturnType<typeof answerFor> & { q: string } | null>(null);
  const [search, setSearch] = useState("");
  const [ptype, setPtype] = useState("All");
  const [sel, setSel] = useState(["cp", "la", "kf"]);
  const [bench, setBench] = useState(0);
  const [benchStep, setBenchStep] = useState(0);
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [tstep, setTstep] = useState(0);
  const [acked, setAcked] = useState<number[]>([]);
  const [ctab, setCtab] = useState("before");
  const [emp, setEmpState] = useState<Emp>({ retAge: 60, contrib: 3, policy: "bal", scen: "base", growth: 3, infl: 2 });
  const [copilot, setCopilot] = useState("");
  const [match, setMatch] = useState(5);
  const [aum, setAum] = useState(COMPANY.aum);
  const [life, setLife] = useState(true);
  const [esg, setEsg] = useState(true);
  const [digital, setDigital] = useState(true);
  const [tested, setTested] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showNeg, setShowNeg] = useState(false);
  const [design, setDesignState] = useState<Design>({ young: 3, mid: 5, tenured: 7, employee: 5, policy: "life" });
  const [mStep, setMStep] = useState(-1);
  const [agi, setAgi] = useState<Api["agi"]>("team");
  const [docs, setDocs] = useState<Doc[]>(DOCS);
  const [reports, setReports] = useState<number[]>([]);

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("epf24-ui") || "null");
      if (raw?.w) setSideW(raw.w);
      if (typeof raw?.c === "boolean") setCollapsed(raw.c);
      if (raw?.theme === "dark" || raw?.theme === "light") setTheme(raw.theme);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem("epf24-ui", JSON.stringify({ w: sideW, c: collapsed, theme })); } catch { /* ignore */ }
  }, [sideW, collapsed, theme]);

  useEffect(() => {
    if (bench !== 1) return;
    const id = setInterval(() => {
      setBenchStep((step) => {
        if (step >= 4) {
          setBench(2);
          return step;
        }
        return step + 1;
      });
    }, 650);
    return () => clearInterval(id);
  }, [bench]);

  const missionLen = agiSteps(agi, true).length;
  useEffect(() => {
    if (mStep < 0 || mStep >= missionLen) return;
    const id = setInterval(() => setMStep((s) => s + 1), 700);
    return () => clearInterval(id);
  }, [mStep, missionLen]);

  function goto(next: ScreenId) {
    setScreen(next);
    window.scrollTo(0, 0);
  }

  function startDrag(e: ReactMouseEvent) {
    e.preventDefault();
    const x0 = e.clientX;
    const w0 = collapsed ? 64 : sideW;
    setDragging(true);
    const move = (ev: globalThis.MouseEvent) => {
      const w = w0 + ev.clientX - x0;
      if (w < 120) setCollapsed(true);
      else {
        setCollapsed(false);
        setSideW(Math.min(420, Math.max(180, w)));
      }
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  }

  function ask(e: FormEvent) {
    e.preventDefault();
    const text = q.trim() || "How much value are we losing by staying with our current provident fund?";
    setAi({ q: text, ...answerFor(text) });
  }

  const api: Api = {
    goto,
    search, setSearch, ptype, setPtype, sel,
    toggleProv: (id) => setSel((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      if (cur.length >= 3) return [...cur.slice(1), id];
      return [...cur, id];
    }),
    bench, benchStep,
    runBench: () => { setBenchStep(0); setBench(1); },
    resetBench: () => { setBench(0); setBenchStep(0); },
    weights,
    setWeight: (id, v) => setWeights((w) => ({ ...w, [id]: v })),
    tstep, setTstep,
    acked,
    ack: (i) => setAcked((a) => (a.includes(i) ? a : [...a, i])),
    ctab, setCtab,
    emp,
    setEmp: (p) => setEmpState((s) => ({ ...s, ...p })),
    copilot, setCopilot,
    match, setMatch,
    aum, setAum, life, setLife, esg, setEsg, digital, setDigital,
    tested, setTested, testing,
    runTest: () => {
      setTesting(true);
      setTested(false);
      window.setTimeout(() => { setTesting(false); setTested(true); }, 900);
    },
    showNeg, setShowNeg,
    design,
    setDesign: (p) => setDesignState((s) => ({ ...s, ...p })),
    mStep,
    runMission: () => setMStep(0),
    agi, setAgi: (v) => { setAgi(v); setMStep(-1); },
    docs,
    addDoc: () => {
      const n = `Q3 Investment Report ${docs.length}.pdf`;
      setDocs((d) => [{ n, t: "Provider report", src: "HR upload", f: "…", s: "Extracting", d: "23 Sep 2026" }, ...d]);
      window.setTimeout(() => {
        setDocs((d) => d.map((row) => (row.n === n ? { ...row, f: "88", s: "Reviewed" } : row)));
      }, 1400);
    },
    reports,
    genReport: (i) => setReports((r) => (r.includes(i) ? r : [...r, i])),
  };

  const width = collapsed ? 64 : sideW;

  return (
    <div className="frame" data-theme={theme} style={{ gridTemplateColumns: `${width}px minmax(0,1fr)`, userSelect: dragging ? "none" : "auto" }}>
      <aside className="side">
        <div className="side-brand">
          {!collapsed && (
            <div>
              <div className="brand-mark">EPF24</div>
              <div className="brand-sub">Intelligence and exchange layer</div>
            </div>
          )}
          <button className="icon-btn" type="button" title={collapsed ? "Expand menu" : "Collapse menu"} onClick={() => setCollapsed((c) => !c)}>{collapsed ? "»" : "«"}</button>
        </div>
        <nav>
          {NAV.map((item, i) => {
            const showGroup = !collapsed && (i === 0 || NAV[i - 1].group !== item.group);
            return (
              <div key={item.id}>
                {showGroup && <div className="nav-group">{item.group}</div>}
                <button className={screen === item.id ? "nav-btn on" : "nav-btn"} title={item.label} type="button" onClick={() => goto(item.id)}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {!collapsed && <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>}
                </button>
              </div>
            );
          })}
        </nav>
        {!collapsed && (
          <div className="side-foot">
            <b>{COMPANY.name}</b>
            <div style={{ opacity: 0.85 }}>{COMPANY.members.toLocaleString("en-US")} members · {baht(COMPANY.aum)} assets</div>
            <div style={{ opacity: 0.85 }}>Provider: {COMPANY.provider}</div>
          </div>
        )}
        <div className={dragging ? "side-handle on" : "side-handle"} title="Drag to resize · double-click to reset" onMouseDown={startDrag} onDoubleClick={() => { setSideW(248); setCollapsed(false); }} />
      </aside>
      <div className="main">
        <header className="topbar">
          <form className="ask" onSubmit={ask}>
            <span className="ask-badge">AI</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask EPF24 anything about your provident fund…" />
            <button className="btn btn-primary" type="submit">Ask →</button>
          </form>
          <div className="agi-switch" title="AGI mode">
            {(["single", "team", "swarm"] as AgiMode[]).map((mode) => (
              <button key={mode} type="button" className={agi === mode ? "on" : ""} onClick={() => { setAgi(mode); setMStep(-1); }}>{mode === "single" ? "Single" : mode === "team" ? "Team" : "Swarm"}</button>
            ))}
          </div>
          <button className="btn btn-secondary" type="button" onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}>{theme === "dark" ? "☀ Light mode" : "☾ Dark mode"}</button>
          <div className="who"><b>K. Suda Wongsa</b><span>HR Director · Committee Secretary</span></div>
        </header>
        {ai && (
          <div className="ai-panel">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
              <div className="ai-kicker">EPF24 AI · {ai.agent}</div>
              <button className="btn btn-ghost" type="button" onClick={() => setAi(null)}>Close ×</button>
            </div>
            <div className="ai-q">“{ai.q}”</div>
            <div className="ai-a">{ai.a}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <button className="btn btn-secondary" type="button" onClick={() => { goto(ai.screen); if (ai.screen === "market" && /negot/i.test(ai.q + ai.cta)) setShowNeg(true); }}>{ai.cta} →</button>
              <span className="ai-note">Figures from deterministic engines · narrative by AI · decision support, not a recommendation</span>
            </div>
          </div>
        )}
        <div className="content">
          <Views s={screen} api={api} />
        </div>
      </div>
    </div>
  );
}
