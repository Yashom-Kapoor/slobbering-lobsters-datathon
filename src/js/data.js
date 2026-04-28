import { appState } from './state.js';

// ── Per-country total for the current filter state ────────────────────────────
export function countryTotal(iso) {
  const d  = appState.mapData?.byCountry[iso]; if (!d) return 0;
  const yd = d.years[appState.year];           if (!yd) return 0;
  if (!appState.sectors.length) return yd.total;
  return appState.sectors.reduce((sum, sec) => sum + (yd.sectors[sec] || 0), 0);
}

// ── Max value across all countries (memoised per filter key) ──────────────────
export function maxVal() {
  const key = appState.year + '|' + appState.sectors.join();
  if (appState.cachedMax[key] != null) return appState.cachedMax[key];
  let mx = 0;
  Object.keys(appState.mapData?.byCountry || {}).forEach(iso => {
    const v = countryTotal(iso);
    if (v > mx) mx = v;
  });
  appState.cachedMax[key] = mx;
  return mx;
}

// ── Global aggregates ─────────────────────────────────────────────────────────
export function globalTotal() {
  if (!appState.sectors.length) return appState.mapData?.globalTotals[appState.year] || 0;
  const gs = appState.mapData?.globalSectors[appState.year] || {};
  return appState.sectors.reduce((sum, sec) => sum + (gs[sec] || 0), 0);
}

export function globalCount() {
  if (!appState.sectors.length) return appState.mapData?.globalCounts[appState.year] || 0;
  return null; // not computable after sector filter without row-level data
}

export function topCountries(n = 10) {
  if (!appState.sectors.length) {
    return (appState.mapData?.topCountries[appState.year] || []).slice(0, n);
  }
  return Object.keys(appState.mapData?.byCountry || {})
    .map(iso => [iso, countryTotal(iso)])
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

// ── Formatting ────────────────────────────────────────────────────────────────
export function fmtM(v) {
  if (v >= 1000) return (v / 1000).toFixed(1) + 'B';
  if (v >= 1)    return v.toFixed(1) + 'M';
  return (v * 1000).toFixed(0) + 'K';
}
