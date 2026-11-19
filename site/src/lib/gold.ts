/**
 * The site's gold. One material, written once, used by every surface that
 * renders it live: the hero plate (scripts/kintsugi.ts) and the archive bowl's
 * seams (scripts/bowl-gold.ts). Change it here and both change together.
 *
 * It is kinpun maki-e: gold powder brushed into lacquer along a join. The bead
 * of the seam is brighter at its crown than at its edges, and the brushing runs
 * along the seam, so a seam lying across the light glints and one pointing at
 * it goes dull. That is what makes it read as metal and not as yellow paint.
 *
 * Small static marks (the crew's own seams, the minibowl, icons) cannot run a
 * shader. They use flat gold tokens (var(--gold), var(--ochre)), close to the base of this
 * material, so the two agree in colour. See docs/DESIGN-SYSTEM.md, "Gold".
 */

/**
 * GLSL ES 3.00. Paste into a fragment shader with `${GOLD_GLSL}`.
 *
 *   kinGold(au, t, along, toL, fall)
 *     au    base gold, from goldBase(var(--gold))
 *     t     0 at the seam's crown, 1 at its edge
 *     along unit vector along the seam, in the same plane units as toL
 *     toL   vector from this point to the light
 *     fall  light falloff at this point, 0..1
 *
 *   kinGoldG(au, t, along, toL, fall, gain)
 *     The same, with the glint's strength given. Wide seams under a near light
 *     (the bowl) need less than the hero's 1.85, or they burn out to white.
 *
 *   kinMolten(au, along_pos, time)
 *     The bright running gold of a seam still being filled. Add it, scaled by
 *     how freshly this part of the seam was poured.
 */
export const GOLD_GLSL = `
vec3 kinGoldG(vec3 au, float t, vec2 along, vec2 toL, float fall, float gain){
  float crown = 1. - t * t;
  vec3 HG = normalize(normalize(vec3(toL, .3)) + vec3(0, 0, 1));
  vec3 tangent = normalize(vec3(along, .12));
  float dotTH = dot(tangent, HG);
  float sinTH = sqrt(max(0., 1. - dotTH * dotTH));
  float glint = pow(sinTH, 28.) * (fall * .8 + .2);
  return au * (.58 + .58 * crown) + vec3(1., .92, .64) * glint * gain;
}
// The hero's gold: thin seams on a dark plate, lit from a little way off.
vec3 kinGold(vec3 au, float t, vec2 along, vec2 toL, float fall){
  return kinGoldG(au, t, along, toL, fall, 1.85);
}
vec3 kinMolten(vec3 au, float pos, float time){
  float flow = sin(pos - time * 7.) * .5 + .5;
  return vec3(1., .82, .46) * (.7 + 1.1 * flow);
}
`;

/** Light falloff the material expects, for a light `d2` (squared distance) away. */
export const GOLD_FALL_GLSL = `float kinFall(vec2 toL){ return 1. / (1. + 2.2 * dot(toL, toL)); }`;

/** The gold base, from the --gold token (global.css), lifted the way metal reads brighter than pigment. */
export function goldBase(rgb: [number, number, number]): [number, number, number] {
  return [Math.min(1, rgb[0] * 1.2), Math.min(1, rgb[1] * 1.14), Math.min(1, rgb[2] * 0.92)];
}

/** Read a CSS colour (hex or rgb()) into 0..1 floats. */
export function cssRgb(value: string): [number, number, number] {
  const s = value.trim();
  const hex = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const h = hex[1].length === 3 ? [...hex[1]].map((c) => c + c).join('') : hex[1];
    const n = parseInt(h, 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }
  const m = s.match(/[\d.]+/g);
  if (m && m.length >= 3) return [+m[0] / 255, +m[1] / 255, +m[2] / 255];
  return [0.78, 0.6, 0.25];
}

/**
 * Any CSS colour, including var() and color-mix(), as 0..1 rgb. Custom
 * properties hand back their text, not a colour, so the browser is asked to
 * compute it on a throwaway element inside `host` (where the tokens apply).
 */
export function resolveColor(host: Element, value: string): [number, number, number] {
  const probe = document.createElement('i');
  probe.style.cssText = `position:absolute;width:0;height:0;visibility:hidden;color:${value}`;
  host.append(probe);
  const c = getComputedStyle(probe).color;
  probe.remove();
  const srgb = c.match(/color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
  if (srgb) return [+srgb[1], +srgb[2], +srgb[3]];
  return cssRgb(c);
}
