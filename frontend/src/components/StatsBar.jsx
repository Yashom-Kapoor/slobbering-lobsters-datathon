function fmt(n) {
  if (n === null || n === undefined) return "—";
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

export default function StatsBar({ summary, loading }) {
  if (!summary && !loading) return null;

  const cards = [
    { label: "Total Funding", value: summary ? fmt(summary.total_funding) : "…" },
    {
      label: "Funding Growth",
      value: summary
        ? `${summary.growth >= 0 ? "+" : ""}${fmt(summary.growth)}`
        : "…",
      positive: summary ? summary.growth >= 0 : null,
    },
    { label: "Organizations", value: summary ? summary.num_orgs.toLocaleString() : "…" },
    { label: "Projects", value: summary ? summary.num_proj.toLocaleString() : "…" },
    { label: "Countries", value: summary ? summary.num_countries.toLocaleString() : "…" },
  ];

  return (
    <div className="stats-bar">
      {cards.map((c) => (
        <div key={c.label} className={`stat-card ${loading ? "loading" : ""}`}>
          <div className="stat-label">{c.label}</div>
          <div
            className="stat-value"
            style={
              c.positive !== null && c.positive !== undefined
                ? { color: c.positive ? "#22c55e" : "#ef4444" }
                : {}
            }
          >
            {c.value}
          </div>
        </div>
      ))}
    </div>
  );
}
