I have a dataset I'd like you to turn into an interactive, animated map application using GSAP for motion design.

Before building, please:
1. Inspect the dataset and identify columns containing geographic information (lat/lng, addresses, country/region names, place names, postal codes, etc.) and any other dimensions worth surfacing (categories, dates, numeric values, status fields).
2. Note the row count, value distributions, and any data quality issues (missing coords, inconsistent formats, outliers).
3. Briefly tell me your plan before coding — what map library, what GSAP techniques, and what design choices fit this specific data.

Then build a single interactive map artifact with:

**Core map**
- Base map with appropriate zoom level and bounds fitted to my data
- Markers, clusters, choropleth, or heatmap — pick what suits the density and type of data, and explain why
- Click/hover popups showing the relevant fields per record (curated, not all fields)

**Controls (only the ones that make sense for this data)**
- Search by name/keyword
- Filter by category, date range, or numeric thresholds (sliders for numbers, multi-selects for categories)
- Toggle layers if there are natural groupings
- Reset view button

**Insight panel**
- Sidebar or collapsible panel with summary stats that update as filters change
- One small chart tied to the filtered set if a meaningful breakdown exists
- Legend that reflects the current encoding

**GSAP animation layer — this is a first-class requirement, not decoration**
Load GSAP from CDN (https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js) plus any plugins you need (ScrollTrigger, Flip, MotionPath, CustomEase). Use GSAP for:

- *Entry choreography*: stagger markers/regions onto the map on load with a meaningful order (e.g., chronological, by magnitude, geographic sweep) — not random. Use `gsap.from` with stagger and an ease that fits the dataset's tone.
- *Filter transitions*: when filters change, animate markers entering/exiting and the insight panel's numbers tweening to new values (use `gsap.to` on a counter object, not instant swaps). Use the Flip plugin if list items in the sidebar reorder.
- *Hover/focus micro-interactions*: marker scale, glow, or pulse on hover; popup entrance with a subtle ease (avoid linear and avoid bounce unless the data is playful).
- *Camera moves*: when a user clicks a record or a filter narrows results dramatically, animate the map's pan/zoom with GSAP driving the map library's setView (use an onUpdate tick rather than the library's built-in flyTo, so timing stays consistent with the rest of the motion).
- *Storytelling mode (if the data supports it)*: a "Play" button that runs a GSAP timeline walking through the data — e.g., chronologically advancing through time, or touring top records — with synchronized panel updates.

Motion principles to follow:
- Durations 0.3–0.8s for UI, up to 1.5s for camera moves. Nothing should feel sluggish.
- Use `power2.out` or `power3.out` as defaults; reserve `back` and `elastic` for moments that earn it.
- Respect `prefers-reduced-motion` — wrap animations so they collapse to instant state changes when the user has that preference set.
- Animations should clarify state changes, not obscure them. If an animation makes the app feel slower, cut it.

**Polish**
- Loading state if the dataset is large (animate it in with GSAP too)
- Mobile-reasonable layout
- Clean typography and a coherent color palette — no default Leaflet/Mapbox chrome if avoidable

**Constraints**
- Single self-contained file, no API keys (OpenStreetMap tiles or similar)
- Handle missing/malformed geo data gracefully — log skipped rows, don't crash
- If the dataset is too large for smooth rendering, downsample with a note
- Kill/overwrite tweens on rapid filter changes so animations don't pile up (`overwrite: 'auto'` or explicit `gsap.killTweensOf`)

Ask clarifying questions only if something is genuinely ambiguous about what to highlight. Otherwise, make defensible choices and ship it.