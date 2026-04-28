import { useState } from "react";
import { useAppData } from "./useAppData";
import FilterBar from "./components/FilterBar";
import MetricSelector from "./components/MetricSelector";
import StatsBar from "./components/StatsBar";
import ChoroplethMap from "./components/ChoroplethMap";
import CountryModal from "./components/CountryModal";
import DataTable from "./components/DataTable";
import OrgForm from "./components/OrgForm";
import "./App.css";

export default function App() {
  const {
    regions, sdgs, countries,
    sdg, setSdg, region, setRegion,
    summary, mapData,
    metric, setMetric,
    loading, error,
    refresh,
  } = useAppData();

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);

  function handleFormSuccess() {
    refresh();
    triggerToast("Organization added successfully!");
  }

  function triggerToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  return (
    <div className="app">
      <header className="navbar">
        <div className="navbar-title">🌍 SDG Funding Dashboard</div>
        <a href="/landing.html" className="btn-home">← Home</a>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Add Organization
        </button>
      </header>

      <div className="toolbar">
        <FilterBar sdg={sdg} setSdg={setSdg} region={region} setRegion={setRegion} sdgs={sdgs} regions={regions} />
        <MetricSelector metric={metric} setMetric={setMetric} />
      </div>

      <div className="page-content">
        <StatsBar summary={summary} loading={loading} />

        {error && <div className="error-banner">Error loading data: {error}</div>}

        <section className="map-section">
          <h2 className="section-title">
            Geographic Distribution
            <span className="section-subtitle">Click a country to see detailed visualizations</span>
          </h2>
          <ChoroplethMap
            mapData={mapData}
            metric={metric}
            onCountryClick={setSelectedCountry}
          />
        </section>

        <DataTable sdg={sdg} region={region} />
      </div>

      {selectedCountry && (
        <CountryModal
          country={selectedCountry}
          sdg={sdg}
          region={region}
          onClose={() => setSelectedCountry(null)}
        />
      )}

      {showForm && (
        <OrgForm
          regions={regions}
          sdgs={sdgs}
          countries={countries}
          onSuccess={handleFormSuccess}
          onClose={() => setShowForm(false)}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
