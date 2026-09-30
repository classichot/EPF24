"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatGoal } from "@/lib/chat-brief";
import type { Audience, ScreenId } from "@/lib/model";

type Turn = { role: "user" | "assistant"; content: string };
type Note = { id: string; at: string; screen: string; text: string };

const GOALS: { id: ChatGoal; label: string; hint: string; ask: string }[] = [
  { id: "guide", label: "Use the app", hint: "Which menu to open, and what this page is for.", ask: "What is this page for?" },
  { id: "specialist", label: "EPF specialist", hint: "Provident-fund questions. Figures stay labeled as scenarios.", ask: "What should we compare besides the fee?" },
  { id: "feedback", label: "Feedback", hint: "What should change. Saved in this browser for the next build.", ask: "The comparison numbers were hard to line up with the headers." },
];

const EMPTY: Record<ChatGoal, Turn[]> = { guide: [], specialist: [], feedback: [] };
const NOTES_KEY = "epf24-feedback";

function loadNotes(): Note[] {
  try {
    const raw = JSON.parse(localStorage.getItem(NOTES_KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw.filter((item) => item && typeof item.text === "string").slice(0, 30);
  } catch {
    return [];
  }
}

export function AiChat({
  screen,
  audience,
  agiOn,
  llmOn,
}: {
  screen: ScreenId;
  audience: Audience;
  agiOn: boolean;
  llmOn: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [goal, setGoal] = useState<ChatGoal>("guide");
  const [threads, setThreads] = useState(EMPTY);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const scroller = useRef<HTMLDivElement>(null);
  const goalMeta = GOALS.find((item) => item.id === goal) ?? GOALS[0];
  const turns = threads[goal];

  useEffect(() => { setNotes(loadNotes()); }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    const node = scroller.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [turns, busy, open, goal]);

  function saveNote(text: string) {
    const note: Note = { id: `${Date.now()}`, at: new Date().toISOString(), screen, text };
    const next = [note, ...loadNotes()].slice(0, 30);
    try { localStorage.setItem(NOTES_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    setNotes(next);
  }

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    const history = [...threads[goal], { role: "user" as const, content }];
    setThreads((current) => ({ ...current, [goal]: history }));
    setDraft("");
    setBusy(true);
    try {
      const res = await fetch("/api/llm/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal,
          messages: history.slice(-8),
          context: { screen, audience, agi: agiOn },
        }),
      });
      const data = await res.json();
      const reply = typeof data?.reply === "string" ? data.reply : "The model did not answer.";
      setThreads((current) => ({ ...current, [goal]: [...history, { role: "assistant", content: reply }] }));
      if (goal === "feedback" && data?.connected === true) saveNote(content);
    } catch {
      setThreads((current) => ({
        ...current,
        [goal]: [...history, { role: "assistant", content: "The model could not be reached." }],
      }));
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button type="button" className="ai-chat-launch" onClick={() => setOpen(true)}>
        Ask EPF24
      </button>
    );
  }

  return (
    <section className="ai-chat" role="dialog" aria-modal="false" aria-label="Ask EPF24">
      <header className="ai-chat-top">
        <div>
          <b>Ask EPF24</b>
          <p>{llmOn ? "Connected to the language model." : "The language model is not marked ready. Sending still asks the server."}</p>
        </div>
        <button type="button" className="guide-x" onClick={() => setOpen(false)} aria-label="Close">×</button>
      </header>
      <div className="ai-chat-goals" role="tablist" aria-label="Chat goal">
        {GOALS.map((item) => (
          <button key={item.id} type="button" role="tab" aria-selected={goal === item.id} className={goal === item.id ? "on" : ""} onClick={() => setGoal(item.id)}>
            {item.label}
          </button>
        ))}
      </div>
      <p className="ai-chat-hint">{goalMeta.hint} The engines calculate. This chat explains.</p>
      <div className="ai-chat-log" ref={scroller}>
        {turns.length === 0 && (
          <button type="button" className="ai-chat-suggest" onClick={() => send(goalMeta.ask)}>{goalMeta.ask}</button>
        )}
        {turns.map((turn, index) => (
          <p key={`${turn.role}-${index}`} className={turn.role === "user" ? "ai-chat-user" : "ai-chat-bot"}>{turn.content}</p>
        ))}
        {busy && <p className="ai-chat-bot">Thinking…</p>}
      </div>
      {goal === "feedback" && notes.length > 0 && (
        <div className="ai-chat-notes">
          <span>Saved for the next build</span>
          {notes.slice(0, 3).map((note) => <p key={note.id}>{note.text}</p>)}
        </div>
      )}
      <form
        className="ai-chat-form"
        onSubmit={(event) => {
          event.preventDefault();
          send(draft);
        }}
      >
        <textarea
          value={draft}
          rows={2}
          placeholder={goalMeta.hint}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              send(draft);
            }
          }}
        />
        <button type="submit" className="btn btn-primary" disabled={busy || !draft.trim()}>Send</button>
      </form>
    </section>
  );
}
