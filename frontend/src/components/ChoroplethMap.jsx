import { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const METRIC_LABELS = {
  total_funding: "Total Funding",
  growth: "Funding Growth",
  num_orgs: "# Organizations",
  num_proj: "# Projects",
};

function getColor(value, min, max, metric) {
  if (value === undefined || value === null) return "#e5e7eb";
  const t = max === min ? 0.5 : (value - min) / (max - min);
  if (metric === "growth") {
    if (value >= 0) {
      const g = Math.round(34 + t * 184);
      return `rgb(20, ${g}, 80)`;
    } else {
      const r = Math.round(200 + (1 - t) * 55);
      return `rgb(${r}, 30, 30)`;
    }
  }
  const r = Math.round(239 - t * 200);
  const g = Math.round(246 - t * 160);
  const b = Math.round(255 - t * 80);
  return `rgb(${r},${g},${b})`;
}

function formatValue(value, metric) {
  if (value === undefined || value === null) return "No data";
  if (metric === "total_funding" || metric === "growth") {
    const abs = Math.abs(value);
    const prefix = value < 0 ? "-$" : "$";
    if (abs >= 1e9) return `${prefix}${(abs / 1e9).toFixed(2)}B`;
    if (abs >= 1e6) return `${prefix}${(abs / 1e6).toFixed(2)}M`;
    if (abs >= 1e3) return `${prefix}${(abs / 1e3).toFixed(1)}K`;
    return `${prefix}${abs.toFixed(2)}`;
  }
  return value.toLocaleString();
}

export default function ChoroplethMap({ mapData, metric, onCountryClick }) {
  const mapRef = useRef(null);
  const leafletRef = useRef(null);
  const geoLayerRef = useRef(null);
  const legendRef = useRef(null);

  const buildLayer = useCallback(
    (geoJson) => {
      if (!leafletRef.current) return;

      const isoToData = {};
      mapData.forEach((d) => {
        if (d.ISO) isoToData[d.ISO] = d;
      });

      const values = mapData.map((d) => d[metric]).filter((v) => v !== undefined && v !== null);
      const min = values.length ? Math.min(...values) : 0;
      const max = values.length ? Math.max(...values) : 1;

      if (geoLayerRef.current) {
        geoLayerRef.current.remove();
      }

      geoLayerRef.current = L.geoJSON(geoJson, {
        style: (feature) => {
          const iso = feature.properties["ISO3166-1-Alpha-3"];
          const row = isoToData[iso];
          const value = row ? row[metric] : undefined;
          return {
            fillColor: getColor(value, min, max, metric),
            weight: 0.5,
            color: "#94a3b8",
            fillOpacity: 0.8,
          };
        },
        onEachFeature: (feature, layer) => {
          const iso = feature.properties["ISO3166-1-Alpha-3"];
          const row = isoToData[iso];
          const name = feature.properties.name || iso;
          const value = row ? row[metric] : undefined;

          layer.bindTooltip(
            `<strong>${name}</strong><br/>${METRIC_LABELS[metric]}: ${formatValue(value, metric)}`,
            { sticky: true }
          );

          layer.on("click", () => {
            if (row) onCountryClick(row.country);
          });

          layer.on("mouseover", function () {
            this.setStyle({ weight: 2, color: "#1e3a5f" });
          });
          layer.on("mouseout", function () {
            this.setStyle({ weight: 0.5, color: "#94a3b8" });
          });
        },
      }).addTo(leafletRef.current);

      // Update legend
      if (legendRef.current) legendRef.current.remove();
      legendRef.current = L.control({ position: "bottomright" });
      legendRef.current.onAdd = () => {
        const div = L.DomUtil.create("div", "map-legend");
        div.innerHTML = `<strong>${METRIC_LABELS[metric]}</strong><br/>`;
        const steps = 5;
        for (let i = steps; i >= 0; i--) {
          const v = min + (max - min) * (i / steps);
          div.innerHTML += `<span style="background:${getColor(v, min, max, metric)}"></span>${formatValue(v, metric)}<br/>`;
        }
        div.innerHTML += `<span style="background:#e5e7eb"></span>No data`;
        return div;
      };
      legendRef.current.addTo(leafletRef.current);
    },
    [mapData, metric, onCountryClick]
  );

  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;
    leafletRef.current = L.map(mapRef.current, {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 8,
      zoomControl: true,
    });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors © CARTO",
      maxZoom: 19,
    }).addTo(leafletRef.current);

    fetch("https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson")
      .then((r) => r.json())
      .then((geoJson) => {
        leafletRef.current._geoJson = geoJson;
        buildLayer(geoJson);
      });
  }, [buildLayer]);

  useEffect(() => {
    if (leafletRef.current && leafletRef.current._geoJson) {
      buildLayer(leafletRef.current._geoJson);
    }
  }, [buildLayer]);

  return <div ref={mapRef} className="map-container" />;
}
