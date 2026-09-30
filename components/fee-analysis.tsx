"use client";

import { useEffect, useState } from "react";
import { PageHead as Head } from "@/components/page-head";
import { FEE_LINES, feeTotal } from "@/lib/fee";
import { COMPANY, baht, feeLabel } from "@/lib/model";
import type { PvdCompany, PvdMarket } from "@/lib/sec-pvd-market";

function million(value: number | null) {
  if (value == null) return "—";
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function count(value: number | null) {
  if (value == null) return "—";
  return value.toLocaleString("en-US");
}

function isMarket(body: unknown): body is PvdMarket {
  if (!body || typeof body !== "object") return false;
  const row = body as PvdMarket;
  return typeof row.live === "boolean" && Array.isArray(row.companies) && Array.isArray(row.assets);
}

function HBars({ rows, value }: { rows: { key: string; label: string; title: string; amount: number }[]; value: (n: number) => string }) {
  const max = Math.max(...rows.map((row) => row.amount), 0);
  if (!rows.length || max <= 0) return <p className="muted">No figure in this slice.</p>;
  return (
    <div>
      {rows.map((row) => (
        <div key={row.key} className="cohort" style={{ gridTemplateColumns: "minmax(140px, 280px) minmax(0, 1fr) 120px" }}>
          <span style={{ fontWeight: 600 }} title={row.title}>{row.label}</span>
          <div className="hbar" title={row.title}>
            <span style={{ width: `${(row.amount / max) * 100}%`, background: "var(--color-accent)" }} />
          </div>
          <b className="num">{value(row.amount)}</b>
        </div>
      ))}
    </div>
  );
}

function companyRows(companies: PvdCompany[]) {
  const ranked = companies.filter((item) => (item.navMillion ?? 0) > 0);
  const head = ranked.slice(0, 12);
  const rest = ranked.slice(12);
  const rows = head.map((item) => ({
    key: item.name,
    label: item.label,
    title: `${item.name}${item.funds != null ? ` · ${item.funds.toLocaleString("en-US")} funds` : ""}`,
    amount: item.navMillion ?? 0,
  }));
  const other = rest.reduce((sum, item) => sum + (item.navMillion ?? 0), 0);
  if (other > 0) {
    rows.push({
      key: "other",
      label: "Other management companies",
      title: `${rest.length.toLocaleString("en-US")} other companies in the same quarter`,
      amount: other,
    });
  }
  return rows;
}

export function FeeAnalysis() {
  const [market, setMarket] = useState<PvdMarket | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [tick, setTick] = useState(0);
  const negotiated = feeTotal(FEE_LINES);
  const paths = [
    { id: "hold", label: "No action", amount: COMPANY.annualCost, note: "Keep the current sample contract." },
    { id: "talk", label: "Renegotiate", amount: COMPANY.annualCost - COMPANY.renegotiateSaving, note: "Ask the incumbent to reprice. Sample case, not a sent offer." },
    { id: "fit", label: "Best fit", amount: COMPANY.altCost, note: "The sample book’s best-fit cost. Not the cheapest." },
    { id: "cheap", label: "Cheapest", amount: COMPANY.annualCost - COMPANY.cheapestSaving, note: "Shown so it can be rejected. Cheapest is not best fit." },
  ];

  useEffect(() => {
    let cancel = false;
    setState("loading");
    fetch("/api/sec/pvd-market")
      .then((res) => res.json())
      .then((body) => {
        if (cancel) return;
        if (!isMarket(body) || !body.live) {
          setMarket(isMarket(body) ? body : null);
          setState("error");
          return;
        }
        setMarket(body);
        setState("ready");
      })
      .catch(() => {
        if (cancel) return;
        setMarket(null);
        setState("error");
      });
    return () => { cancel = true; };
  }, [tick]);

  return (
    <>
      <Head
        k="Fee analysis · PVD"
        title="The provident-fund market, and this contract’s fee."
        lede="The market side is the SEC’s published provident-fund statistics: funds, members, employers, and assets by company. The SEC does not publish the employer’s negotiated fee, so that lane is the sample contract. A lower sample price is not a recommendation to switch."
      />

      <h6>Published provident-fund market</h6>
      {state === "loading" && <p>Loading SEC provident-fund statistics.</p>}
      {state === "error" && (
        <div className="surface">
          <p style={{ marginTop: 0 }}>{market?.reason || "The SEC provident-fund statistics file did not load. The negotiated fee below is still the sample contract."}</p>
          <button className="btn btn-secondary" type="button" onClick={() => setTick((value) => value + 1)}>Try again</button>
        </div>
      )}
      {state === "ready" && market && (
        <>
          <p className="muted">{market.period}{market.asOf ? ` · as of ${market.asOf}` : ""}. Assets are million baht, as published. This is not a fee.</p>
          <div className="stats">
            <div className="stat"><b style={{ fontSize: 28 }}>{count(market.funds)}</b><span className="muted">Provident funds</span></div>
            <div className="stat"><b style={{ fontSize: 28 }}>{count(market.members)}</b><span className="muted">Members</span></div>
            <div className="stat"><b style={{ fontSize: 28 }}>{count(market.employers)}</b><span className="muted">Employers</span></div>
            <div className="stat"><b style={{ fontSize: 28 }}>{million(market.navMillion)}</b><span className="muted">Net assets, million baht</span></div>
          </div>
          <div className="split">
            <div>
              <h6>Assets by management company</h6>
              <HBars rows={companyRows(market.companies)} value={(n) => million(n)} />
              <p className="muted">Longer means more published assets in this quarter, not a lower fee and not a better fit.</p>
            </div>
            <div>
              <h6>Where those assets sit</h6>
              <HBars
                rows={market.assets.map((item) => ({ key: item.label, label: item.label, title: item.label, amount: item.navMillion }))}
                value={(n) => million(n)}
              />
              {market.liabilitiesMillion != null && (
                <p className="muted">Other liabilities in the same quarter were {million(market.liabilitiesMillion)} million baht. They are deducted in the published net asset value.</p>
              )}
            </div>
          </div>
        </>
      )}

      <h6>Negotiated fee · sample contract</h6>
      <p className="muted">
        {COMPANY.name} · {COMPANY.provider} · {feeLabel(COMPANY.feeRate)} all-in · {baht(negotiated)} a year.
        This is the private sample file. It is not an SEC published fee, and it is not added to the market assets above.
      </p>
      <div className="scroll">
        <table className="table">
          <thead>
            <tr>
              <th>Line</th>
              <th className="num">Negotiated</th>
              <th className="num">Best-fit case</th>
              <th className="num">Gap</th>
            </tr>
          </thead>
          <tbody>
            {FEE_LINES.map((line) => (
              <tr key={line.id}>
                <td style={{ fontWeight: 600 }}>{line.name}</td>
                <td className="num">{baht(line.amount)}</td>
                <td className="num">{baht(line.benchmark)}</td>
                <td className="num">{baht(line.saving)}</td>
              </tr>
            ))}
            <tr>
              <td style={{ fontWeight: 600 }}>All-in</td>
              <td className="num">{baht(negotiated)}</td>
              <td className="num">{baht(COMPANY.altCost)}</td>
              <td className="num">{baht(negotiated - COMPANY.altCost)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h6>What the sample book can do next</h6>
      <HBars
        rows={paths.map((item) => ({ key: item.id, label: item.label, title: item.note, amount: item.amount }))}
        value={(n) => baht(n)}
      />
      <p className="muted">Longer means a higher annual cost in the sample book. No action keeps the current contract. Cheapest is not best fit.</p>
      <div className="trust">
        <span>{market?.source || "Negotiated figures are the Rattana sample file. They are not an SEC fee."}</span>
        <span>The line-by-line clauses stay on Fee X-Ray.</span>
      </div>
    </>
  );
}
