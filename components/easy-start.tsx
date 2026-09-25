"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { PageHead as Head, WorkspaceContext } from "@/components/page-head";
import { buildPlan, stamp, stepGate, type EasyPlan, type EasyRole, type EasyStep } from "@/lib/easy-start";
import { NAV, baht, type ScreenId } from "@/lib/model";

const EXAMPLE = "Our fund fees seem high, and employees are unhappy with returns.";
const KEY = "epf24-easy-start";

type LogLine = { t: string; text: string };

type Saved = {
  goal: string;
  role: EasyRole;
  mode: "guide" | "agi" | null;
  checked: string[];
  started: boolean;
  limit: string;
  cursor: number;
  paused: boolean;
  held: string[];
  log: LogLine[];
};

function loadSaved(): Saved | null {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null") as Partial<Saved> | null;
    if (!raw || typeof raw.goal !== "string") return null;
    return {
      goal: raw.goal,
      role: raw.role === "committee" || raw.role === "member" ? raw.role : "hr",
      mode: raw.mode === "guide" || raw.mode === "agi" ? raw.mode : null,
      checked: Array.isArray(raw.checked) ? raw.checked.filter((id) => typeof id === "string") : [],
      started: !!raw.started,
      limit: typeof raw.limit === "string" ? raw.limit : "",
      cursor: typeof raw.cursor === "number" ? raw.cursor : raw.started ? Number.MAX_SAFE_INTEGER : -1,
      paused: !!raw.paused,
      held: Array.isArray(raw.held) ? raw.held.filter((id) => typeof id === "string") : [],
      log: Array.isArray(raw.log) ? raw.log.filter((row) => row && typeof row.text === "string" && typeof row.t === "string") : [],
    };
  } catch {
    return null;
  }
}

function menuLabel(id: ScreenId) {
  return NAV.find((item) => item.id === id)?.label ?? id;
}

function evidenceLabel(step: EasyStep) {
  if (step.evidence === "ready") return "Ready on the open file";
  if (step.evidence === "insufficient") return "Insufficient evidence · valid to stop";
  return "Provisional";
}

function kindLabel(kind: EasyPlan["opportunities"][number]["kind"]) {
  if (kind === "estimated") return "Estimated opportunity";
  if (kind === "scenario") return "Uncertain scenario";
  if (kind === "hidden") return "Hidden for this role";
  if (kind === "unseparated") return "Not counted twice";
  return "Not calculated";
}

export function EasyStart() {
  const { audience, goto, caseFile, setBrief } = useContext(WorkspaceContext);
  const [goal, setGoal] = useState(EXAMPLE);
  const [role, setRole] = useState<EasyRole>("hr");
  const [plan, setPlan] = useState<EasyPlan | null>(null);
  const [mode, setMode] = useState<"guide" | "agi" | null>(null);
  const [checked, setChecked] = useState<string[]>([]);
  const [started, setStarted] = useState(false);
  const [limit, setLimit] = useState("");
  const [cursor, setCursor] = useState(-1);
  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState<string[]>([]);
  const [log, setLog] = useState<LogLine[]>([]);
  const [ready, setReady] = useState(false);
  const goalRef = useRef(goal);
  const roleRef = useRef(role);
  const booted = useRef(false);
  goalRef.current = goal;
  roleRef.current = role;

  function pushLog(text: string) {
    setLog((rows) => {
      const line = { t: stamp(), text };
      return [...rows, line].slice(-40);
    });
  }

  useEffect(() => {
    if (!booted.current) {
      booted.current = true;
      const saved = loadSaved();
      if (saved) {
        setGoal(saved.goal);
        setRole(saved.role);
        setMode(saved.mode);
        setChecked(saved.checked);
        setStarted(saved.started);
        setLimit(saved.limit);
        setPaused(saved.paused);
        setHeld(saved.held);
        setLog(saved.log);
        const next = buildPlan(saved.goal, saved.role, audience === "advisor", caseFile);
        setPlan(next);
        setCursor(saved.cursor >= next.steps.length && saved.cursor !== -1 ? next.steps.length : saved.cursor);
      }
      setReady(true);
      return;
    }
    setPlan((current) => (current ? buildPlan(goalRef.current, roleRef.current, audience === "advisor", caseFile) : current));
  }, [audience, caseFile]);

  useEffect(() => {
    if (!ready) return;
    const payload: Saved = { goal, role, mode, checked, started, limit, cursor, paused, held, log };
    try { localStorage.setItem(KEY, JSON.stringify(payload)); } catch { /* ignore */ }
  }, [ready, goal, role, mode, checked, started, limit, cursor, paused, held, log]);

  useEffect(() => {
    if (mode !== "agi" || !started || paused || !plan) return;
    if (cursor < 0 || cursor >= plan.steps.length) return;
    const step = plan.steps[cursor];
    const gate = stepGate(step);
    const timer = window.setTimeout(() => {
      if (gate === "draft") {
        pushLog(`${step.id} drafted. ${step.output}`);
        setCursor((current) => current + 1);
        return;
      }
      setPaused(true);
      pushLog(gate === "approval"
        ? `${step.id} is waiting for ${plan.owner}. No invitation or transfer was sent.`
        : `${step.id} stopped. ${step.documents}`);
    }, 700);
    return () => window.clearTimeout(timer);
  }, [mode, started, paused, cursor, plan]);

  useEffect(() => {
    if (!started || !plan || cursor < plan.steps.length) return;
    setLog((rows) => {
      if (rows.some((row) => row.text.startsWith("Autopilot finished"))) return rows;
      return [...rows, { t: stamp(), text: "Autopilot finished. Held steps were not sent. Insufficient evidence was not turned into a verified saving." }].slice(-40);
    });
  }, [started, cursor, plan]);

  function makePlan() {
    const next = buildPlan(goal, role, audience === "advisor", caseFile);
    setPlan(next);
    setMode(null);
    setChecked([]);
    setStarted(false);
    setCursor(-1);
    setPaused(false);
    setHeld([]);
    pushLog("Plan built from the first-release catalog. Guide me and Run with AGI use this same plan.");
  }

  function chooseMode(next: "guide" | "agi") {
    setMode(next);
    pushLog(next === "guide" ? "Switched to Guide me. The mission list did not restart." : "Switched to Run with AGI. The checklist did not restart.");
  }

  function openStep(step: EasyStep) {
    if (!plan) return;
    goto(step.screen);
    setBrief({
      mission: `${step.id} · ${step.title}`,
      company: plan.company,
      provider: plan.provider,
      period: plan.period,
      question: plan.goal,
    });
    pushLog(`Opened ${step.id} on ${menuLabel(step.screen)} with the company, provider, period and question filled in.`);
  }

  function startRun() {
    if (!plan || plan.steps.length === 0) return;
    setStarted(true);
    setPaused(false);
    if (cursor < 0) setCursor(0);
    pushLog(`Autopilot started. Estimated spend ${baht(0)}. ${limit ? `Limit on the record: ${limit}.` : "No spending limit was set."}`);
  }

  function resume() {
    if (!plan || cursor < 0 || cursor >= plan.steps.length) return;
    const step = plan.steps[cursor];
    pushLog(step.approval
      ? `${step.id} held for ${plan.owner}. Nothing was invited, negotiated, or transferred.`
      : `${step.id} left as insufficient evidence. No fund was ranked from the missing series.`);
    setHeld((rows) => (rows.includes(step.id) ? rows : [...rows, step.id]));
    setPaused(false);
    setCursor((current) => current + 1);
  }

  function download() {
    if (!plan) return;
    const lines = [
      "EPF24 Easy Start",
      plan.goal,
      plan.scope,
      plan.period,
      "",
      plan.result,
      plan.nextDecision,
      "",
      "Opportunities",
      ...plan.opportunities.map((item) => `${item.name}: ${kindLabel(item.kind)}. ${item.text}`),
      "Contracted reduction: none on this file.",
      "Verified saving: none. Proof missions stay insufficient until invoices exist.",
      "",
      ...plan.steps.map((step, index) => `${String(index + 1).padStart(2, "0")} ${step.phase} · ${step.id} ${step.title}\nDepends on ${step.dependsOn}\n${step.output}\n${evidenceLabel(step)}`),
      "",
      "Missing",
      ...plan.missing,
      "",
      plan.approval,
      "",
      "Audit",
      ...log.map((row) => `${row.t} ${row.text}`),
    ];
    const file = new Blob([lines.join("\n")], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = "EPF24-easy-start.txt";
    link.click();
    URL.revokeObjectURL(link.href);
    pushLog("Results downloaded.");
  }

  const roles: { id: EasyRole; label: string }[] = [
    { id: "hr", label: "HR" },
    { id: "committee", label: "Committee" },
    { id: "member", label: "Member" },
  ];
  const current = plan && cursor >= 0 && cursor < plan.steps.length ? plan.steps[cursor] : null;
  const finished = !!plan && started && cursor >= plan.steps.length;

  function rowState(step: EasyStep, index: number) {
    if (!started || cursor < 0) return "Not started";
    if (index < cursor) {
      if (held.includes(step.id) && step.approval) return "Held for approval · not sent";
      if (held.includes(step.id)) return "Stopped · insufficient evidence";
      return "Analysis drafted";
    }
    if (index === cursor && !finished) {
      if (!paused) return "Working";
      return step.approval ? "Needs a decision" : "Needs a document";
    }
    return "Not started";
  }

  return (
    <>
      <Head
        k="Easy Start"
        title="What would you like to improve about your provident fund?"
        lede="Describe the goal in ordinary language. EPF24 writes one plan. You can walk the menus yourself, or run the same plan as AGI missions. Calculations stay in the engines. The writing only chooses the missions and explains the evidence."
      />
      <div className="surface" style={{ display: "grid", gap: 12 }}>
        <textarea className="search" style={{ minWidth: 0, width: "100%", minHeight: 88 }} value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="What would you like to improve about your provident fund?" />
        <div className="actions">
          <button type="button" className="btn btn-ghost" onClick={() => setGoal(EXAMPLE)}>Use the example</button>
          <div className="seg" role="group" aria-label="Who is asking">
            {roles.map((item) => (
              <button key={item.id} type="button" className={role === item.id ? "on" : ""} onClick={() => setRole(item.id)}>{item.label}</button>
            ))}
          </div>
          <button type="button" className="btn btn-primary" onClick={makePlan}>Build the plan</button>
        </div>
      </div>
      {plan && (
        <>
          <div className="ink">
            <span className="eyebrow">Plan · same engine for both modes</span>
            <span>{plan.result}</span>
          </div>
          <div className="stats">
            <div className="stat"><span className="muted">Scope</span><b style={{ fontSize: 16 }}>{plan.scope}</b><span className="muted">{plan.period}</span></div>
            {plan.opportunities.map((item) => (
              <div className="stat" key={item.name}><span className="muted">{item.name} · {kindLabel(item.kind)}</span><b style={{ fontSize: 16 }}>{item.text}</b></div>
            ))}
          </div>
          <p className="muted">Contracted reduction: none on this file. Verified saving: none. Better past returns are not future gains.</p>
          <h6>Missing facts · the plan still stands</h6>
          <ul className="guide-note" style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6 }}>
            {plan.missing.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <div className="actions">
            <button type="button" className={mode === "guide" ? "btn btn-primary" : "btn btn-secondary"} onClick={() => chooseMode("guide")}>Guide me</button>
            <button type="button" className={mode === "agi" ? "btn btn-primary" : "btn btn-secondary"} onClick={() => chooseMode("agi")}>Run with AGI</button>
            <button type="button" className="btn btn-secondary" onClick={download}>Download</button>
          </div>
          {mode === "guide" && (
            <>
              <h6>Guide me <span className="muted">{checked.length} of {plan.steps.length} completed</span></h6>
              <div className="guide-steps">
                {plan.steps.map((step, index) => (
                  <div key={step.id} className="guide-step" style={{ cursor: "default" }}>
                    <button type="button" className="guide-box" aria-label={`Mark ${step.id}`} onClick={() => setChecked((rows) => rows.includes(step.id) ? rows.filter((id) => id !== step.id) : [...rows, step.id])}>{checked.includes(step.id) ? "✓" : ""}</button>
                    <span className="guide-step-no">{String(index + 1).padStart(2, "0")}</span>
                    <span>
                      <span className="muted">{step.phase} · {checked.includes(step.id) ? "Completed" : "Remaining"}</span>
                      <b>{step.id} · {step.title}</b>
                      <p>{step.why}</p>
                      <p>Output: {step.output}</p>
                      <p>Documents: {step.documents} · Effort: {step.effort} · {evidenceLabel(step)} · After {step.dependsOn}</p>
                      {step.note && <p>{step.note}</p>}
                      <button type="button" className="btn btn-secondary" style={{ marginTop: 8 }} onClick={() => openStep(step)}>Open {menuLabel(step.screen)}</button>
                    </span>
                  </div>
                ))}
              </div>
              <div className="surface">
                <b>Result from the steps you completed.</b>
                {checked.length === 0 ? <p>No step is marked complete yet. The remaining steps are still on the same plan.</p> : (
                  <ul className="guide-note" style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                    {plan.steps.filter((step) => checked.includes(step.id)).map((step) => <li key={step.id}>{step.id}: {step.output}</li>)}
                  </ul>
                )}
                <p className="muted">{plan.steps.length - checked.length} remaining. {plan.nextDecision}</p>
              </div>
            </>
          )}
          {mode === "agi" && (
            <>
              <h6>AGI plan preview</h6>
              <div className="surface" style={{ display: "grid", gap: 10 }}>
                <div><b>Goal and scope.</b> {plan.goal} {plan.scope} Period: {plan.period}</div>
                <div>
                  <b>Mission sequence.</b>
                  <ol className="guide-note" style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                    {plan.steps.map((step) => (
                      <li key={step.id}><b>{step.id}</b> · {step.phase}. {step.why} Produces: {step.output} Depends on {step.dependsOn}. {step.note}</li>
                    ))}
                  </ol>
                </div>
                <div><b>Potential value.</b> {plan.opportunities.map((item) => `${item.name}: ${item.text}`).join(" ")} Contracted reduction: none. Verified saving: none.</div>
                <div><b>Execution setup.</b> {plan.agents} Estimated AI spend {plan.spend} {limit ? `Your limit is saved at ${limit}.` : "Set a limit if you want one on the record."}</div>
                <label className="muted">Spending limit, baht
                  <input className="search" style={{ display: "block", marginTop: 6 }} value={limit} onChange={(event) => setLimit(event.target.value)} placeholder="Optional limit" />
                </label>
                <div><b>Authority.</b> May read: {plan.read} May draft: {plan.draft} Needs {plan.owner}: {plan.approval}</div>
                <div><b>Completion criteria.</b> {plan.doneWhen}</div>
                {!started && <button type="button" className="btn btn-primary" onClick={startRun}>Start autopilot</button>}
                {started && paused && <button type="button" className="btn btn-primary" onClick={resume}>Resume from this step</button>}
              </div>
              {started && current && paused && (
                <div className="case-banner">
                  <b>{current.id} · {current.approval ? "Decision required" : "Document missing"}</b>
                  <p>{current.approval ? `${plan.owner} has to approve this before anything is sent. Autopilot is waiting on this step.` : current.documents}</p>
                  <p className="muted">Insufficient evidence is a valid result. Resume keeps the same plan and does not invent the missing fact.</p>
                </div>
              )}
              {started && (
                <>
                  <h6>Mission timeline <span className="muted">AI spend {baht(0)}</span></h6>
                  <table className="table">
                    <thead><tr><th>Mission</th><th>State</th><th>Evidence</th><th className="num">Spend</th></tr></thead>
                    <tbody>
                      {plan.steps.map((step, index) => (
                        <tr key={step.id}>
                          <td style={{ fontWeight: 600 }}>{step.id} · {step.title}<div className="muted">{step.phase}</div></td>
                          <td>{rowState(step, index)}</td>
                          <td className="muted">{evidenceLabel(step)}. {step.documents}</td>
                          <td className="num">{baht(0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
              {finished && (
                <div className="surface">
                  <b>{plan.result}</b>
                  <ul className="guide-note" style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                    {plan.opportunities.map((item) => <li key={item.name}>{item.name}: {kindLabel(item.kind)}. {item.text}</li>)}
                    <li>Contracted reduction: none on this file.</li>
                    <li>Verified saving: none. L02 and L03 stay insufficient until a real change is invoiced.</li>
                  </ul>
                  <p>{plan.nextDecision}</p>
                </div>
              )}
            </>
          )}
          {log.length > 0 && (
            <>
              <h6>Audit trail</h6>
              <ul className="guide-note" style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 4 }}>
                {log.map((row, index) => <li key={`${row.t}-${index}`}><span className="muted">{row.t}</span> {row.text}</li>)}
              </ul>
            </>
          )}
          <p className="muted">SEC papers from 2026 on clearer member information are consultation proposals, not rules this screen executes. Easy Start does not give personalized advice and does not move assets.</p>
        </>
      )}
    </>
  );
}
