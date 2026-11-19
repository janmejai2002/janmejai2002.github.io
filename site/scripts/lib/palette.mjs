/**
 * The two artwork palettes, mirroring the tokens in src/styles/global.css.
 * Shared by scripts/make-images.mjs (hero art) and src/lib/share-card.ts
 * (social cards), so a palette change is made once.
 */
export const PALETTE = {
  light: {
    paper: '#F6F4EF', paper2: '#EFEBE3', ink: '#1A2639', border: '#DCD4C7',
    card: '#EDE9E0', mizu: '#00A9B8', hanko: '#D2543F', moss: '#6E8C63',
    ochre: '#C2913A', plum: '#8A6690', indigo: '#4E6E9C',
  },
  dark: {
    paper: '#15181D', paper2: '#1B1F26', ink: '#E9E5DC', border: '#2E343D',
    card: '#1C2129', mizu: '#4ECDD8', hanko: '#E87A64', moss: '#9BBA8E',
    ochre: '#DDB667', plum: '#B694BC', indigo: '#85A5D0',
  },
};

/** Substitute {{token}} placeholders. `overrides` swaps single tokens, e.g. the
 *  paper ground for the colour of the surface the art will sit on. */
export function paint(svg, theme, overrides = {}) {
  const p = { ...PALETTE[theme], ...overrides };
  const out = svg.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!(key in p)) throw new Error(`unknown palette token {{${key}}}`);
    return p[key];
  });
  const leftover = out.match(/\{\{\w+\}\}/);
  if (leftover) throw new Error(`unsubstituted token ${leftover[0]}`);
  return out;
}
