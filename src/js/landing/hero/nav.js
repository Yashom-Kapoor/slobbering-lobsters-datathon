/** Animates the accent underline on nav links — scales in from left on hover. */
export function initNav() {
  document.querySelectorAll('#nav-links a').forEach(link => {
    const line = link.querySelector('.underline');
    link.addEventListener('mouseenter', () =>
      gsap.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 0.28, ease: 'power2.inOut' })
    );
    link.addEventListener('mouseleave', () =>
      gsap.to(line, { scaleX: 0, duration: 0.2, ease: 'power2.in' })
    );
  });
}
