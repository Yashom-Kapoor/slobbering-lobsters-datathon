import { appState }                              from './state.js';
import { countryTotal, globalTotal, globalCount,
         topCountries, maxVal, fmtM }            from './data.js';
import { hexLerp }                               from './colors.js';
import { flyToIso }                              from './map.js';
import { REDUCED }                               from './config.js';

let sectorChart = null;

// ── Stats counters (tweened with GSAP) ────────────────────────────────────────
function tweenStats() {
  const newTotal = globalTotal();
  const newCount = globalCount();
  const totalEl  = document.getElementById('total-val');
  const countEl  = document.getElementById('count-val');

  gsap.to(appState.counters, {
    total: newTotal,
    duration: REDUCED ? 0 : 0.6, ease: 'power2.out', overwrite: 'auto',
    onUpdate() { totalEl.textContent = fmtM(appState.counters.total); },
  });

  if (newCount != null) {
    gsap.to(appState.counters, {
      count: newCount,
      duration: REDUCED ? 0 : 0.6, ease: 'power2.out', overwrite: 'auto',
      onUpdate() { countEl.textContent = Math.round(appState.counters.count).toLocaleString(); },
    });
  } else {
    countEl.textContent = '—';
  }
}

// ── Sector bar chart ──────────────────────────────────────────────────────────
export function buildChart() {
  const ctx = document.getElementById('sector-chart').getContext('2d');
  sectorChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [{ data: [], backgroundColor: '#0891b2', borderRadius: 3 }],
    },
    options: {
      indexAxis: 'y',
      animation: { duration: REDUCED ? 0 : 350 },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => ' ' + fmtM(c.parsed.x) } },
      },
      scales: {
        x: { display: false },
        y: { ticks: { color: '#94a3b8', font: { size: 9 } }, grid: { display: false } },
      },
      responsive: true, maintainAspectRatio: false,
    },
  });
}

function updateChart() {
  const gs = appState.mapData?.globalSectors[appState.year] || {};
  let entries = Object.entries(gs).sort((a, b) => b[1] - a[1]).slice(0, 7);
  if (appState.sectors.length) entries = entries.filter(([k]) => appState.sectors.includes(k));
  const mx = Math.max(...entries.map(([, v]) => v), 1);

  sectorChart.data.labels                      = entries.map(([k]) => k.length > 24 ? k.slice(0, 24) + '…' : k);
  sectorChart.data.datasets[0].data            = entries.map(([, v]) => v);
  sectorChart.data.datasets[0].backgroundColor = entries.map(([, v]) =>
    hexLerp('#164e63', '#38bdf8', Math.log10(v + 1) / Math.log10(mx + 1))
  );
  sectorChart.update();
}

// ── Top-recipients list (GSAP Flip for reorder) ───────────────────────────────
function updateTopList() {
  const list    = document.getElementById('country-list');
  const entries = topCountries(10);
  const maxV    = entries[0]?.[1] || 1;

  const flipState = Flip.getState('.cli');

  // Remove items that dropped out of the top 10
  list.querySelectorAll('.cli').forEach(el => {
    if (!entries.find(([iso]) => iso === el.dataset.flipId)) {
      gsap.to(el, { opacity: 0, x: -8, duration: 0.2, onComplete: () => el.remove() });
    }
  });

  entries.forEach(([iso, val], i) => {
    const pct      = Math.max(4, (val / maxV) * 100);
    const existing = list.querySelector(`[data-flip-id="${iso}"]`);
    if (existing) {
      existing.querySelector('.cli-rank').textContent = i + 1;
      existing.querySelector('.cli-bar').style.width  = pct + '%';
      existing.querySelector('.cli-val').textContent  = fmtM(val);
      list.appendChild(existing); // move to new position for Flip
    } else {
      const li = buildListItem(iso, val, i, pct);
      list.appendChild(li);
      gsap.to(li, { opacity: 1, duration: 0.3, delay: i * 0.04 });
    }
  });

  if (!REDUCED) Flip.from(flipState, { duration: 0.4, ease: 'power1.inOut', stagger: 0.02 });
}

function buildListItem(iso, val, rank, pct) {
  const li = document.createElement('li');
  li.className     = 'cli';
  li.dataset.flipId = iso;
  li.style.opacity = '0';
  li.innerHTML = `
    <span class="cli-rank">${rank + 1}</span>
    <span class="cli-name">${appState.mapData.byCountry[iso]?.name || iso}</span>
    <div class="cli-bar-wrap"><div class="cli-bar" style="width:${pct}%"></div></div>
    <span class="cli-val">${fmtM(val)}</span>`;
  li.addEventListener('click', () => flyToIso(iso));
  return li;
}

// ── Legend ────────────────────────────────────────────────────────────────────
function updateLegend() {
  const mx = maxVal();
  document.getElementById('leg-min').textContent = mx > 0 ? fmtM(mx * 0.001) : '—';
  document.getElementById('leg-max').textContent = mx > 0 ? fmtM(mx) : '—';
}

// ── Public update entry point ─────────────────────────────────────────────────
export function updatePanel() {
  tweenStats();
  updateChart();
  updateTopList();
  updateLegend();
}
