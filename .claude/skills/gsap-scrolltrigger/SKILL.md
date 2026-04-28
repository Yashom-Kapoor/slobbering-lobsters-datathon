---
name: gsap-scrolltrigger
description: Use this skill when building scroll-driven animations with GSAP's ScrollTrigger plugin. Covers pinning, scrubbing, snap, parallax, batch, horizontal scroll, and performance.
---

# GSAP ScrollTrigger

## Setup

```js
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
```

CDN:
```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
```

## Basic Scroll-Triggered Animation

```js
gsap.from(".box", {
  opacity: 0,
  y: 60,
  duration: 0.8,
  scrollTrigger: {
    trigger: ".box",   // element that fires the animation
    start: "top 80%",  // when top of trigger hits 80% down the viewport
    end: "bottom 20%",
    toggleActions: "play none none reverse",
  },
});
```

## start / end Syntax

`"<triggerEdge> <viewportEdge>"`

Trigger edges: `top`, `center`, `bottom`, or a pixel/percent offset  
Viewport edges: `top`, `center`, `bottom`, or a percent (`80%` = 80% from top)

```js
start: "top center"    // trigger's top hits viewport center
start: "top 80%"       // trigger's top is 80% down the viewport
start: "top+=100 top"  // 100px below trigger's top hits viewport top
```

## toggleActions

Four values: `onEnter onLeave onEnterBack onLeaveBack`

Options per event: `"play"`, `"pause"`, `"resume"`, `"reverse"`, `"restart"`, `"reset"`, `"complete"`, `"none"`

```js
toggleActions: "play none none reverse"   // play on enter, reverse when scrolling back up
toggleActions: "play pause resume reverse" // full control
toggleActions: "restart none none none"    // restart every time you enter
```

## Scrub (Scroll-Linked)

Ties animation progress directly to scroll position:

```js
gsap.to(".parallax", {
  y: -200,
  scrollTrigger: {
    trigger: ".section",
    start: "top bottom",
    end: "bottom top",
    scrub: true,    // instantly follows scroll
    // scrub: 1,    // 1s lag/smoothing — more cinematic
  },
});
```

## Pinning

Pins an element in place while the rest of the page scrolls (creates scroll distance):

```js
ScrollTrigger.create({
  trigger: ".panel",
  start: "top top",
  end: "+=500",       // pin for 500px of scroll
  pin: true,
  pinSpacing: true,   // adds space below pinned element (default true)
});
```

## Snap

```js
ScrollTrigger.create({
  trigger: ".container",
  start: "top top",
  end: "bottom bottom",
  snap: {
    snapTo: 1 / 4,      // snap to every 25% of progress
    duration: 0.3,
    ease: "power1.inOut",
  },
});

// Snap to labels in a timeline
const tl = gsap.timeline({ scrollTrigger: { ... } });
tl.addLabel("section1", 0)
  .addLabel("section2", 0.33)
  .addLabel("section3", 0.66);

ScrollTrigger.create({
  snap: { snapTo: "labels", duration: 0.5 },
});
```

## Scrubbed Timeline (common pattern)

```js
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".section",
    start: "top top",
    end: "+=1000",
    scrub: 1,
    pin: true,
  },
});

tl.from(".title", { opacity: 0, y: 50 })
  .from(".image", { scale: 0.8, opacity: 0 }, "<")
  .to(".overlay", { opacity: 0.5 });
```

## Markers (debugging)

```js
scrollTrigger: {
  markers: true,  // shows start/end lines in browser — remove before shipping
}
```

## Callbacks

```js
scrollTrigger: {
  onEnter: (self) => console.log("entered"),
  onLeave: (self) => console.log("left"),
  onEnterBack: (self) => console.log("scrolled back in"),
  onLeaveBack: (self) => console.log("scrolled back past start"),
  onUpdate: (self) => console.log(self.progress, self.direction, self.velocity),
  onToggle: (self) => console.log("active:", self.isActive),
}
```

## Batch (animate many elements as they enter viewport)

```js
ScrollTrigger.batch(".card", {
  onEnter: (elements) => gsap.from(elements, {
    opacity: 0,
    y: 40,
    stagger: 0.1,
    duration: 0.6,
  }),
  start: "top 85%",
  once: true,   // only animate once, not on re-enter
});
```

## Horizontal Scroll

```js
const sections = gsap.utils.toArray(".panel");

gsap.to(sections, {
  xPercent: -100 * (sections.length - 1),
  ease: "none",
  scrollTrigger: {
    trigger: ".horizontal-container",
    pin: true,
    scrub: 1,
    end: () => "+=" + document.querySelector(".horizontal-container").offsetWidth,
  },
});
```

## Refresh on Resize

ScrollTrigger recalculates positions on window resize automatically. Force a recalc:

```js
ScrollTrigger.refresh();
```

Call after dynamic content loads (e.g., images finishing load, fonts).

## React Cleanup

```jsx
useEffect(() => {
  const ctx = gsap.context(() => {
    gsap.from(".card", {
      opacity: 0,
      y: 50,
      scrollTrigger: { trigger: ".card", start: "top 80%" },
    });
  }, containerRef);
  return () => ctx.revert(); // kills ScrollTriggers too
}, []);
```

## Performance Tips

- Use `scrub` with transforms (`x`, `y`, `scale`, `rotation`) and `opacity` only.
- Add `will-change: transform` to elements that scrub — remove after animation completes.
- Avoid triggering layout (no `width`/`height`/`top` on scrubbed elements).
- Call `ScrollTrigger.refresh()` after fonts/images load to fix position calculations.
- Use `once: true` in `ScrollTrigger.batch()` for one-shot entrance animations to avoid unnecessary recalculation.
- On mobile, `scrub` animations can feel janky — consider `toggleActions` instead, or increase `scrub` lag value.
