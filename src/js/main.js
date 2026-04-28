import { appState }                      from './state.js';
import { animateMap, initMap, initGeoLayer, flyToLatLng } from './map.js';
import { updatePanel, buildChart }        from './panel.js';
import { initFilters, setYearUI, resetFilterUI } from './filters.js';
import { initSearch }                     from './search.js';
import { runEntryAnim, startStory, stopStory, isPlaying } from './animation.js';
import { TOPO_URL, DATA_URL, REDUCED }    from './config.js';

gsap.registerPlugin(Flip);

// ── Core filter-change handler (called by filters, storytelling, reset) ───────
function onFilterChange() {
  animateMap();
  updatePanel();
}

// ── Year activation (UI + state + refresh) ────────────────────────────────────
function setYearActive(yr) {
  appState.year = yr;
  setYearUI(yr);
  onFilterChange();
}

// ── Storytelling play button ──────────────────────────────────────────────────
function bindPlayButton() {
  const btn = document.getElementById('play-btn');

  btn.addEventListener('click', () => {
    if (isPlaying()) {
      stopStory();
      btn.textContent = '▶ Play';
      btn.classList.remove('playing');
      return;
    }
    btn.textContent = '■ Stop';
    btn.classList.add('playing');
    startStory(setYearActive, () => {
      btn.textContent = '▶ Play';
      btn.classList.remove('playing');
    });
  });
}

// ── Reset button ──────────────────────────────────────────────────────────────
function bindResetButton() {
  document.getElementById('reset-btn').addEventListener('click', () => {
    stopStory();
    document.getElementById('play-btn').textContent = '▶ Play';
    document.getElementById('play-btn').classList.remove('playing');

    appState.year    = 'all';
    appState.sectors = [];
    setYearUI('all');
    resetFilterUI();
    onFilterChange();

    flyToLatLng(20, 10, 2);
    if (!REDUCED) setTimeout(runEntryAnim, 400);
  });
}

// ── Loading overlay ───────────────────────────────────────────────────────────
function dismissLoading() {
  const overlay = document.getElementById('loading');
  const app     = document.getElementById('app');
  app.style.visibility = 'visible';
  gsap.to(overlay, {
    opacity: 0,
    duration: REDUCED ? 0 : 0.5,
    onComplete() { overlay.style.display = 'none'; runEntryAnim(); },
  });
  if (!REDUCED) gsap.from(app, { opacity: 0, duration: 0.4, delay: 0.1 });
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────
async function init() {
  // Fetch world geometry and aid data in parallel
  const [topoRes, dataRes] = await Promise.all([
    fetch(TOPO_URL),
    fetch(DATA_URL),
  ]);
  const [topo, mapData] = await Promise.all([topoRes.json(), dataRes.json()]);

  // Populate shared state
  appState.mapData = mapData;
  Object.entries(mapData.isoA3ToNum).forEach(([a3, num]) => {
    appState.isoNumToA3[num] = a3;
  });

  // Seed counters so first tween doesn't start from zero
  appState.counters.total = mapData.globalTotals?.all || 0;
  appState.counters.count = mapData.globalCounts?.all || 0;

  // Build map + choropleth layer
  initMap('map');
  initGeoLayer(topojson.feature(topo, topo.objects.countries));

  // Wire up UI
  initFilters({ onFilterChange, onStopPlayback: stopStory });
  buildChart();
  updatePanel();
  initSearch();
  bindPlayButton();
  bindResetButton();

  dismissLoading();
}

init().catch(err => {
  console.error('Init error:', err);
  document.querySelector('.loader-text').textContent =
    'Load failed — run: python -m http.server 8000';
});
