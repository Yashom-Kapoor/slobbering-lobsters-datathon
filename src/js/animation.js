import { appState }          from './state.js';
import { geoLayer }          from './map.js';
import { REDUCED, MACRO_ORDER, STORY_YEARS } from './config.js';

// ── Entry choreography ────────────────────────────────────────────────────────
/**
 * Stagger all country paths onto the map, grouped by macro-region.
 * Called once after the choropleth layer is ready.
 */
export function runEntryAnim() {
  if (REDUCED || !geoLayer) return;

  const byMacro = {};
  geoLayer.eachLayer(layer => {
    if (!layer._iso) return;
    let macro = appState.mapData?.byCountry[layer._iso]?.regionMacro || 'Other';
    if (macro.includes(';')) macro = macro.split(';')[0].trim();
    (byMacro[macro] = byMacro[macro] || []).push(layer._path);
  });

  MACRO_ORDER.forEach((macro, i) => {
    const paths = (byMacro[macro] || []).filter(Boolean);
    if (!paths.length) return;
    gsap.from(paths, {
      opacity: 0,
      duration: 0.65,
      ease: 'power2.out',
      stagger: 0.02,
      delay: i * 0.28,
    });
  });

  // anything not in the ordered list
  const remainder = (byMacro['Other'] || []).filter(Boolean);
  if (remainder.length) gsap.from(remainder, { opacity: 0, duration: 0.5, ease: 'power2.out', delay: 1.6 });
}

// ── Storytelling playback ─────────────────────────────────────────────────────
let storyTimeline = null;

/**
 * Start the year-by-year story animation.
 * @param {function} setYearActive  - callback(yr) that updates state + UI + map
 * @param {function} onComplete     - called when the last year finishes
 * @returns {function} stop         - cancels playback
 */
export function startStory(setYearActive, onComplete) {
  if (storyTimeline) stopStory();

  storyTimeline = gsap.timeline({ onComplete: () => { storyTimeline = null; onComplete(); } });
  STORY_YEARS.forEach((yr, i) => storyTimeline.call(() => setYearActive(yr), [], i * 2.2));

  return stopStory;
}

export function stopStory() {
  if (storyTimeline) { storyTimeline.kill(); storyTimeline = null; }
}

export function isPlaying() {
  return storyTimeline !== null;
}
