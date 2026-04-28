---
name: gsap-animations
description: Use this skill when writing GSAP animations. Covers tweens, easing, staggering, callbacks, and performance best practices.
---

# GSAP Animations

## Setup

```js
import gsap from "gsap";
```

Or via CDN:
```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
```

## Core Tweens

```js
// gsap.to — animate FROM current state TO target
gsap.to(".box", { x: 200, duration: 1 });

// gsap.from — animate FROM target TO current state
gsap.from(".box", { opacity: 0, y: -50, duration: 0.6 });

// gsap.fromTo — explicit start and end
gsap.fromTo(".box", { opacity: 0 }, { opacity: 1, duration: 0.8 });

// gsap.set — instant, no animation
gsap.set(".box", { x: 100, opacity: 0 });
```

## Common Properties

| Property | Effect |
|---|---|
| `x`, `y` | translate (px or %) — prefer over `left`/`top` |
| `xPercent`, `yPercent` | translate as % of element size |
| `scale`, `scaleX`, `scaleY` | scale transform |
| `rotation` | degrees |
| `opacity` | 0–1 |
| `autoAlpha` | opacity + visibility (0 hides from a11y tree) |
| `width`, `height` | layout dims — triggers reflow, use sparingly |
| `backgroundColor`, `color` | color interpolation |

## Easing

```js
gsap.to(".box", { x: 300, ease: "power2.out" });
```

Common eases:
- `"none"` / `"linear"` — constant speed
- `"power1/2/3/4.out"` — decelerate (most natural for UI entrances)
- `"power1/2/3/4.in"` — accelerate (exits)
- `"power1/2/3/4.inOut"` — both ends
- `"back.out(1.7)"` — overshoot, good for bouncy entrances
- `"elastic.out(1, 0.3)"` — springy
- `"bounce.out"` — physical bounce
- `"expo.out"` — very fast then slow, dramatic

Use `.out` for entrances, `.in` for exits, `.inOut` for transitions between states.

## Stagger

```js
// Animate multiple elements with offset between each
gsap.from(".card", {
  opacity: 0,
  y: 30,
  duration: 0.5,
  stagger: 0.1,       // 0.1s between each element
});

// Advanced stagger
gsap.from(".card", {
  opacity: 0,
  stagger: {
    amount: 0.6,      // total time spread across all elements
    from: "center",   // start from center outward
    ease: "power1.inOut",
  },
});
```

`from` options: `"start"` (default), `"end"`, `"center"`, `"edges"`, `"random"`, or an index number.

## Callbacks

```js
gsap.to(".box", {
  x: 200,
  onStart: () => console.log("started"),
  onUpdate: () => console.log("updating"),
  onComplete: () => console.log("done"),
});
```

## Targeting Elements

```js
gsap.to(".class", { ... });          // CSS selector
gsap.to("#id", { ... });
gsap.to(ref.current, { ... });       // DOM node (preferred in React)
gsap.to([el1, el2], { ... });        // array of nodes
gsap.to("li", { stagger: 0.05 });    // NodeList via selector
```

## Repeat & Yoyo

```js
gsap.to(".box", {
  x: 200,
  repeat: 3,       // repeat 3 more times (total 4 plays); -1 = infinite
  yoyo: true,      // reverse on alternate plays
  repeatDelay: 0.5,
});
```

## Performance Tips

- Animate `transform` properties (`x`, `y`, `scale`, `rotation`) and `opacity` — these run on the GPU compositor and don't trigger layout.
- Avoid animating `width`, `height`, `top`, `left`, `margin`, `padding` — these cause reflow.
- Use `will-change: transform` on elements that animate frequently, but remove it after animation to free memory.
- Prefer `autoAlpha` over `opacity` when showing/hiding elements — it also toggles `visibility: hidden` so hidden elements don't block pointer events.
- Use `gsap.set()` to snap to a starting state before animating to avoid FOUC.
- Call `tween.kill()` on unmount in React/Vue to prevent memory leaks.

## React Pattern

```jsx
import { useEffect, useRef } from "react";
import gsap from "gsap";

function Box() {
  const el = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(el.current, { opacity: 0, y: 20, duration: 0.6 });
    });
    return () => ctx.revert(); // cleanup on unmount
  }, []);

  return <div ref={el} className="box" />;
}
```

`gsap.context()` scopes all tweens/timelines so `.revert()` cleans them all up at once.
