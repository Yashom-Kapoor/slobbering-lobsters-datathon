const METRICS = [
  { id: "total_funding", label: "Total Funding" },
  { id: "growth", label: "Funding Growth" },
  { id: "num_orgs", label: "# Organizations" },
  { id: "num_proj", label: "# Projects" },
];

export default function MetricSelector({ metric, setMetric }) {
  return (
    <div className="metric-selector">
      {METRICS.map((m) => (
        <button
          key={m.id}
          className={`metric-pill ${metric === m.id ? "active" : ""}`}
          onClick={() => setMetric(m.id)}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
