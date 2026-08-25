/**
 * Deterministic fallback artwork, so no article can ever ship bare.
 *
 * The real path is a routine that reads the article and draws its argument
 * (see docs/ARTWORK.md); this exists for the article whose routine artwork is
 * missing or invalid at publish time. It composes an on-spec plate — paper
 * ground, ink geometry, one accent, exactly one deliberate imperfection, the
 * grain overlay — seeded from the slug, so every run of the publish poll
 * regenerates byte-identical output and the PR branch stays stable.
 *
 * It cannot mean anything, and that is the accepted cost: it is a placeholder
 * that is never wrong, standing in for artwork that is sometimes late.
 */

// Accent by track, mirroring docs/ARTWORK.md and the TRACK map in Post.astro.
const ACCENT = {
  technical: 'mizu',
  business: 'ochre',
  basics: 'plum',
  'case-studies': 'moss',
  talks: 'hanko',
};

/** FNV-1a, then a small xorshift PRNG — stable across platforms and runs. */
function rng(seedString) {
  let h = 0x811c9dc5;
  for (const ch of seedString) {
    h ^= ch.codePointAt(0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  let s = h || 1;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 0xffffffff;
  };
}

const GRAIN = `<filter id="grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/>
  </filter>`;

/**
 * Motif: a regular grid of small circles with one position left as a dashed
 * outline in the accent. Alt text describes what is drawn, per the spec.
 */
function motifGrid(rand, accent) {
  const cols = 8 + Math.floor(rand() * 3); // 8-10
  const rows = 4 + Math.floor(rand() * 2); // 4-5
  const gapX = 96;
  const gapY = 104;
  const x0 = 800 - ((cols - 1) * gapX) / 2;
  const y0 = 450 - ((rows - 1) * gapY) / 2;
  const missCol = 1 + Math.floor(rand() * (cols - 2));
  const missRow = 1 + Math.floor(rand() * (rows - 2));

  const marks = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = x0 + c * gapX;
      const cy = y0 + r * gapY;
      if (c === missCol && r === missRow) {
        marks.push(
          `<circle cx="${cx}" cy="${cy}" r="17" fill="none" stroke="{{${accent}}}" stroke-width="3" stroke-dasharray="6 7"/>`
        );
      } else {
        marks.push(`<circle cx="${cx}" cy="${cy}" r="12" fill="{{ink}}" opacity="0.82"/>`);
      }
    }
  }
  return {
    body: `<g>${marks.join('')}</g>`,
    alt: `A regular grid of ${cols} by ${rows} small ink circles on a paper ground. One position in the grid is not filled in — it is drawn only as a dashed outlined circle in a single accent colour.`,
  };
}

/** Motif: a stack of hairline rules; one rule is broken and offset. */
function motifRules(rand, accent) {
  const n = 11 + Math.floor(rand() * 4); // 11-14
  const gap = 44;
  const y0 = 450 - ((n - 1) * gap) / 2;
  const x1 = 360;
  const x2 = 1240;
  const broken = 2 + Math.floor(rand() * (n - 4));
  const lines = [];
  for (let i = 0; i < n; i++) {
    const y = y0 + i * gap;
    if (i === broken) {
      const bx = 620 + rand() * 300;
      lines.push(`<line x1="${x1}" y1="${y}" x2="${bx.toFixed(0)}" y2="${y}" stroke="{{ink}}" stroke-width="3"/>`);
      lines.push(
        `<line x1="${(bx + 90).toFixed(0)}" y1="${y + 14}" x2="${x2}" y2="${y + 14}" stroke="{{${accent}}}" stroke-width="3"/>`
      );
    } else {
      lines.push(`<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="{{ink}}" stroke-width="3" opacity="0.75"/>`);
    }
  }
  return {
    body: `<g>${lines.join('')}</g>`,
    alt: `A stack of ${n} thin horizontal rules of equal length, like lines of text. One rule is interrupted mid-way, and its continuation is shifted slightly downward and drawn in a single accent colour.`,
  };
}

/** Motif: concentric rings; the outermost is an arc that does not close. */
function motifRings(rand, accent) {
  const rings = 4 + Math.floor(rand() * 2); // 4-5
  const step = 62;
  const parts = [];
  for (let i = 0; i < rings - 1; i++) {
    parts.push(
      `<circle cx="800" cy="450" r="${90 + i * step}" fill="none" stroke="{{ink}}" stroke-width="3" opacity="${(0.8 - i * 0.12).toFixed(2)}"/>`
    );
  }
  const r = 90 + (rings - 1) * step;
  // An arc from the top, sweeping most of the way round and stopping short.
  const sweepDeg = 285 + rand() * 40; // 285-325 of 360
  const a = ((sweepDeg - 90) * Math.PI) / 180;
  const ex = 800 + r * Math.cos(a);
  const ey = 450 + r * Math.sin(a);
  parts.push(
    `<path d="M 800 ${450 - r} A ${r} ${r} 0 1 1 ${ex.toFixed(1)} ${ey.toFixed(1)}" fill="none" stroke="{{${accent}}}" stroke-width="10" stroke-linecap="butt"/>`
  );
  return {
    body: `<g>${parts.join('')}</g>`,
    alt: `${rings} concentric circles drawn in thin ink lines on a paper ground. The outermost circle is drawn in a single accent colour and does not close — it stops short, leaving a gap.`,
  };
}

/** Motif: a row of upright rectangles; one leans out of alignment. */
function motifColumns(rand, accent) {
  const n = 7 + Math.floor(rand() * 3); // 7-9
  const w = 58;
  const h = 300;
  const gap = 66;
  const x0 = 800 - ((n - 1) * (w + gap)) / 2 - w / 2;
  const leaning = 1 + Math.floor(rand() * (n - 2));
  const tilt = 7 + rand() * 5;
  const parts = [];
  for (let i = 0; i < n; i++) {
    const x = x0 + i * (w + gap);
    if (i === leaning) {
      parts.push(
        `<rect x="${x}" y="${450 - h / 2}" width="${w}" height="${h}" fill="none" stroke="{{${accent}}}" stroke-width="4" transform="rotate(${tilt.toFixed(1)} ${x + w / 2} ${450 + h / 2})"/>`
      );
    } else {
      parts.push(`<rect x="${x}" y="${450 - h / 2}" width="${w}" height="${h}" fill="none" stroke="{{ink}}" stroke-width="3" opacity="0.8"/>`);
    }
  }
  return {
    body: `<g>${parts.join('')}</g>`,
    alt: `A row of ${n} identical upright rectangles standing like columns. One rectangle leans out of alignment and is drawn in a single accent colour; the rest are upright ink outlines.`,
  };
}

const MOTIFS = [motifGrid, motifRules, motifRings, motifColumns];

/**
 * @param {string} slug
 * @param {string} track  one of the five track ids
 * @returns {{svg: string, alt: string}}
 */
export function fallbackArt(slug, track) {
  const accent = ACCENT[track] ?? 'mizu';
  const rand = rng(slug);
  const motif = MOTIFS[Math.floor(rand() * MOTIFS.length)];
  const { body, alt } = motif(rand, accent);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900" role="img">
  ${GRAIN}
  <rect width="1600" height="900" fill="{{paper}}"/>
  ${body}
  <rect width="1600" height="900" filter="url(#grain)" opacity="0.055"/>
</svg>
`;
  return { svg, alt };
}
