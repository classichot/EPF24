"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { pageGuide, type Guide } from "@/lib/page-explain";
import { statusLabel, type AdvisorCase } from "@/lib/cases";
import type { OpenBrief } from "@/lib/easy-start";
import type { Audience, ScreenId } from "@/lib/model";

export const WorkspaceContext = createContext<{
  audience: Audience;
  goto: (id: ScreenId) => void;
  caseFile: AdvisorCase | null;
  brief: OpenBrief | null;
  setBrief: (brief: OpenBrief | null) => void;
  returnToStart: () => void;
}>({
  audience: "corporate",
  goto: () => {},
  caseFile: null,
  brief: null,
  setBrief: () => {},
  returnToStart: () => {},
});

function useChecks(code: string, count: number) {
  const key = `epf24-playbook-${code}`;
  const [checked, setChecked] = useState<boolean[]>(() => Array(count).fill(false));
  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(key) || "[]");
      if (Array.isArray(raw)) setChecked(Array.from({ length: count }, (_, i) => !!raw[i]));
    } catch { /* ignore */ }
  }, [key, count]);
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(checked)); } catch { /* ignore */ }
  }, [key, checked]);
  return {
    checked,
    toggle: (index: number) => setChecked((rows) => rows.map((on, i) => (i === index ? !on : on))),
    reset: () => setChecked(Array(count).fill(false)),
  };
}

function downloadPlaybook(guide: Guide) {
  const lines = [
    `Playbook · ${guide.code} ${guide.name}`,
    "",
    guide.summary,
    "",
    "Before you start",
    guide.before,
    "",
    ...guide.steps.map((step, index) => `${String(index + 1).padStart(2, "0")} ${step.title}\n${step.body}`),
    "",
    "Expected outcome",
    guide.outcome,
    "",
    "Checking a step is a personal note and does not perform the action.",
  ];
  const file = new Blob([lines.join("\n")], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(file);
  link.download = `EPF24-playbook-${guide.code}.txt`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function GuideDialog({ guide, view, onView, onClose }: { guide: Guide; view: "explain" | "playbook"; onView: (view: "explain" | "playbook") => void; onClose: () => void }) {
  const { audience, goto, caseFile } = useContext(WorkspaceContext);
  const checks = useChecks(guide.code, guide.steps.length);
  const done = checks.checked.filter(Boolean).length;
  const mode = audience === "advisor"
    ? `Advisor mode · ${caseFile ? `${caseFile.employer} · ${statusLabel(caseFile.status)}` : "no open case"}`
    : "Corporate mode · this employer’s provident-fund workspace";
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <>
      <div className="explain-backdrop" onClick={onClose} />
      <div className="guide-pop" role="dialog" aria-modal="true" aria-label={view === "explain" ? "Explain this page" : "Playbook"}>
        <div className="guide-top">
          <div className="guide-title-row">
            <h2>{view === "explain" ? "Explain this page" : "Playbook"} · {guide.code} {guide.name}</h2>
            <button type="button" className="guide-x" onClick={onClose} aria-label="Close">×</button>
          </div>
          <p className="guide-mode">{mode}</p>
        </div>
        <p className="guide-kicker">{view === "explain" ? "Page explainer" : "Working playbook"} / {guide.code}</p>
        <p className="guide-summary">{guide.summary}</p>
        <hr className="guide-rule" />
        {view === "explain" ? (
          <>
            <section>
              <h3>When to use this page</h3>
              <p>{guide.when}</p>
            </section>
            <section>
              <h3>What you need</h3>
              <p>{guide.need}</p>
            </section>
            <section>
              <h3>What you should leave with</h3>
              <p>{guide.leave}</p>
            </section>
            <h3>Feature menu</h3>
            <div className="guide-features">
              {guide.features.map((feature, index) => (
                <article key={feature.title} className="guide-card">
                  <span>{guide.code}.{String(index + 1).padStart(2, "0")}</span>
                  <b>{feature.title}</b>
                  <p>{feature.body}</p>
                </article>
              ))}
            </div>
            <button type="button" className="guide-open" onClick={() => onView("playbook")}>Open this page’s playbook →</button>
          </>
        ) : (
          <>
            <section>
              <h3>Before you start</h3>
              <p>{guide.before}</p>
            </section>
            <div className="guide-progress">
              <span>{done} of {guide.steps.length} steps checked</span>
              <div><i style={{ width: `${guide.steps.length ? (done / guide.steps.length) * 100 : 0}%` }} /></div>
            </div>
            <div className="guide-steps">
              {guide.steps.map((step, index) => (
                <button key={step.title} type="button" className={checks.checked[index] ? "guide-step on" : "guide-step"} onClick={() => checks.toggle(index)}>
                  <span className="guide-box" aria-hidden="true">{checks.checked[index] ? "✓" : ""}</span>
                  <span className="guide-step-no">{String(index + 1).padStart(2, "0")}</span>
                  <span>
                    <b>{step.title}</b>
                    <p>{step.body}</p>
                  </span>
                </button>
              ))}
            </div>
            <div className="guide-outcome">
              <h3>Expected outcome</h3>
              <p>{guide.outcome}</p>
            </div>
            <p className="guide-note">Checklist progress is saved for this employer in the browser. Checking a step is a personal note and does not perform the action.</p>
            <div className="guide-tools">
              <button type="button" className="explain-btn" onClick={() => downloadPlaybook(guide)}>Download playbook</button>
              <button type="button" className="guide-reset" onClick={checks.reset}>Reset checklist</button>
            </div>
          </>
        )}
        <h3 className="guide-related-title">Related pages</h3>
        <div className="guide-related">
          {guide.related.map((page) => (
            <button key={page.id} type="button" onClick={() => { onClose(); goto(page.id); }}>{page.label}</button>
          ))}
        </div>
      </div>
    </>
  );
}

export function PageHead({ k, title, lede, children }: { k: string; title: string; lede?: string; children?: ReactNode }) {
  const [view, setView] = useState<null | "explain" | "playbook">(null);
  const guide = pageGuide(title);
  return (
    <div className="page-head">
      <div>
        <div className="kicker">{k}</div>
        <div className="h-row">
          <h1>{title}</h1>
          <span className="h-actions">
            <button type="button" className="explain-btn" onClick={() => setView("explain")}>Explain this page</button>
            <button type="button" className="explain-btn" onClick={() => setView("playbook")}>Playbook</button>
          </span>
        </div>
        {lede ? <p className="lede">{lede}</p> : null}
      </div>
      {children ? <div className="actions">{children}</div> : null}
      {view && <GuideDialog guide={guide} view={view} onView={setView} onClose={() => setView(null)} />}
    </div>
  );
}
