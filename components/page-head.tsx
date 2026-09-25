"use client";

import { useEffect, useState, type ReactNode } from "react";
import { pageExplain, pagePlaybook } from "@/lib/page-explain";

function Pop({ label, kicker, children }: { label: string; kicker: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  return (
    <>
      <button type="button" className="explain-btn" aria-expanded={open} onClick={() => setOpen(true)}>{label}</button>
      {open && (
        <>
          <div className="explain-backdrop" onClick={() => setOpen(false)} />
          <div className="explain-pop" role="dialog" aria-modal="true" aria-label={label}>
            <div className="kicker">{kicker}</div>
            {children}
            <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>Close</button>
          </div>
        </>
      )}
    </>
  );
}

export function PageHead({ k, title, lede, children }: { k: string; title: string; lede?: string; children?: ReactNode }) {
  return (
    <div className="page-head">
      <div>
        <div className="kicker">{k}</div>
        <div className="h-row">
          <h1>{title}</h1>
          <span className="h-actions">
            <Pop label="Explain this page" kicker="This page">
              <p>{pageExplain(title, lede)}</p>
            </Pop>
            <Pop label="Playbook" kicker="Playbook">
              <ol>
                {pagePlaybook(title).map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </Pop>
          </span>
        </div>
        {lede ? <p className="lede">{lede}</p> : null}
      </div>
      {children ? <div className="actions">{children}</div> : null}
    </div>
  );
}
