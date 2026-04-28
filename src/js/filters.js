import { appState } from './state.js';

// Callbacks injected from main.js to avoid circular imports
let _onFilterChange = () => {};
let _onStopPlayback = () => {};

/**
 * Wire up year buttons and sector dropdown.
 * @param {object} callbacks
 * @param {function} callbacks.onFilterChange  - called when any filter changes
 * @param {function} callbacks.onStopPlayback  - called before a manual year change
 */
export function initFilters({ onFilterChange, onStopPlayback }) {
  _onFilterChange = onFilterChange;
  _onStopPlayback = onStopPlayback;
  bindYearButtons();
  buildSectorDropdown();
}

// ── Year pills ────────────────────────────────────────────────────────────────
function bindYearButtons() {
  document.querySelectorAll('.yr-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      _onStopPlayback();
      setYearUI(btn.dataset.yr);
      appState.year = btn.dataset.yr;
      _onFilterChange();
    });
  });
}

/** Update the active year pill without triggering onFilterChange. Used by storytelling. */
export function setYearUI(yr) {
  document.querySelectorAll('.yr-btn').forEach(b => b.classList.toggle('active', b.dataset.yr === yr));
}

// ── Sector multi-select dropdown ──────────────────────────────────────────────
function buildSectorDropdown() {
  const drop = document.getElementById('sector-cs-drop');

  appState.mapData.sectors.slice(0, 20).forEach(sec => {
    const div = document.createElement('div');
    div.className = 'cs-opt';
    div.innerHTML = `<input type="checkbox" value="${sec.replace(/"/g, '&quot;')}"/><span>${sec}</span>`;
    div.querySelector('input').addEventListener('change', onSectorChange);
    drop.appendChild(div);
  });

  const clear = document.createElement('div');
  clear.className   = 'cs-clear';
  clear.textContent = 'Clear all';
  clear.addEventListener('click', () => {
    drop.querySelectorAll('input').forEach(cb => (cb.checked = false));
    appState.sectors = [];
    updateSectorLabel();
    _onFilterChange();
  });
  drop.appendChild(clear);

  // Toggle open/close
  const btn  = document.getElementById('sector-cs-btn');
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const open = drop.classList.toggle('open');
    btn.classList.toggle('open', open);
  });
  document.addEventListener('click', () => {
    drop.classList.remove('open');
    btn.classList.remove('open');
  });
}

function onSectorChange() {
  appState.sectors = [...document.querySelectorAll('#sector-cs-drop input:checked')]
    .map(cb => cb.value);
  updateSectorLabel();
  _onFilterChange();
}

function updateSectorLabel() {
  const n = appState.sectors.length;
  document.getElementById('sector-cs-label').textContent =
    n ? `${n} sector${n > 1 ? 's' : ''}` : 'All Sectors';
}

/** Reset all filter controls to their default visual state. */
export function resetFilterUI() {
  document.querySelectorAll('#sector-cs-drop input').forEach(cb => (cb.checked = false));
  updateSectorLabel();
}
