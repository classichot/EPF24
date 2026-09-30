"use client";

import { PageHead as Head } from "@/components/page-head";
import { SecTable } from "@/components/sec-table";
import { COMPANY, baht } from "@/lib/model";
import type { SecLiveBook } from "@/lib/sec-book";

type LiveApi = {
  sec: SecLiveBook | null;
  secState: "idle" | "loading" | "ready" | "error";
};

function Trust({ items }: { items: string[] }) {
  return (
    <div className="trust">
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  );
}

function Wait({ api, title }: { api: LiveApi; title: string }) {
  if (api.secState === "loading" || api.secState === "idle") {
    return <p>Loading the first page of SEC Open Data for {title}.</p>;
  }
  return (
    <div className="surface">
      <p style={{ margin: 0 }}>{api.sec?.reason || "SEC live did not return published rows. The sample book is not being shown in its place."}</p>
    </div>
  );
}

export function SecCompare({ api }: { api: LiveApi }) {
  const book = api.sec;
  const ready = api.secState === "ready" && book?.live;
  return (
    <>
      <Head
        k="03 — Compare · SEC live"
        title="Published SEC rows, not a winner."
        lede={`${COMPANY.name} stays the private sample file: ${baht(COMPANY.aum)}, negotiated all-in 0.30%. The tables are the first page of SEC Open Data. A published rate is not that contract.`}
      />
      {!ready ? <Wait api={api} title="fees and performance" /> : (
        <>
          <SecTable title="Published fees" slice={book.fees} />
          <SecTable title="Published performance" slice={book.performance} />
          <SecTable title="Companies on this page" slice={book.companies} />
          <Trust items={["Source: SEC Open Data, first page only", "Published fee and performance stay in the SEC lane", `${COMPANY.name} 0.30% and ${baht(COMPANY.annualCost)} stay the private sample file`, "No service score is filled in, because the SEC page does not publish one", "A highlighted winner is not declared"]} />
        </>
      )}
    </>
  );
}

export function SecIntel({ api }: { api: LiveApi }) {
  const book = api.sec;
  const ready = api.secState === "ready" && book?.live;
  return (
    <>
      <Head
        k="02 — EPF Intelligence · SEC live"
        title="Provident-fund companies and funds from SEC Open Data."
        lede="This page is the first SEC page of companies and fund records. Employer names stay on the Employers list. Returns and fees are the published rows below, not the sample book."
      />
      {!ready ? <Wait api={api} title="companies and funds" /> : (
        <>
          <div className="stats">
            <div className="stat"><b style={{ fontSize: 28 }}>{book.companies.count}</b><span className="muted">Companies on this page</span></div>
            <div className="stat"><b style={{ fontSize: 28 }}>{book.funds.count}</b><span className="muted">Fund rows on this page</span></div>
            <div className="stat"><b style={{ fontSize: 28 }}>{book.fees.count}</b><span className="muted">Published fee rows</span></div>
            <div className="stat"><b style={{ fontSize: 28 }}>{book.performance.count}</b><span className="muted">Published performance rows</span></div>
          </div>
          <SecTable title="Companies" slice={book.companies} />
          <SecTable title="Funds" slice={book.funds} />
          <SecTable title="Published fees" slice={book.fees} />
          <SecTable title="Published performance" slice={book.performance} />
          <Trust items={["Source: SEC Open Data, first page only", "Employer funds stay on Employers", "A published fee is not an employer’s negotiated contract"]} />
        </>
      )}
    </>
  );
}
