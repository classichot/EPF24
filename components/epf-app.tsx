"use client";

import { useEffect, useState, type MouseEvent as ReactMouseEvent } from "react";
import { agiSteps } from "@/lib/moat";
import { AGI_SCREENS, COMPANY, DEFAULT_WEIGHTS, NAV, NAV_GROUPS, baht, type Audience, type ScreenId } from "@/lib/model";
import { WorkspaceContext } from "@/components/page-head";
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
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [sideW, setSideW] = useState(248);
  const [collapsed, setCollapsed] = useState(false);
  const [dragging, setDragging] = useState(false);
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
  const [agiOn, setAgiOn] = useState(false);
  const [audience, setAudienceState] = useState<Audience>("corporate");
  const [docs, setDocs] = useState<Doc[]>(DOCS);
  const [reports, setReports] = useState<number[]>([]);
  const [ready, setReady] = useState(false);
  const [closed, setClosed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("epf24-ui") || "null");
      if (raw?.w) setSideW(raw.w);
      if (typeof raw?.c === "boolean") setCollapsed(raw.c);
      if (raw?.skin === "console" && (raw.theme === "dark" || raw.theme === "light")) setTheme(raw.theme);
      if (typeof raw?.agi === "boolean") setAgiOn(raw.agi);
      if (raw?.audience === "advisor" || raw?.audience === "corporate") setAudienceState(raw.audience);
      if (raw?.closed && typeof raw.closed === "object") setClosed(raw.closed);
    } catch { /* ignore */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem("epf24-ui", JSON.stringify({ w: sideW, c: collapsed, theme, agi: agiOn, audience, skin: "console", closed })); } catch { /* ignore */ }
  }, [ready, sideW, collapsed, theme, agiOn, audience, closed]);

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
    if (AGI_SCREENS.has(next)) setAgiOn(true);
    setScreen(next);
    window.scrollTo(0, 0);
  }

  function toggleAgi() {
    const next = !agiOn;
    setAgiOn(next);
    if (!next && AGI_SCREENS.has(screen)) setScreen("home");
  }

  function setAudience(next: Audience) {
    setAudienceState(next);
    const allowed = NAV.some((item) => item.id === screen && !item.agi && (!item.audience || item.audience === next));
    if (!AGI_SCREENS.has(screen) && !allowed) setScreen("home");
  }

  function toggleGroup(id: string) {
    setClosed((cur) => ({ ...cur, [id]: !cur[id] }));
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
    audience,
  };

  const width = collapsed ? 64 : sideW;

  return (
    <WorkspaceContext.Provider value={{ audience, goto }}>
    <div className="frame" data-theme={theme} style={{ gridTemplateColumns: `${width}px minmax(0,1fr)`, userSelect: dragging ? "none" : "auto" }}>
      <aside className="side">
        <div className="side-brand">
          {!collapsed && (
            <div>
              <div className="brand-mark">EPF24</div>
              <div className="brand-sub">{agiOn ? "Intelligence and exchange layer" : audience === "advisor" ? "Advisor workspace" : "Employee Provident Fund Intelligence"}</div>
            </div>
          )}
          <button className="icon-btn" type="button" title={collapsed ? "Expand menu" : "Collapse menu"} onClick={() => setCollapsed((c) => !c)}>{collapsed ? "»" : "«"}</button>
        </div>
        <nav>
          {(agiOn
            ? [{ id: "agi", label: "AGI mode", items: NAV.filter((item) => item.agi) }]
            : NAV_GROUPS.map((group) => ({ id: group.id, label: group.label, items: NAV.filter((item) => item.group === group.id && !item.agi && (!item.audience || item.audience === audience)) })).filter((group) => group.items.length > 0)
          ).map((group) => {
            const shut = !collapsed && !!closed[group.id];
            return (
              <div key={group.id}>
                {!collapsed && (
                  <button className="nav-group" type="button" aria-expanded={!shut} onClick={() => toggleGroup(group.id)}>
                    <span>{group.label}</span>
                    <span>{shut ? "+" : "–"}</span>
                  </button>
                )}
                {!shut && group.items.map((item, i) => (
                  <button key={item.id} className={screen === item.id ? "nav-btn on" : "nav-btn"} title={item.label} type="button" onClick={() => goto(item.id)}>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    {!collapsed && <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>}
                  </button>
                ))}
              </div>
            );
          })}
        </nav>
        {!collapsed && (
          <div className="side-foot">
            {audience === "advisor" ? (
              <>
                <b>Advisor book</b>
                <div style={{ opacity: 0.85 }}>Open mandate · {COMPANY.name}</div>
                <div style={{ opacity: 0.85 }}>{COMPANY.members.toLocaleString("en-US")} members · {baht(COMPANY.aum)} assets</div>
              </>
            ) : (
              <>
                <b>{COMPANY.name}</b>
                <div style={{ opacity: 0.85 }}>{COMPANY.members.toLocaleString("en-US")} members · {baht(COMPANY.aum)} assets</div>
                <div style={{ opacity: 0.85 }}>Provider: {COMPANY.provider}</div>
              </>
            )}
          </div>
        )}
        <div className={dragging ? "side-handle on" : "side-handle"} title="Drag to resize · double-click to reset" onMouseDown={startDrag} onDoubleClick={() => { setSideW(248); setCollapsed(false); }} />
      </aside>
      <div className="main">
        <header className="topbar">
          <div className="top-actions">
            <div className="mode-switch" role="group" aria-label="Advisor or corporate">
              <button type="button" className={audience === "advisor" ? "on" : ""} onClick={() => setAudience("advisor")}>Advisor</button>
              <button type="button" className={audience === "corporate" ? "on" : ""} onClick={() => setAudience("corporate")}>Corporate</button>
            </div>
            <button type="button" className={agiOn ? "ios-switch on" : "ios-switch"} role="switch" aria-checked={agiOn} aria-label={agiOn ? "AGI on" : "AGI off"} title={agiOn ? "AGI on" : "AGI off"} onClick={toggleAgi}>
              <span>AGI</span>
              <span className="ios-switch-track" aria-hidden="true"><span className="ios-switch-knob" /></span>
            </button>
            <button className="theme-btn" type="button" title={theme === "dark" ? "Light mode" : "Dark mode"} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}>{theme === "dark" ? "☀" : "☾"}</button>
            <div className="who">{audience === "advisor" ? <><b>Advisor desk</b><span>Open file · {COMPANY.name}</span></> : <><b>K. Suda Wongsa</b><span>HR Director · Committee Secretary</span></>}</div>
          </div>
        </header>
        <div className="content">
          <Views s={screen} api={api} />
        </div>
      </div>
    </div>
    </WorkspaceContext.Provider>
  );
}
