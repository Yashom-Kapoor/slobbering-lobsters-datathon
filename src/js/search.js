import { appState } from './state.js';
import { flyToIso } from './map.js';

export function initSearch() {
  const input   = document.getElementById('search');
  const results = document.getElementById('search-results');

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    results.innerHTML = '';
    if (!q) { results.style.display = 'none'; return; }

    const hits = Object.entries(appState.mapData?.byCountry || {})
      .filter(([, d]) => d.name.toLowerCase().includes(q))
      .slice(0, 6);

    if (!hits.length) { results.style.display = 'none'; return; }

    hits.forEach(([iso, d]) => {
      const div = document.createElement('div');
      div.className   = 'search-item';
      div.textContent = d.name;
      div.addEventListener('mousedown', () => {
        input.value          = d.name;
        results.style.display = 'none';
        flyToIso(iso);
      });
      results.appendChild(div);
    });

    results.style.display = 'block';
  });

  input.addEventListener('blur', () => {
    setTimeout(() => (results.style.display = 'none'), 160);
  });
}
