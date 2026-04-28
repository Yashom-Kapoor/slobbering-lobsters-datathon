import { useState, useEffect, useCallback } from "react";
import { getRegions, getSdgs, getCountries, getSummary, getMetricsByCountry } from "./api";

export function useAppData() {
  const [regions, setRegions] = useState([]);
  const [sdgs, setSdgs] = useState([]);
  const [countries, setCountries] = useState([]);

  const [sdg, setSdg] = useState("all");
  const [region, setRegion] = useState("all");

  const [summary, setSummary] = useState(null);
  const [mapData, setMapData] = useState([]);
  const [metric, setMetric] = useState("total_funding");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getRegions(), getSdgs(), getCountries()])
      .then(([r, s, c]) => {
        setRegions(r);
        setSdgs(s);
        setCountries(c);
      })
      .catch((e) => setError(e.message));
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([getSummary(sdg, region), getMetricsByCountry(sdg, region)])
      .then(([sum, map]) => {
        setSummary(sum);
        setMapData(map);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [sdg, region]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    regions, sdgs, countries,
    sdg, setSdg,
    region, setRegion,
    summary, mapData,
    metric, setMetric,
    loading, error,
    refresh,
  };
}
