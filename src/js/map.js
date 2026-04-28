import { appState }              from './state.js';
import { countryTotal, maxVal, fmtM } from './data.js';
import { colorFor }              from './colors.js';
import { REDUCED }               from './config.js';

export let map      = null;
export let geoLayer = null;

// GSAP tween targets: one { val } object per country so colors lerp smoothly.
const layerVal = {};

// ── Map initialisation ────────────────────────────────────────────────────────
export function initMap(containerId) {
  map = L.map(containerId, { zoomControl: false, attributionControl: true })
    .setView([20, 10], 2);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap © CARTO',
    subdomains: 'abcd',
    maxZoom: 18,
  }).addTo(map);

  L.control.zoom({ position: 'bottomright' }).addTo(map);
  return map;
}

// ── GeoJSON choropleth layer ──────────────────────────────────────────────────
export function initGeoLayer(worldGeoJSON) {
  geoLayer = L.geoJSON(worldGeoJSON, {
    style(feature) {
      const iso = appState.isoNumToA3[feature.id];
      if (!iso) return { fillColor: '#2d3748', fillOpacity: 0.4, weight: 0.3, color: '#0f172a' };
      const val = countryTotal(iso);
      return { fillColor: colorFor(val, maxVal()), fillOpacity: 0.85, weight: 0.4, color: '#0f172a' };
    },
    onEachFeature(feature, layer) {
      const iso = appState.isoNumToA3[feature.id];
      layer._iso = iso;
      if (!iso) return;
      layerVal[iso] = { val: countryTotal(iso) };
      layer.on({ mouseover: onHover, mouseout: onOut, click: onClick });
    },
  }).addTo(map);

  return geoLayer;
}

// ── Animated choropleth update ────────────────────────────────────────────────
export function animateMap() {
  appState.cachedMax = {};
  const mx = maxVal();
  geoLayer?.eachLayer(layer => {
    const iso = layer._iso; if (!iso) return;
    const newVal = countryTotal(iso);
    if (!layerVal[iso]) layerVal[iso] = { val: 0 };
    gsap.to(layerVal[iso], {
      val: newVal,
      duration: REDUCED ? 0 : 0.55,
      ease: 'power2.out',
      overwrite: 'auto',
      onUpdate() { layer.setStyle({ fillColor: colorFor(layerVal[iso].val, mx) }); },
    });
  });
}

// ── Camera: GSAP-driven fly (consistent timing with rest of UI) ───────────────
export function flyToLatLng(lat, lng, zoom) {
  const cam = { lat: map.getCenter().lat, lng: map.getCenter().lng, zoom: map.getZoom() };
  gsap.to(cam, {
    lat, lng, zoom,
    duration: REDUCED ? 0 : 1.2,
    ease: 'power3.inOut',
    onUpdate() { map.setView([cam.lat, cam.lng], cam.zoom, { animate: false }); },
  });
}

export function flyToIso(iso) {
  const layer = layerByIso(iso); if (!layer) return;
  const bounds = layer.getBounds();
  const zoom   = Math.min(map.getBoundsZoom(bounds) - 0.5, 6);
  flyToLatLng(bounds.getCenter().lat, bounds.getCenter().lng, zoom);
  openPopup(layer, iso);
}

// ── Popup ─────────────────────────────────────────────────────────────────────
export function openPopup(layer, iso) {
  const d  = appState.mapData?.byCountry[iso]; if (!d) return;
  const yd = d.years[appState.year] || d.years.all;   if (!yd) return;
  const total   = appState.sectors.length ? countryTotal(iso) : yd.total;
  const top3    = Object.entries(yd.sectors).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const secHtml = top3.map(([s, v]) => {
    const pct = total > 0 ? Math.max(4, (v / total) * 80) : 4;
    return `<div class="pop-sec-item">
      <div class="pop-sec-bar" style="width:${pct}px"></div>
      <span>${s.length > 24 ? s.slice(0, 24) + '…' : s} · ${fmtM(v)}</span>
    </div>`;
  }).join('');

  const popup = L.popup({ closeButton: true, autoPan: false })
    .setLatLng(layer.getBounds().getCenter())
    .setContent(`<div class="pop-inner">
      <div class="pop-country">${d.name}</div>
      <div class="pop-stat">Disbursed: <span>${fmtM(total)}</span></div>
      <div class="pop-stat">Grants: <span>${yd.count.toLocaleString()}</span></div>
      <div class="pop-sectors">${secHtml}</div>
    </div>`)
    .openOn(map);

  if (!REDUCED) {
    const el = popup.getElement();
    if (el) gsap.from(el, { y: 10, opacity: 0, duration: 0.25, ease: 'power2.out' });
  }
}

// ── Hover micro-interactions ──────────────────────────────────────────────────
function onHover(e) {
  const l = e.target;
  l.setStyle({ weight: 1.5, color: '#38bdf8', fillOpacity: 0.95 });
  if (!REDUCED && l._path) gsap.to(l._path, { filter: 'brightness(1.3)', duration: 0.18, overwrite: 'auto' });
}

function onOut(e) {
  const l = e.target;
  l.setStyle({ weight: 0.4, color: '#0f172a', fillOpacity: 0.85 });
  if (!REDUCED && l._path) gsap.to(l._path, { filter: 'brightness(1)', duration: 0.28, overwrite: 'auto' });
}

function onClick(e) {
  L.DomEvent.stopPropagation(e);
  flyToIso(e.target._iso);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function layerByIso(iso) {
  let found = null;
  geoLayer?.eachLayer(l => { if (l._iso === iso) found = l; });
  return found;
}
