"use client";

import { useState } from "react";
import { PageHead as Head } from "@/components/page-head";
import { COMPANY, SAMPLE_AMCS, baht, feeLabel, pct, type ScreenId } from "@/lib/model";
import {
  architectureOf,
  experience,
  frameworkRows,
  headlineRva,
  lateCareer,
  qualityRows,
  qualitySentence,
  signedPct,
  youngAllocation,
} from "@/lib/retirement-outcome";

export function RetirementOutcome({ goto }: { goto: (id: ScreenId) => void }) {
  const book = headlineRva();
  const young = youngAllocation();
  const late = lateCareer();
  const rows = qualityRows();
  const narrow = architectureOf("sh");
  const fitMenu = architectureOf("cp");
  const wide = architectureOf("an");
  const factors = frameworkRows();
  const [kept, setKept] = useState(false);

  return (
    <>
      <Head
        k="Retirement outcome"
        title="What will this provident fund actually do for my employees?"
        lede="Attractiveness is retirement outcome quality, not the fee alone. Manager names are SEC companies. Returns, fees, menus and these projections are a mock sample. A projection is not a guarantee, and the employer fee saving is not added into a member balance."
      />

      <section className="poster">
        <div className="kicker">Retirement Value Added · {book.member.name}</div>
        <div className="poster-num">+{baht(book.rva)}</div>
        <div>
          {book.member.role}. Same contributions. Current path {pct(book.currentRate, 1)} versus the best-fit scenario {pct(book.altRate, 1)}. {book.member.note}
        </div>
        <div className="poster-grid">
          <div>
            <b>{baht(book.current.bal)}</b>
            <span>Current fund at retirement · {COMPANY.provider}</span>
          </div>
          <div>
            <b>{baht(book.alternative.bal)}</b>
            <span>Best-fit scenario · {book.fit.name}</span>
          </div>
          <div>
            <b>{baht(book.employerFee)}</b>
            <span>Employer fee opportunity / year · not inside this RVA</span>
          </div>
        </div>
      </section>

      <div className="split">
        <div>
          <h6>How the {baht(book.rva)} is built</h6>
          <div className="rule">
            <div className="rowline">
              <span>Fee effect on this balance</span>
              <b>+{baht(book.feeEffect)}</b>
            </div>
            <p className="muted">Hold the gross planning return and apply only the fee gap, from {feeLabel(COMPANY.feeRate)} to {feeLabel(book.fit.fee)}. This is the member’s balance, not the employer’s {baht(book.employerFee)} a year.</p>
            <div className="rowline">
              <span>Investment outcome after that fee</span>
              <b>+{baht(book.investEffect)}</b>
            </div>
            <p className="muted">The rest of the spread, up to the {pct(book.altRate, 1)} scenario already used on the dashboard. It is not {book.fit.name}’s published return.</p>
            <div className="rowline">
              <span>Allocation improvement</span>
              <b>Separate member</b>
            </div>
            <p className="muted">{young.member.name} is the allocation case below. That baht figure is not added here, because it is a different person.</p>
            <div className="rowline">
              <span>Tax and contribution</span>
              <b>Not in this RVA</b>
            </div>
            <p className="muted">Contribution is the member’s lever on Employee wealth. Tax is not modeled in this sample.</p>
            <div className="rowline">
              <span>RVA for {book.member.name}</span>
              <b>+{baht(book.rva)}</b>
            </div>
          </div>
        </div>
        <div className="surface">
          <h6 style={{ margin: 0 }}>What the committee can do</h6>
          <p style={{ margin: 0 }}>
            {SAMPLE_AMCS.kf} is cheaper in the mock book and is not the recommendation. {book.fit.name} is the best-fit scenario on cost, lifecycle and the planning return, and it is not the smallest drawdown.
          </p>
          <p style={{ margin: 0 }}>
            No action remains open. The current arrangement can stay if {COMPANY.provider} reprices and adds a lifecycle default. Switching is not required to use this page.
          </p>
          <div className="actions">
            <button className="btn btn-primary" type="button" onClick={() => setKept(true)}>
              {kept ? "No action recorded" : "No action — keep the current fund"}
            </button>
            <button className="btn btn-secondary" type="button" onClick={() => goto("gap")}>Employer fee lane</button>
          </div>
          {kept && <p style={{ margin: 0 }}>Recorded on this screen only. Nothing is sent. The next check is whether a lifecycle default is actually added.</p>}
        </div>
      </div>

      <h6>Performance quality, not a league table</h6>
      <p className="muted">{qualitySentence()} A 10-year series is not in this sample book, so that cell stays empty.</p>
      <div className="stack">
        <table className="table">
          <thead>
            <tr><th>Return</th><th>1Y</th><th>3Y</th><th>5Y</th><th>10Y</th></tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.provider.id}>
                <td><b>{row.provider.name}</b><div className="muted">{row.role}</div></td>
                <td>{row.provider.r1.toFixed(1)}%</td>
                <td>{row.provider.r3.toFixed(1)}%</td>
                <td>{row.provider.r5.toFixed(1)}%</td>
                <td>—</td>
              </tr>
            ))}
          </tbody>
        </table>
        <table className="table">
          <thead>
            <tr><th>Risk</th><th>Volatility</th><th>Max drawdown</th><th>Worst 12 months</th><th>Recovery</th></tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.provider.id}>
                <td><b>{row.role}</b></td>
                <td>{row.provider.vol.toFixed(1)}%</td>
                <td>{signedPct(row.provider.dd)}</td>
                <td>{signedPct(row.note.worst12)}</td>
                <td>{row.note.recoveryMonths} mo</td>
              </tr>
            ))}
          </tbody>
        </table>
        <table className="table">
          <thead>
            <tr><th>Consistency</th><th>Rolling 3Y beat</th><th>Downside capture</th><th>Upside capture</th></tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.provider.id}>
                <td><b>{row.role}</b></td>
                <td>{pct(row.note.beatRolling, 0)}</td>
                <td>{pct(row.note.downCapture, 0)}</td>
                <td>{pct(row.note.upCapture, 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h6>Investment architecture</h6>
      <p className="muted">
        A richer menu is a different product even before the fee. Counts match the sample book: {narrow.provider.name} {narrow.count}, {fitMenu.provider.name} {fitMenu.count}, {wide.provider.name} {wide.count}. These lists are a mock lineup, not a live fund menu.
      </p>
      <div className="split">
        <Architecture title="Narrow sample" pack={narrow} note="Four policies and no lifecycle. Employees who never choose stay in one default." />
        <Architecture title="Best-fit sample" pack={fitMenu} note={experience(fitMenu.provider)} />
        <Architecture title="Widest sample" pack={wide} note="Shown for the menu, not because it is the cheapest or the best fit." />
      </div>

      <h6>Which policy fits this employee?</h6>
      <div className="split">
        <div className="surface">
          <div className="kicker">{young.member.name}</div>
          <b>{young.member.role}</b>
          <p style={{ margin: 0 }}>{young.member.note}</p>
          <div className="rowline"><span>Existing allocation · {young.currentMix}</span><b>{baht(young.conservative.bal)}</b></div>
          <div className="rowline"><span>Life Path scenario · 5.8% planning rate</span><b>{baht(young.life.bal)}</b></div>
          <div className="rowline"><span>Difference if the lineup allows it</span><b>+{baht(young.difference)}</b></div>
          <p className="muted" style={{ margin: 0 }}>
            {COMPANY.provider} has no Life Path in the sample. The higher figure exists only if a lifecycle policy is added or the provider changes. It is not a forecast.
          </p>
        </div>
        <div className="surface">
          <div className="kicker">{late.member.name}</div>
          <b>{late.member.role}</b>
          <p style={{ margin: 0 }}>{late.member.note}</p>
          <div className="rowline"><span>Steadier path · 3% planning rate</span><b>{baht(late.steady.bal)}</b></div>
          <div className="rowline"><span>Growth push · 6.5% planning rate</span><b>{baht(late.growth.bal)}</b></div>
          <div className="rowline"><span>Higher scenario, not the recommendation</span><b>+{baht(late.difference)}</b></div>
          <p style={{ margin: 0 }}><b>{late.verdict}.</b> Do not give this member the same equity tilt as a 27-year-old. Today’s money for the steadier path is {baht(late.steady.real)}.</p>
        </div>
      </div>

      <h6>Cost, return, risk, choice, personalization, service, outcome</h6>
      <table className="table">
        <thead>
          <tr>
            <th></th>
            <th>{COMPANY.provider}</th>
            <th>{book.fit.name}</th>
          </tr>
        </thead>
        <tbody>
          {factors.map((row) => (
            <tr key={row.label}>
              <td><b>{row.label}</b></td>
              <td>{row.current}</td>
              <td>{row.fit}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="muted">
        Holdings and performance attribution are not in this sample, so transparency is incomplete for both. Advice quality is not scored. An education score is not advice. Global diversification in the sample is a flag, not a measured country weight.
      </p>

      <div className="actions">
        <button className="btn btn-secondary" type="button" onClick={() => goto("employees")}>Employee wealth</button>
        <button className="btn btn-secondary" type="button" onClick={() => goto("workforce")}>Workforce health</button>
        <button className="btn btn-secondary" type="button" onClick={() => goto("bench")}>Benchmark</button>
      </div>
    </>
  );
}

function Architecture({ title, pack, note }: { title: string; pack: ReturnType<typeof architectureOf>; note: string }) {
  return (
    <div className="surface">
      <div className="kicker">{title}</div>
      <b>{pack.provider.name}</b>
      <div className="muted">{pack.count} policies · lifecycle {pack.life ? "yes" : "no"} · global flag {pack.global ? "yes" : "no"}</div>
      <div className="pill-row">
        {pack.menu.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
      <p className="muted" style={{ margin: 0 }}>{note}</p>
    </div>
  );
}
