import { columnLabel, formatSecCell, type SecSlice } from "@/lib/sec-book";

export function SecTable({ title, slice }: { title: string; slice: SecSlice }) {
  return (
    <>
      <h6>
        {title} <span className="muted">{slice.count.toLocaleString("en-US")} on this page</span>
      </h6>
      {slice.note && <p className="muted">{slice.note}</p>}
      {slice.columns.length === 0 ? (
        <p className="muted">{slice.status ? `SEC responded ${slice.status}.` : "No published rows in this page."}</p>
      ) : (
        <div className="scroll">
          <table className="table">
            <thead>
              <tr>
                {slice.columns.map((key) => (
                  <th key={key} className={key === "rate" || key === "performance_value" || key === "actual_value" ? "num" : undefined}>
                    {columnLabel(key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slice.rows.map((row, index) => (
                <tr key={`${slice.path}-${index}`}>
                  {row.map((value, cell) => {
                    const key = slice.columns[cell];
                    const numeric = key === "rate" || key === "performance_value" || key === "actual_value" || typeof value === "number";
                    return (
                      <td key={key} className={numeric ? "num" : undefined} style={cell === 0 ? { fontWeight: 600 } : undefined}>
                        {formatSecCell(value)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
