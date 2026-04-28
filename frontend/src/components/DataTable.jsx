import { useState, useEffect } from "react";
import { getTable } from "../api";

function fmt(n) {
  if (n === null || n === undefined || n === "") return "—";
  const v = parseFloat(n);
  if (isNaN(v)) return n;
  if (Math.abs(v) >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (Math.abs(v) >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  if (Math.abs(v) >= 1e3) return `$${(v / 1e3).toFixed(1)}K`;
  return `$${v.toFixed(2)}`;
}

const COLUMNS = [
  { key: "year",                        label: "Year",          numeric: true  },
  { key: "organization_name",           label: "Organization",  numeric: false },
  { key: "country",                     label: "Country",       numeric: false },
  { key: "region",                      label: "Region",        numeric: false },
  { key: "usd_disbursements_defl",      label: "Funding (USD)", numeric: true  },
  { key: "Donor_country",               label: "Donor Country", numeric: false },
  { key: "sdg_focus",                   label: "SDG Focus",     numeric: false },
  { key: "grant_recipient_project_title", label: "Project",     numeric: false },
];

export default function DataTable({ sdg, region }) {
  const [sortBy, setSortBy]   = useState("usd_disbursements_defl");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage]       = useState(1);
  const perPage               = 50;

  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getTable(sdg, region, sortBy, sortDir, page, perPage)
      .then(setResult)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sdg, region, sortBy, sortDir, page]);

  // Reset to page 1 when filters or sort changes
  useEffect(() => { setPage(1); }, [sdg, region, sortBy, sortDir]);

  function handleSort(key) {
    if (sortBy === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDir("desc");
    }
  }

  function SortIcon({ col }) {
    if (sortBy !== col) return <span className="sort-icon neutral">⇅</span>;
    return <span className="sort-icon active">{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  return (
    <div className="data-table-section">
      <div className="table-header">
        <h2>Full Data</h2>
        {result && (
          <span className="table-count">
            {result.total.toLocaleString()} rows
            {(sdg !== "all" || region !== "all") && " (filtered)"}
          </span>
        )}
      </div>

      <div className="table-wrapper">
        <table className={`data-table ${loading ? "loading" : ""}`}>
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`${col.numeric ? "num" : ""} ${sortBy === col.key ? "sorted" : ""}`}
                >
                  {col.label} <SortIcon col={col.key} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result?.data.map((row, i) => (
              <tr key={i}>
                <td className="num">{row.year}</td>
                <td className="truncate" title={row.organization_name}>{row.organization_name}</td>
                <td>{row.country}</td>
                <td>{row.region}</td>
                <td className="num funding">{fmt(row.usd_disbursements_defl)}</td>
                <td>{row.Donor_country}</td>
                <td className="truncate" title={row.sdg_focus}>{row.sdg_focus}</td>
                <td className="truncate" title={row.grant_recipient_project_title}>{row.grant_recipient_project_title}</td>
              </tr>
            ))}
            {!loading && result?.data.length === 0 && (
              <tr><td colSpan={8} className="empty">No data for current filters</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {result && result.pages > 1 && (
        <div className="pagination">
          <button onClick={() => setPage(1)} disabled={page === 1}>«</button>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
          <span className="page-info">Page {page} of {result.pages}</span>
          <button onClick={() => setPage((p) => Math.min(result.pages, p + 1))} disabled={page === result.pages}>›</button>
          <button onClick={() => setPage(result.pages)} disabled={page === result.pages}>»</button>
        </div>
      )}
    </div>
  );
}
