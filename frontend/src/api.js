const BASE = "http://localhost:5000";

export async function fetchJSON(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export const getRegions = () => fetchJSON("/regions");
export const getSdgs = () => fetchJSON("/sdgs");
export const getCountries = () => fetchJSON("/countries");

export const getSummary = (sdg, region) =>
  fetchJSON(`/summary/${encodeURIComponent(sdg)}/${encodeURIComponent(region)}`);

export const getMetricsByCountry = (sdg, region) =>
  fetchJSON(`/data/${encodeURIComponent(sdg)}/${encodeURIComponent(region)}/metrics_by_country`);

export const getFundingByYear = (sdg, region) =>
  fetchJSON(`/data/${encodeURIComponent(sdg)}/${encodeURIComponent(region)}/by_year`);

export const getCountryDetail = (sdg, region, country) =>
  fetchJSON(
    `/data/${encodeURIComponent(sdg)}/${encodeURIComponent(region)}/country_detail/${encodeURIComponent(country)}`
  );

export const getTable = (sdg, region, sortBy, sortDir, page, perPage) =>
  fetchJSON(
    `/table?sdg=${encodeURIComponent(sdg)}&region=${encodeURIComponent(region)}&sort_by=${sortBy}&sort_dir=${sortDir}&page=${page}&per_page=${perPage}`
  );

export async function postOrganization(body) {
  const res = await fetch(`${BASE}/organizations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unknown error");
  return data;
}
