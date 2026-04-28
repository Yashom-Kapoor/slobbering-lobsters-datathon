Create a modern, minimalist landing page for a brand and user experience innovation studio. The design should feel premium, editorial, and confident — drawing from high-end design agency aesthetics. Use GSAP (with ScrollTrigger, SplitText, and Observer plugins) as the core animation engine.

COLOR PALETTE (use these CSS variables exactly):
:root {
  --bg:      #0f172a;  /* deep slate — primary background */
  --surface: #1e293b;  /* elevated surfaces, section 2 base */
  --border:  #334155;  /* dividers, hairlines */
  --text:    #e2e8f0;  /* primary text */
  --muted:   #94a3b8;  /* nav, labels, secondary copy */
  --accent:  #38bdf8;  /* sky-blue accent for hover states + highlights */
  --c1: #164e63;       /* deepest cyan — gradient anchor */
  --c2: #0e7490;
  --c3: #0891b2;
  --c4: #06b6d4;
  --c5: #67e8f9;       /* brightest cyan — gradient highlights, particles */
}

STRUCTURE (two main sections):

Section 1 — Hero:
- Full-viewport hero with a flowing, silk-like gradient background built from --c1 → --c2 → --c3 → --c4 → --c5, with soft organic folds and highlights (use a layered radial-gradient + conic-gradient or an animated mesh gradient). The lightest cyan (--c5) catches the "light" in the folds; --c1 sits in the shadows
- Top-left: a distinctive wordmark logo using connected/chain-link letterforms (rounded, chunky, futuristic geometric style) in --text
- Top-right: minimal text navigation (Home, Projects, About, Careers) in --muted, hovering to --accent
- Oversized hero headline in a clean grotesque sans-serif (e.g., Helvetica Now, Söhne, Neue Haas Grotesk), set in --text with slight transparency so it blends gently into the silk. Example copy: "[Studio Name] is a brand and user experience innovation company"
- Generous whitespace, no buttons or CTAs — let the typography breathe

Section 2 — Capability statement:
- Background: --bg (#0f172a), the deep slate
- Large headline in --text, left-aligned, e.g., "combining intensive technology with formal design expertise."
- Below the headline: small "Select Clients:" label in --muted, followed by a horizontal row of client logos tinted to --muted (desaturated, monochrome cyan-slate)
- Right side or center-right: a striking 3D particle/point-cloud rendering (Three.js / WebGL) — an abstract human bust or organic form composed of thousands of small particles. Color the particles with a gradient from --c3 to --c5 (cyan glow), with --accent used for occasional brighter "hot" particles. The form floats against the --bg slate, slowly rotating or reacting to cursor movement

GSAP ANIMATION SPEC:

Page load (hero entrance, single timeline):
- SplitText on the hero headline into words/chars, stagger in with y-translate from 40px and opacity 0 → 1, ease "expo.out", stagger 0.04s
- Logo and nav fade/slide in from the top with slight delay, ease "power3.out"
- Animate the silk gradient's highlights using gsap.to() with infinite yoyo on a CSS custom property (--silk-shift) — slow breathing motion, 8–12s duration, shifting the cyan tones (--c2 ↔ --c5) across the surface
- Custom cursor follower (small --accent-tinted circle) tracked with gsap.quickTo() for buttery lag

Scroll (ScrollTrigger):
- As user scrolls from section 1 → section 2, transition the body background from the silk gradient down to --bg using ScrollTrigger with scrub: true (interpolate via a wrapping div or background-color crossfade)
- Pin the hero briefly while the headline scales down and fades, then release into section 2
- In section 2, the capability headline animates in with SplitText reveal when the section enters viewport (start: "top 70%")
- Client logos fade up sequentially with 0.08s stagger, ScrollTrigger-driven
- Three.js particle bust rotates based on scroll progress — wire ScrollTrigger's progress into mesh.rotation.y. Optionally, particle color shifts from --c3 to --c5 across scroll progress for added depth

Interaction:
- GSAP Observer (or matchMedia) handles pointer movement: subtle parallax on the silk background and particle field (mouse X/Y maps to small rotation/translation, eased with gsap.quickTo)
- Nav hover: underline scales from left in --accent using gsap.to() with ease "power2.inOut"
- Link/button hover: cursor follower scales up and brightens toward --c5 with a quick gsap tween

Performance:
- gsap.matchMedia() to disable heavy animations on mobile and respect prefers-reduced-motion
- Wrap ScrollTriggers in a context for clean teardown if used in a framework

DESIGN PRINCIPLES:
- Typography is the hero — oversized, tight tracking, confident, in --text
- Lots of negative space; nothing feels crowded
- Cool monochromatic cyan-slate palette throughout — no warm tones, no pure white, no pure black
- --accent (sky blue) reserved for interactive states and small highlights only
- No drop shadows, no text gradients, no rounded buttons, no stock illustrations
- Mobile-responsive but desktop-first

TECH:
- HTML/CSS/JS (or React). Three.js for the particle visualization. GSAP + ScrollTrigger + SplitText + Observer for motion. Lenis for smooth scroll, synced with ScrollTrigger.