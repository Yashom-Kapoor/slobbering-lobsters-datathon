// Single shared mutable state object — mutated in-place so all modules
// always read the current value without needing re-imports.
export const appState = {
  mapData:    null,   // set once after fetch
  isoNumToA3: {},     // numeric id → ISO A3, built from mapData
  year:       'all',  // current year filter
  sectors:    [],     // active sector filter (empty = all)
  cachedMax:  {},     // memoised maxVal results, cleared on filter change
  counters:   { total: 0, count: 0 }, // GSAP tween targets for stat display
};
