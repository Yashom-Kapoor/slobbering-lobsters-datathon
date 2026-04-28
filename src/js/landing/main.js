import { initCursor }              from './cursor.js';
import { initNav }                  from './hero/nav.js';
import { initHeroAnimations }       from './hero/animations.js';
import { initCapabilityAnimations } from './capability/animations.js';
import { initGlobe }                from './capability/globe.js';

gsap.registerPlugin(ScrollTrigger, Observer);

// ── Lenis smooth scroll synced with ScrollTrigger ─────────────────────────────
const lenis = new Lenis();
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(t => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

// ── Section initialisation ────────────────────────────────────────────────────
initCursor();
initNav();
const heroWords = initHeroAnimations();
const capWords  = initCapabilityAnimations();
initGlobe();

// ── Reduced motion: collapse all animations to instant state changes ──────────
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  gsap.globalTimeline.timeScale(0);
  gsap.set([...heroWords, ...capWords, '.stat-item'], { clearProps: 'all' });
  gsap.set(['#logo', '#nav-links', '#cta'], { clearProps: 'all' });
}
