---
name: gsap-timelines
description: Use this skill when sequencing multiple GSAP animations together using timelines. Covers gsap.timeline(), position parameters, labels, nesting, controls, and reusable timeline patterns.
---

# GSAP Timelines

## Why Timelines

Chaining individual tweens with `delay` is fragile — changing one duration breaks every offset after it. Timelines let you sequence animations relative to each other so the whole choreography stays in sync.

## Basic Timeline

```js
const tl = gsap.timeline();

tl.to(".header", { y: 0, opacity: 1, duration: 0.5 })
  .to(".subheader", { y: 0, opacity: 1, duration: 0.4 })
  .to(".cta", { scale: 1, opacity: 1, duration: 0.3 });
```

Each tween starts after the previous one ends by default.

## Position Parameter

The third argument to `.to()`, `.from()`, `.fromTo()` controls when the tween starts on the timeline.

```js
tl.to(a, { x: 100 }, 0)       // absolute: starts at t=0
  .to(b, { x: 100 }, 1.5)     // absolute: starts at t=1.5s
  .to(c, { x: 100 }, "+=0.2") // relative: 0.2s AFTER previous ends
  .to(d, { x: 100 }, "-=0.3") // relative: 0.3s BEFORE previous ends (overlap)
  .to(e, { x: 100 }, "<")     // same start time as previous tween
  .to(f, { x: 100 }, "<0.1")  // 0.1s after previous tween's START
  .to(g, { x: 100 }, ">")     // same as default: after previous tween ends
```

`"<"` is the most useful — it lets you run tweens in parallel without hardcoding times.

## Labels

```js
tl.addLabel("intro")
  .to(".logo", { opacity: 1 })
  .to(".nav", { y: 0 }, "intro+=0.2")  // 0.2s after "intro" label
  .addLabel("content")
  .to(".hero", { opacity: 1 }, "content");
```

Labels make long timelines readable and let you `seek()` to named points.

## Timeline Defaults

Apply shared props to every tween in the timeline:

```js
const tl = gsap.timeline({
  defaults: { duration: 0.6, ease: "power2.out" },
});

tl.from(".a", { opacity: 0 })   // inherits duration + ease
  .from(".b", { y: 30 })        // inherits duration + ease
  .from(".c", { scale: 0.8, duration: 0.3 }); // overrides duration only
```

## Controls

```js
tl.play();
tl.pause();
tl.reverse();
tl.restart();
tl.seek(1.5);         // jump to t=1.5s
tl.seek("content");   // jump to label
tl.timeScale(2);      // play at 2x speed; 0.5 = half speed
tl.progress(0.5);     // jump to 50% through
```

## Callbacks on Timeline

```js
const tl = gsap.timeline({
  onStart: () => console.log("started"),
  onComplete: () => console.log("done"),
  onUpdate: () => console.log(tl.progress()),
});
```

## Nested Timelines

Break complex sequences into reusable functions:

```js
function introAnimation() {
  const tl = gsap.timeline();
  tl.from(".logo", { opacity: 0, duration: 0.4 })
    .from(".tagline", { y: 20, opacity: 0, duration: 0.4 }, "-=0.2");
  return tl;
}

function cardAnimation() {
  const tl = gsap.timeline();
  tl.from(".card", { opacity: 0, stagger: 0.1, duration: 0.5 });
  return tl;
}

// Master timeline composes them
const master = gsap.timeline();
master.add(introAnimation())
      .add(cardAnimation(), "+=0.3");
```

## Repeat & Yoyo on Timeline

```js
const tl = gsap.timeline({ repeat: -1, yoyo: true });
```

## React Pattern

```jsx
useEffect(() => {
  const ctx = gsap.context(() => {
    const tl = gsap.timeline();
    tl.from(".title", { opacity: 0, y: 20 })
      .from(".body",  { opacity: 0, y: 20 }, "-=0.2");
  }, containerRef);
  return () => ctx.revert();
}, []);
```

Always use `gsap.context()` in React to scope cleanup.

## Paused Timelines (trigger on demand)

```js
const tl = gsap.timeline({ paused: true });
tl.to(".menu", { x: 0, duration: 0.4 });

button.addEventListener("click", () => tl.reversed() ? tl.play() : tl.reverse());
```
