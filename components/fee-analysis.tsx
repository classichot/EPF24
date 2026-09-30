"use client";

import { useEffect, useState } from "react";
import { PageHead as Head } from "@/components/page-head";
import { parseFeeBoard, type FeeBoard, type FeePoint } from "@/lib/sec-fee-board";

function figure(value: number | null) {
  if (value == null) return "—";
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function Bars({ rows }: { rows: FeePoint[] }) {
  const max = Math.max(...rows.map((row) => row.median ?? 0), 0);
  if (!rows.length || max <= 0) return <p className="muted">No published number in this slice.</p>;
  return (
    <div>
      {rows.map((row) => (
        <div key={row.label} className="cohort" style={{ gridTemplateColumns: "minmax(120px, 240px) minmax(0, 1fr) 88px" }}>
          <span style={{ fontWeight: 600 }}>{row.label}</span>
          <div className="hbar" title={`${row.count.toLocaleString("en-US")} published rows`}>
            <span style={{ width: `${((row.median ?? 0) / max) * 100}%`, background: "var(--color-accent)" }} />
          </div>
          <b className="num">{figure(row.median)}</b>
        </div>
      ))}
    </div>
  );
}

export function FeeAnalysis() {
  const [board, setBoard] = useState<FeeBoard | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [focus, setFocus] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancel = false;
    setState("loading");
    fetch("/api/sec/fees")
      .then((res) => res.json())
      .then((body) => {
        if (cancel) return;
        const next = parseFeeBoard(body);
        setBoard(next);
        setFocus(next?.focus ?? "");
        setState(next?.live ? "ready" : "error");
      })
      .catch(() => {
        if (cancel) return;
        setBoard(null);
        setState("error");
      });
    return () => { cancel = true; };
  }, [tick]);

  const cut = board?.cuts.find((item) => item.type === focus) ?? board?.cuts[0];
  const active = focus || board?.focus || "";

  return (
    <>
      <Head
        k="Fee analysis · SEC"
        title="Where published fees sit, by company, group, and type."
        lede="Provident funds only. Each bar is a median of PVD fees the SEC published. Mutual-fund factsheets are not on this page. The employer’s negotiated contract is not in these charts. A lower published fee is not a recommendation to switch."
      />
      {state === "loading" && <p>Loading published SEC fees.</p>}
      {state !== "loading" && !board?.live && (
        <div className="surface">
          <p style={{ marginTop: 0 }}>{board?.reason || "Fee analysis could not read the SEC feed. The sample book is not being shown in its place."}</p>
          {!!board?.attempts.length && (
            <p className="muted">{board.attempts.map((item) => `${item.path} · ${item.status || "no response"}`).join(" · ")}</p>
          )}
          <button className="btn btn-secondary" type="button" onClick={() => setTick((value) => value + 1)}>Try again</button>
        </div>
      )}
      {state === "ready" && board?.live && cut && (
        <>
          <p className="muted">{board.lane}{board.read.truncated ? " This view is the first pages of the feed, not every fund." : ""} Figures are shown as published, usually already in percent.</p>
          <div className="stats">
            <div className="stat"><b style={{ fontSize: 28 }}>{board.read.fees.toLocaleString("en-US")}</b><span className="muted">Fee rows read</span></div>
            <div className="stat"><b style={{ fontSize: 28 }}>{board.read.funds.toLocaleString("en-US")}</b><span className="muted">Funds on those rows</span></div>
            <div className="stat"><b style={{ fontSize: 28 }}>{board.read.companies.toLocaleString("en-US")}</b><span className="muted">Companies named</span></div>
            <div className="stat"><b style={{ fontSize: 28 }}>{figure(board.types.find((type) => type.label === active)?.median ?? null)}</b><span className="muted">{active || "Fee"} median</span></div>
          </div>
          <div className="stack">
            <span className="muted">Fee type</span>
            <div className="chips">
              {board.types.map((type) => (
                <button key={type.label} className={type.label === active ? "chip on" : "chip"} type="button" onClick={() => setFocus(type.label)}>
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          <div className="split">
            <div>
              <h6>By company · {active}</h6>
              <Bars rows={cut.byAmc} />
              {!cut.byAmc.length && <p className="muted">These rows did not name a management company.</p>}
            </div>
            <div>
              <h6>By investment group · {active}</h6>
              <Bars rows={cut.byGroup} />
              {!cut.byGroup.length && <p className="muted">These rows did not name a policy group.</p>}
            </div>
          </div>
          <h6>By fee type</h6>
          <div className="bars" style={{ height: 180 }}>
            {board.types.map((type) => {
              const max = Math.max(...board.types.map((item) => item.median ?? 0), 0.01);
              return (
                <i
                  key={type.label}
                  title={`${type.label} ${figure(type.median)}`}
                  style={{ height: `${((type.median ?? 0) / max) * 100}%`, background: type.label === active ? "var(--color-accent)" : "var(--color-neutral-400)" }}
                />
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
            {board.types.map((type) => (
              <span key={type.label} style={{ flex: 1 }} className="muted">{type.label}</span>
            ))}
          </div>
          {!!board.matrix.length && (
            <>
              <h6>Group by type</h6>
              <p className="muted">Each cell is the median published figure, then the number of rows. Empty means that pair was not on this page.</p>
              <div className="scroll">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Group</th>
                      {board.matrix[0].cells.map((cell) => <th key={cell.type} className="num">{cell.type}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {board.matrix.map((row) => (
                      <tr key={row.group}>
                        <td style={{ fontWeight: 600 }}>{row.group}</td>
                        {row.cells.map((cell) => (
                          <td key={cell.type} className="num">{cell.count ? `${figure(cell.median)} · ${cell.count}` : "—"}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          <div className="trust">
            <span>{board.reason}</span>
            <span>{board.read.matched.toLocaleString("en-US")} fee rows carried a company name or matched a fund record.</span>
            <span>The Rattana contract stays on Fee X-Ray. It is not a bar on this page.</span>
          </div>
        </>
      )}
    </>
  );
}
