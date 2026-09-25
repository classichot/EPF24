"use client";

import { useContext, useEffect, useState } from "react";
import { PageHead as Head, WorkspaceContext } from "@/components/page-head";
import { buildPlan, type EasyPlan, type EasyRole, type EasyStep } from "@/lib/easy-start";
import { NAV, baht, type ScreenId } from "@/lib/model";

const EXAMPLE = "Our fund fees seem high, and employees are unhappy with returns.";
const KEY = "epf24-easy-start";

type Saved = {
  goal: string;
  role: EasyRole;
  mode: "guide" | "agi" | null;
  checked: string[];
  started: boolean;
  limit: string;
};

function loadSaved(): Saved | null {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null") as Saved | null;
    if (!raw || typeof raw.goal !== "string") return null;
    return raw;
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

export function EasyStart() {
  const { audience, goto } = useContext(WorkspaceContext);
  const [goal, setGoal] = useState(EXAMPLE);
  const [role, setRole] = useState<EasyRole>("hr");
  const [plan, setPlan] = useState<EasyPlan | null>(null);
  const [mode, setMode] = useState<"guide" | "agi" | null>(null);
  const [checked, setChecked] = useState<string[]>([]);
  const [started, setStarted] = useState(false);
  const [limit, setLimit] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = loadSaved();
    if (saved) {
      setGoal(saved.goal);
      setRole(saved.role);
      setMode(saved.mode);
      setChecked(saved.checked);
      setStarted(saved.started);
      setLimit(saved.limit);
      if (saved.goal) setPlan(buildPlan(saved.goal, saved.role, audience === "advisor"));
    }
    setReady(true);
  }, [audience]);

  useEffect(() => {
    if (!ready) return;
    const payload: Saved = { goal, role, mode, checked, started, limit };
    try { localStorage.setItem(KEY, JSON.stringify(payload)); } catch { /* ignore */ }
  }, [ready, goal, role, mode, checked, started, limit]);

  function makePlan() {
    setPlan(buildPlan(goal, role, audience === "advisor"));
    setMode(null);
    setChecked([]);
    setStarted(false);
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
      "",
      `Employer cash: ${plan.employerCash}`,
      `Employee fees: ${plan.employeeFee}`,
      `Investment: ${plan.investment}`,
      "",
      ...plan.steps.map((step, index) => `${String(index + 1).padStart(2, "0")} ${step.id} ${step.title}\n${step.output}\n${evidenceLabel(step)}`),
      "",
      "Missing",
      ...plan.missing,
      "",
      plan.approval,
    ];
    const file = new Blob([lines.join("\n")], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = "EPF24-easy-start.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  const roles: { id: EasyRole; label: string }[] = [
    { id: "hr", label: "HR" },
    { id: "committee", label: "Committee" },
    { id: "member", label: "Member" },
  ];

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
            <div className="stat"><span className="muted">Employer cash</span><b style={{ fontSize: 16 }}>{plan.employerCash}</b></div>
            <div className="stat"><span className="muted">Employee fee savings</span><b style={{ fontSize: 16 }}>{plan.employeeFee}</b></div>
            <div className="stat"><span className="muted">Investment scenario</span><b style={{ fontSize: 16 }}>{plan.investment}</b></div>
          </div>
          <h6>Missing facts · the plan still stands</h6>
          <ul className="guide-note" style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6 }}>
            {plan.missing.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <div className="actions">
            <button type="button" className={mode === "guide" ? "btn btn-primary" : "btn btn-secondary"} onClick={() => setMode("guide")}>Guide me</button>
            <button type="button" className={mode === "agi" ? "btn btn-primary" : "btn btn-secondary"} onClick={() => setMode("agi")}>Run with AGI</button>
            <button type="button" className="btn btn-secondary" onClick={download}>Download</button>
          </div>
          {mode === "guide" && (
            <>
              <h6>Guide me <span className="muted">{checked.length} of {plan.steps.length}</span></h6>
              <div className="guide-steps">
                {plan.steps.map((step, index) => (
                  <div key={step.id} className="guide-step" style={{ cursor: "default" }}>
                    <button type="button" className="guide-box" aria-label={`Mark ${step.id}`} onClick={() => setChecked((rows) => rows.includes(step.id) ? rows.filter((id) => id !== step.id) : [...rows, step.id])}>{checked.includes(step.id) ? "✓" : ""}</button>
                    <span className="guide-step-no">{String(index + 1).padStart(2, "0")}</span>
                    <span>
                      <b>{step.id} · {step.title}</b>
                      <p>{step.why}</p>
                      <p>Output: {step.output} · {step.effort} · {evidenceLabel(step)} · Menu: {menuLabel(step.screen)}</p>
                      <button type="button" className="btn btn-secondary" style={{ marginTop: 8 }} onClick={() => goto(step.screen)}>Open {menuLabel(step.screen)}</button>
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
          {mode === "agi" && (
            <>
              <h6>AGI plan preview</h6>
              <div className="surface" style={{ display: "grid", gap: 10 }}>
                <div><b>Goal and scope.</b> {plan.goal} {plan.scope}</div>
                <div><b>Mission sequence.</b> {plan.steps.map((step) => step.id).join(" → ")}. Each id is from the first-release catalog.</div>
                <div><b>Execution.</b> {plan.agents} agents. This build does not meter a model, so spend stays at {baht(0)} until a gateway is connected. {limit ? `Your limit is saved at ${limit}.` : "Set a limit before autopilot if you want one on the record."}</div>
                <label className="muted">Spending limit, baht
                  <input className="search" style={{ display: "block", marginTop: 6 }} value={limit} onChange={(event) => setLimit(event.target.value)} placeholder="Optional limit" />
                </label>
                <div><b>May read.</b> {plan.read}</div>
                <div><b>May draft.</b> {plan.draft}</div>
                <div><b>Needs a person.</b> {plan.approval}</div>
                <div><b>Finished when.</b> {plan.doneWhen}</div>
                {!started && <button type="button" className="btn btn-primary" onClick={() => setStarted(true)}>Start autopilot</button>}
              </div>
              {started && (
                <>
                  <h6>Mission timeline</h6>
                  <table className="table">
                    <thead><tr><th>Mission</th><th>State</th><th>Evidence</th></tr></thead>
                    <tbody>
                      {plan.steps.map((step) => {
                        const state = step.approval ? "Waiting for approval" : step.evidence === "insufficient" ? "Stopped · insufficient evidence" : "Analysis drafted";
                        return (
                          <tr key={step.id}>
                            <td style={{ fontWeight: 600 }}>{step.id} · {step.title}</td>
                            <td>{state}</td>
                            <td className="muted">{evidenceLabel(step)}. {step.approval ? "Not sent." : step.output}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <p className="muted">Autopilot stopped where a letter, a bid, or a verified saving would begin. You can leave and return. The plan is still the one Guide me uses.</p>
                </>
              )}
            </>
          )}
          <p className="muted">SEC papers from 2026 on clearer member information are consultation proposals, not rules this screen executes. Easy Start does not give personalized advice and does not move assets.</p>
        </>
      )}
    </>
  );
}
