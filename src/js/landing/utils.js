/** Wraps each word in an inline span so GSAP can stagger them individually. */
export function splitWords(el) {
  el.innerHTML = el.textContent.trim().split(/\s+/)
    .map(w => `<span style="display:inline-block">${w}</span>`)
    .join(' ');
  return Array.from(el.querySelectorAll('span'));
}
