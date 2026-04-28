import { COLOR_PALETTE, NO_DATA_COLOR } from './config.js';

function hexLerp(a, b, t) {
  const ah = parseInt(a.slice(1), 16);
  const bh = parseInt(b.slice(1), 16);
  const r  = Math.round(((ah >> 16) & 0xff) + (((bh >> 16) & 0xff) - ((ah >> 16) & 0xff)) * t);
  const g  = Math.round(((ah >>  8) & 0xff) + (((bh >>  8) & 0xff) - ((ah >>  8) & 0xff)) * t);
  const bl = Math.round( (ah        & 0xff) + ( (bh        & 0xff) -  (ah        & 0xff)) * t);
  return '#' + [r, g, bl].map(x => x.toString(16).padStart(2, '0')).join('');
}

/** Map a numeric value to a choropleth fill color using a log scale. */
export function colorFor(val, maxVal) {
  if (!val || val <= 0 || !maxVal) return NO_DATA_COLOR;
  const t   = Math.log10(val + 1) / Math.log10(maxVal + 1);
  const seg = Math.min(Math.floor(t * (COLOR_PALETTE.length - 1)), COLOR_PALETTE.length - 2);
  return hexLerp(COLOR_PALETTE[seg], COLOR_PALETTE[seg + 1], t * (COLOR_PALETTE.length - 1) - seg);
}

export { hexLerp };
