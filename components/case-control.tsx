"use client";

import { useContext, useEffect, useRef, useState, type FormEvent } from "react";
import { CASE_STATUSES, caseFacts, statusLabel, type AdvisorCase, type CaseStatus, type NewCase } from "@/lib/cases";
import { PageHead, WorkspaceContext } from "@/components/page-head";

function parseAmount(raw: string): number | null | "bad" {
  const text = raw.trim();
  if (!text) return null;
  const value = Number(text.replace(/,/g, ""));
  if (!Number.isFinite(value) || value < 0) return "bad";
  return Math.round(value);
}

export function CaseControl({
  cases,
  active,
  onSelect,
  onStatus,
  onAdd,
  onRemove,
}: {
  cases: AdvisorCase[];
  active: AdvisorCase;
  onSelect: (id: string) => void;
  onStatus: (id: string, status: CaseStatus) => void;
  onAdd: (input: NewCase) => void;
  onRemove: (id: string) => void;
}) {
  const [book, setBook] = useState(false);
  const [adding, setAdding] = useState(false);
  const [employer, setEmployer] = useState("");
  const [provider, setProvider] = useState("");
  const [members, setMembers] = useState("");
  const [aum, setAum] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!book && !adding) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setBook(false);
      setAdding(false);
    };
    const onDown = (event: MouseEvent) => {
      if (book && !barRef.current?.contains(event.target as Node)) setBook(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [book, adding]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const name = employer.trim();
    if (!name) {
      setError("Name the employer.");
      return;
    }
    const memberCount = parseAmount(members);
    const assets = parseAmount(aum);
    if (memberCount === "bad" || assets === "bad") {
      setError("Members and assets must be blank or a number.");
      return;
    }
    onAdd({ employer: name, members: memberCount, aum: assets, provider, note });
    setEmployer("");
    setProvider("");
    setMembers("");
    setAum("");
    setNote("");
    setError("");
    setAdding(false);
    setBook(false);
  }

  return (
    <div className="case-bar" ref={barRef}>
      <button type="button" className="case-current" aria-expanded={book} aria-haspopup="dialog" onClick={() => { setAdding(false); setBook((open) => !open); }}>
        <small>Workspace</small>
        <b>{active.employer}</b>
        <span>{statusLabel(active.status)}{active.worked ? " · worked sample" : " · insufficient evidence"}</span>
      </button>
      <button type="button" className="btn btn-primary case-add" onClick={() => { setBook(false); setAdding(true); }}>Add case</button>
      {book && (
        <div className="case-book" role="dialog" aria-label="Case control">
            <div className="case-book-head">
              <div>
                <div className="kicker">Advisor workspace</div>
                <strong>Case control</strong>
              </div>
              <button type="button" className="guide-x" aria-label="Close case control" onClick={() => setBook(false)}>×</button>
            </div>
            <p className="muted">One open file at a time. Switching cases does not copy fees or returns from another employer.</p>
            {cases.map((item) => (
              <article key={item.id} className={item.id === active.id ? "case-row on" : "case-row"}>
                <div className="case-row-top">
                  <div>
                    <b>{item.employer}</b>
                    <div className="muted">{caseFacts(item)}</div>
                  </div>
                  {item.id === active.id ? <span className="case-open">Open file</span> : (
                    <button type="button" className="btn btn-secondary" onClick={() => { onSelect(item.id); setBook(false); }}>Open</button>
                  )}
                </div>
                <p className="muted">{item.note}</p>
                <div className="case-status" role="group" aria-label={`Status for ${item.employer}`}>
                  {CASE_STATUSES.map((status) => (
                    <button key={status.id} type="button" className={item.status === status.id ? "on" : ""} onClick={() => onStatus(item.id, status.id)}>{status.label}</button>
                  ))}
                </div>
                {!item.sample && <button type="button" className="btn btn-ghost" onClick={() => onRemove(item.id)}>Remove case</button>}
              </article>
            ))}
        </div>
      )}
      {adding && (
        <>
          <div className="explain-backdrop" onClick={() => setAdding(false)} />
          <AddCaseForm
            employer={employer}
            provider={provider}
            members={members}
            aum={aum}
            note={note}
            error={error}
            onEmployer={setEmployer}
            onProvider={setProvider}
            onMembers={setMembers}
            onAum={setAum}
            onNote={setNote}
            onSubmit={submit}
            onClose={() => setAdding(false)}
          />
        </>
      )}
    </div>
  );
}

function AddCaseForm({
  employer, provider, members, aum, note, error,
  onEmployer, onProvider, onMembers, onAum, onNote, onSubmit, onClose,
}: {
  employer: string;
  provider: string;
  members: string;
  aum: string;
  note: string;
  error: string;
  onEmployer: (value: string) => void;
  onProvider: (value: string) => void;
  onMembers: (value: string) => void;
  onAum: (value: string) => void;
  onNote: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  onClose: () => void;
}) {
  return (
    <form className="case-pop" onSubmit={onSubmit}>
      <div className="guide-title-row">
        <h2>Add case</h2>
        <button type="button" className="guide-x" aria-label="Close" onClick={onClose}>×</button>
      </div>
      <p className="muted">A new case starts empty. It does not inherit another employer’s fees, returns, or savings.</p>
      <label>Employer<input value={employer} onChange={(event) => onEmployer(event.target.value)} placeholder="Employer name" autoFocus /></label>
      <label>Incumbent provider<input value={provider} onChange={(event) => onProvider(event.target.value)} placeholder="Not confirmed" /></label>
      <div className="case-fields">
        <label>Members<input value={members} onChange={(event) => onMembers(event.target.value)} inputMode="numeric" placeholder="Unknown" /></label>
        <label>Assets, baht<input value={aum} onChange={(event) => onAum(event.target.value)} inputMode="numeric" placeholder="Unknown" /></label>
      </div>
      <label>Note<textarea value={note} onChange={(event) => onNote(event.target.value)} rows={3} placeholder="What is known, and what is still missing" /></label>
      {error && <p className="case-error">{error}</p>}
      <div className="h-actions">
        <button type="submit" className="btn btn-primary">Add case</button>
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
}

export function WorkspacePage() {
  const { cases, caseFile, selectCase, setCaseStatus, addCase, removeCase } = useContext(WorkspaceContext);
  const [adding, setAdding] = useState(false);
  const [employer, setEmployer] = useState("");
  const [provider, setProvider] = useState("");
  const [members, setMembers] = useState("");
  const [aum, setAum] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!adding) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAdding(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [adding]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const name = employer.trim();
    if (!name) {
      setError("Name the employer.");
      return;
    }
    const memberCount = parseAmount(members);
    const assets = parseAmount(aum);
    if (memberCount === "bad" || assets === "bad") {
      setError("Members and assets must be blank or a number.");
      return;
    }
    addCase({ employer: name, members: memberCount, aum: assets, provider, note });
    setEmployer("");
    setProvider("");
    setMembers("");
    setAum("");
    setNote("");
    setError("");
    setAdding(false);
  }

  return (
    <>
      <PageHead
        k="Advisor workspace"
        title="Case control"
        lede="One open file at a time. Switching cases does not copy fees or returns from another employer."
      >
        <button type="button" className="btn btn-primary" onClick={() => setAdding(true)}>Add case</button>
      </PageHead>
      <div className="case-board">
        {cases.map((item) => (
          <article key={item.id} className={item.id === caseFile?.id ? "case-row on" : "case-row"}>
            <div className="case-row-top">
              <div>
                <b>{item.employer}</b>
                <div className="muted">{caseFacts(item)}</div>
              </div>
              {item.id === caseFile?.id ? <span className="case-open">Open file</span> : (
                <button type="button" className="btn btn-secondary" onClick={() => selectCase(item.id)}>Open</button>
              )}
            </div>
            <p className="muted">{item.note}</p>
            <div className="muted">{item.worked ? "Worked sample. Fee and return figures belong to this file." : "Insufficient evidence. No fee or return is calculated for this employer."}</div>
            <div className="case-status" role="group" aria-label={`Status for ${item.employer}`}>
              {CASE_STATUSES.map((status) => (
                <button key={status.id} type="button" className={item.status === status.id ? "on" : ""} onClick={() => setCaseStatus(item.id, status.id)}>{status.label}</button>
              ))}
            </div>
            {!item.sample && <button type="button" className="btn btn-ghost" onClick={() => removeCase(item.id)}>Remove case</button>}
          </article>
        ))}
      </div>
      {adding && (
        <>
          <div className="explain-backdrop" onClick={() => setAdding(false)} />
          <AddCaseForm
            employer={employer}
            provider={provider}
            members={members}
            aum={aum}
            note={note}
            error={error}
            onEmployer={setEmployer}
            onProvider={setProvider}
            onMembers={setMembers}
            onAum={setAum}
            onNote={setNote}
            onSubmit={submit}
            onClose={() => setAdding(false)}
          />
        </>
      )}
    </>
  );
}
