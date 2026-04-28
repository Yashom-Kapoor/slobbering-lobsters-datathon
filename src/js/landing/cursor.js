export function initCursor() {
  const cursor  = document.getElementById('cursor');
  const cursorX = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3' });
  const cursorY = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3' });

  window.addEventListener('mousemove', e => {
    cursorX(e.clientX);
    cursorY(e.clientY);
    gsap.to(cursor, { opacity: 1, duration: 0.3 });
  });

  window.addEventListener('mouseleave', () =>
    gsap.to(cursor, { opacity: 0, duration: 0.3 })
  );

  // Scale up on interactive elements
  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () =>
      gsap.to(cursor, { scale: 2.5, background: 'var(--c5)', duration: 0.2 })
    );
    el.addEventListener('mouseleave', () =>
      gsap.to(cursor, { scale: 1, background: 'var(--accent)', duration: 0.2 })
    );
  });
}
