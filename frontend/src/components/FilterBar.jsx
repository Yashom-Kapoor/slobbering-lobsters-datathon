export default function FilterBar({ sdg, setSdg, region, setRegion, sdgs, regions }) {
  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label>SDG Focus</label>
        <select value={sdg} onChange={(e) => setSdg(e.target.value)}>
          <option value="all">All SDGs</option>
          {sdgs.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <label>Region</label>
        <select value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="all">All Regions</option>
          {regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
