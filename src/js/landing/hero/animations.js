import { splitWords } from '../utils.js';

/**
 * Page-load entrance timeline, silk blob breathing,
 * mouse parallax on blobs, and hero ScrollTrigger pin.
 * Returns the split hero word elements for reduced-motion cleanup.
 */
export function initHeroAnimations() {
  const headline  = document.getElementById('hero-headline');
  const heroWords = splitWords(headline);

  // Initial positions — set before the timeline so gsap.to has a defined start
  gsap.set('#logo',      { y: -16 });
  gsap.set('#nav-links', { y: -12 });

  // Entrance timeline
  gsap.timeline({ defaults: { ease: 'expo.out' } })
    .to('#logo',      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, 0.2)
    .to('#nav-links', { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, 0.3)
    .from(heroWords,  { y: 48, opacity: 0, duration: 1.1, stagger: 0.04 },     0.5)
    .to('#cta',       { opacity: 1, duration: 0.6, ease: 'power2.out' },        1.2);

  // Silk blob slow breathing
  gsap.to('#blob1', { x: '18%',  y: '-14%', duration: 11, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  gsap.to('#blob2', { x: '-13%', y: '20%',  duration: 14, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 3 });
  gsap.to('#blob3', { x: '10%',  y: '-18%', duration:  9, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 6 });

  // Mouse parallax (desktop only)
  if (window.innerWidth > 768) {
    const blobParX1 = gsap.quickTo('#blob1', 'x', { duration: 1.8, ease: 'power1' });
    const blobParY1 = gsap.quickTo('#blob1', 'y', { duration: 1.8, ease: 'power1' });
    const blobParX2 = gsap.quickTo('#blob2', 'x', { duration: 2.2, ease: 'power1' });
    const blobParY2 = gsap.quickTo('#blob2', 'y', { duration: 2.2, ease: 'power1' });

    window.addEventListener('mousemove', e => {
      const mx = (e.clientX / window.innerWidth  - 0.5) * 40;
      const my = (e.clientY / window.innerHeight - 0.5) * 30;
      blobParX1(mx);   blobParY1(my);
      blobParX2(-mx);  blobParY2(-my);
    });
  }

  // ScrollTrigger: pin hero and fade content on scroll out
  ScrollTrigger.create({
    trigger: '#hero',
    start: 'top top',
    end: '+=35%',
    pin: true,
    pinSpacing: false,
    onUpdate(self) {
      gsap.set('#hero-content', {
        scale:   1 - self.progress * 0.04,
        opacity: 1 - self.progress * 0.75,
      });
    },
  });

  return heroWords;
}
