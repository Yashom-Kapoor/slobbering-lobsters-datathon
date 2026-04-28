import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from "recharts";
import { getCountryDetail } from "../api";

function fmt(n) {
  if (!n && n !== 0) return "—";
  const abs = Math.abs(n);
  const pre = n < 0 ? "-$" : "$";
  if (abs >= 1e9) return `${pre}${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${pre}${(abs / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${pre}${(abs / 1e3).toFixed(1)}K`;
  return `${pre}${abs.toFixed(2)}`;
}

const COLORS = ["#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#ec4899"];

export default function CountryModal({ country, sdg, region, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setDetail(null);
    getCountryDetail(sdg, region, country)
      .then(setDetail)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [country, sdg, region]);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal country-modal">
        <div className="modal-header">
          <h2>{country}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="country-modal-body">
          {loading && <div className="panel-loading">Loading…</div>}

          {detail && (
            <>
              <div className="panel-kpis">
                <div className="panel-kpi">
                  <div className="kpi-label">Total Funding</div>
                  <div className="kpi-value">{fmt(detail.summary.total_funding)}</div>
                </div>
                <div className="panel-kpi">
                  <div className="kpi-label">Organizations</div>
                  <div className="kpi-value">{detail.summary.num_orgs}</div>
                </div>
                <div className="panel-kpi">
                  <div className="kpi-label">Projects</div>
                  <div className="kpi-value">{detail.summary.num_proj}</div>
                </div>
              </div>

              <div className="country-modal-charts">
                <div className="chart-section">
                  <h3>Funding Over Time</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={detail.by_year}>
                      <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={fmt} tick={{ fontSize: 10 }} width={65} />
                      <Tooltip formatter={(v) => fmt(v)} />
                      <Line type="monotone" dataKey="total_funding" stroke="#3b82f6" dot={false} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-section">
                  <h3>Top 5 Organizations</h3>
                  <ul className="top-orgs">
                    {detail.top_orgs.map((o, i) => (
                      <li key={o.organization_name}>
                        <span className="org-rank" style={{ background: COLORS[i % COLORS.length] }}>{i + 1}</span>
                        <span className="org-name">{o.organization_name}</span>
                        <span className="org-val">{fmt(o.total_funding)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {detail.by_sdg.length > 1 && (
                  <div className="chart-section chart-full">
                    <h3>SDG Breakdown</h3>
                    <ResponsiveContainer width="100%" height={Math.max(120, detail.by_sdg.length * 28)}>
                      <BarChart data={detail.by_sdg} layout="vertical">
                        <XAxis type="number" tickFormatter={fmt} tick={{ fontSize: 10 }} />
                        <YAxis type="category" dataKey="sdg_focus" tick={{ fontSize: 9 }} width={90} />
                        <Tooltip formatter={(v) => fmt(v)} />
                        <Bar dataKey="total_funding">
                          {detail.by_sdg.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
