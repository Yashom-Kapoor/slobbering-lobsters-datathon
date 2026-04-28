import { splitWords } from '../utils.js';

/**
 * ScrollTrigger-driven reveals for the capability section:
 * headline word stagger and stats counter stagger.
 * Returns the split cap word elements for reduced-motion cleanup.
 */
export function initCapabilityAnimations() {
  const capEl    = document.getElementById('cap-headline');
  const capWords = splitWords(capEl);

  // Headline word reveal on scroll
  gsap.from(capWords, {
    y: 32, opacity: 0,
    duration: 0.9, ease: 'expo.out', stagger: 0.05,
    scrollTrigger: { trigger: '#capability', start: 'top 68%' },
  });

  // Stat items stagger in
  gsap.to('.stat-item', {
    y: 0, opacity: 1,
    duration: 0.6, ease: 'power2.out', stagger: 0.1,
    scrollTrigger: { trigger: '.stats-row', start: 'top 82%' },
  });

  return capWords;
}
