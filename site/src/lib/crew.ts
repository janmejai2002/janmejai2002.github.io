/**
 * The crew: five small pieces of pottery who run this site, drawn in code.
 * Each drawing is a thin ink line over a loose wash, built from one body, one
 * mood and one prop, so any character can feel anything. Colours are site
 * tokens, so they re-skin with the theme. Runs at build time.
 *
 * pickCrew() chooses who turns up on a page from what the page is about. Adding
 * a character or a mood here is all it takes for it to be used.
 */

export const WHO = ['tsugi', 'oops', 'kiki', 'fude', 'uso'] as const;
export type Who = (typeof WHO)[number];

export const MOODS = [
  'idle', 'happy', 'proud', 'paint', 'swing', 'panic', 'facepalm', 'sideeye',
  'mindblown', 'shrug', 'sip', 'sleep', 'doubt', 'count', 'scribble', 'listen',
] as const;
export type Mood = (typeof MOODS)[number];

type Pt = [number, number];
interface Body {
  name: string;
  role: string;
  wash: string;
  shape: string;
  pool: string;
  rim?: string;
  behind?: string;
  extra?: string;
  seam: string;
  face: Pt;
  armL: Pt;
  armR: Pt;
  legs: [Pt, Pt];
  foot: number;
}

export const CREW: Record<Who, Body> = {
  tsugi: {
    name: 'Tsugi', role: 'Mends what breaks. Owns the only good brush.', wash: 'mizu',
    shape: 'M31 56C32 49 98 49 99 56C102 83 88 106 65 106C42 106 28 83 31 56Z',
    pool: 'M37 86C50 104 80 104 93 86C86 101 76 106 65 106C54 106 44 101 37 86Z',
    rim: 'M31 56C46 65 84 65 99 56',
    extra: 'M54 106L54 110L76 110L76 106',
    seam: 'M92 60L86 69L93 77L85 88L83 98',
    face: [62, 80], armL: [33, 80], armR: [97, 80], legs: [[55, 110], [75, 110]], foot: 126,
  },
  oops: {
    name: 'Oops', role: 'The reason there is a repair team.', wash: 'hanko',
    shape: 'M40 50L52 50L57 60L63 50L92 50C95 72 92 96 85 108L45 108C38 96 37 72 40 50Z',
    pool: 'M42 92C52 106 78 106 88 92C87 100 86 104 85 108L45 108C44 104 43 100 42 92Z',
    seam: 'M57 60L54 66L58 71',
    face: [65, 80], armL: [40, 80], armR: [91, 80], legs: [[54, 108], [76, 108]], foot: 126,
  },
  kiki: {
    name: 'Kiki', role: 'Listens to the whole internet so nobody else has to.', wash: 'moss',
    shape: 'M56 22C56 18 74 18 74 22L72 44C97 56 99 92 83 110L47 110C31 92 33 56 58 44Z',
    pool: 'M38 92C50 108 80 108 92 92C90 100 87 106 83 110L47 110C43 106 40 100 38 92Z',
    rim: 'M57 32C62 35 68 35 73 32',
    seam: 'M86 60L83 69L90 77L85 90',
    face: [65, 78], armL: [37, 80], armR: [93, 80], legs: [[55, 110], [75, 110]], foot: 126,
  },
  fude: {
    name: 'Fude', role: 'Writes first, asks later. Mostly ink.', wash: 'indigo',
    shape: 'M38 56C38 49 92 49 92 56L97 104C97 112 33 112 33 104Z',
    pool: 'M35 90C50 104 80 104 95 90L97 104C97 112 33 112 33 104Z',
    rim: 'M38 56C50 63 80 63 92 56',
    behind: 'M84 52L100 14M100 14C105 10 110 12 109 18C108 23 103 22 100 14',
    seam: 'M46 62L42 72L49 80L44 92',
    face: [65, 82], armL: [36, 84], armR: [95, 84], legs: [[55, 110], [75, 110]], foot: 126,
  },
  uso: {
    name: 'Uso', role: 'Can smell a made-up number from three tabs away.', wash: 'plum',
    shape: 'M36 80C36 52 96 52 96 80C96 110 36 110 36 80Z',
    pool: 'M40 94C52 110 80 110 92 94C84 104 76 108 66 108C56 108 48 104 40 94Z',
    rim: 'M50 57C56 45 76 45 82 57',
    behind: 'M95 68C114 62 116 98 93 94',
    extra: 'M38 74C25 72 18 60 8 56L11 52C24 54 32 62 40 66M66 46m-3.5 0a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0 -7 0',
    seam: 'M88 68L84 75L91 83L85 95',
    face: [66, 78], armL: [38, 88], armR: [94, 88], legs: [[56, 107], [76, 107]], foot: 126,
  },
};

const eyes = (kind: string) => {
  const dots = (a: number, b: number, r = 2.1) => `<circle class="k" cx="${a}" cy="0" r="${r}"/><circle class="k" cx="${b}" cy="0" r="${r}"/>`;
  switch (kind) {
    case 'happy': return '<path d="M-14 1q3.5-6 7 0M7 1q3.5-6 7 0"/>';
    case 'wide': return '<circle cx="-10" r="5"/><circle cx="10" r="5"/><circle class="k" cx="-10" r="1.4"/><circle class="k" cx="10" r="1.4"/>';
    case 'side': return `${dots(-7, 13)}<path d="M-14-4h9M6-4h9"/>`;
    case 'shut': return '<path d="M-14 0h8M6 0h8"/>';
    case 'squint': return '<path d="M-15 0h9"/><circle cx="10" r="3.6"/><circle class="k" cx="10.6" r="1.4"/>';
    case 'focus': return `${dots(-10, 10, 1.9)}<path d="M-14-5l7 2M14-5l-7 2"/>`;
    case 'spiral': return '<path d="M-10 0a2 2 0 1 1 2.6 2a4 4 0 1 1 -6-3M10 0a2 2 0 1 0 -2.6 2a4 4 0 1 0 6-3"/>';
    default: return dots(-10, 10);
  }
};
const mouth = (kind: string) => {
  switch (kind) {
    case 'smile': return '<path d="M-5 0q5 5.5 10 0"/>';
    case 'grin': return '<path class="f" d="M-7-1q7 10 14 0z"/>';
    case 'smirk': return '<path d="M-5 1q6 2.5 10-3"/>';
    case 'o': return '<circle r="3.1"/>';
    case 'flat': return '<path d="M-4 0h8"/>';
    case 'wobble': return '<path d="M-7 0q1.8-3.5 3.5 0t3.5 0t3.5 0t3.5 0"/>';
    case 'sip': return '';
    default: return '<path d="M-2 0h4"/>';
  }
};

/** Elbows bow outward, so the arms read as limbs rather than wires. */
const arm = ([sx, sy]: Pt, [hx, hy]: Pt, bow: number) => {
  const mx = (sx + hx) / 2 + bow;
  const my = (sy + hy) / 2 + 5;
  return `<path d="M${sx} ${sy}Q${mx} ${my} ${hx} ${hy}"/>`;
};

type Hands = (b: Body) => [Pt, Pt];
const POSE: Record<string, Hands> = {
  rest: (b) => [[b.armL[0] - 9, b.armL[1] + 19], [b.armR[0] + 9, b.armR[1] + 19]],
  up: (b) => [[b.armL[0] - 13, b.armL[1] - 34], [b.armR[0] + 13, b.armR[1] - 34]],
  shrug: (b) => [[b.armL[0] - 20, b.armL[1] - 12], [b.armR[0] + 20, b.armR[1] - 12]],
  hip: (b) => [[b.armL[0] - 9, b.armL[1] + 19], [b.armR[0] - 4, b.armR[1] + 14]],
  hold: (b) => [[b.armL[0] - 9, b.armL[1] + 19], [b.armR[0] + 15, b.armR[1] - 16]],
  face: (b) => [[b.face[0] - 7, b.face[1] + 1], [b.armR[0] + 9, b.armR[1] + 19]],
  cup: (b) => [[b.face[0] - 9, b.face[1] + 18], [b.face[0] + 9, b.face[1] + 18]],
  chin: (b) => [[b.armL[0] - 9, b.armL[1] + 19], [b.face[0] + 15, b.face[1] + 13]],
};

const PROPS: Record<string, (x: number, y: number) => string> = {
  brush: (x, y) => `<g class="crew-prop" style="transform-origin:${x}px ${y}px"><path d="M${x} ${y}L${x + 9} ${y - 26}"/><path class="gold" d="M${x + 7} ${y - 25}c-2-7 1-11 6-13c1 6 1 11-2 14z"/></g>`,
  hammer: (x, y) => `<g class="crew-prop" style="transform-origin:${x}px ${y}px"><path d="M${x} ${y + 4}L${x + 3} ${y - 28}"/><path class="wash-ink" d="M${x - 10} ${y - 38}l24 2l-1.2 11l-24-2z"/></g>`,
  glass: (x, y) => `<g class="crew-prop"><path d="M${x} ${y}L${x + 7} ${y - 11}"/><circle class="glass" cx="${x + 13}" cy="${y - 21}" r="11"/></g>`,
  pen: (x, y) => `<g class="crew-prop" style="transform-origin:${x}px ${y}px"><path d="M${x + 3} ${y - 14}L${x - 3} ${y + 10}"/><path d="M${x + 3} ${y - 14}l4 1"/></g>`,
  horn: (x, y) => `<g class="crew-prop"><path d="M${x - 2} ${y}C${x + 4} ${y - 8} ${x + 10} ${y - 13} ${x + 20} ${y - 15}L${x + 22} ${y + 2}C${x + 12} ${y + 2} ${x + 5} ${y + 2} ${x - 2} ${y}Z"/></g>`,
  coins: (x, y) => `<g class="crew-prop"><ellipse class="gold" cx="${x + 2}" cy="${y - 2}" rx="8" ry="3"/><ellipse class="gold" cx="${x + 2}" cy="${y - 7}" rx="8" ry="3"/><ellipse class="gold" cx="${x + 2}" cy="${y - 12}" rx="8" ry="3"/></g>`,
  mug: (x, y) => `<g class="crew-prop"><path class="wash-ink" d="M${x - 8} ${y - 11}h16l-1.5 13h-13z"/><path d="M${x - 2} ${y - 17}q2-3 0-6M${x + 4} ${y - 17}q2-3 0-6"/></g>`,
};

const EXTRAS: Record<string, (b: Body) => string> = {
  sweat: (b) => `<path class="drop" d="M${b.face[0] + 29} ${b.face[1] - 27}c-5 7-2 11 1 11s6-4-1-11zM${b.face[0] - 33} ${b.face[1] - 20}c-3 5-1 8 1 8s4-3-1-8z"/>`,
  spark: (b) => `<path class="gold-line" d="M${b.face[0] - 40} ${b.face[1] - 42}l-5-7M${b.face[0]} ${b.face[1] - 46}v-9M${b.face[0] + 40} ${b.face[1] - 42}l5-7"/>`,
  boom: (b) => `<path class="gold-line" d="M${b.face[0] - 24} ${b.face[1] - 32}l-7-11M${b.face[0] - 8} ${b.face[1] - 38}l-3-13M${b.face[0] + 8} ${b.face[1] - 38}l3-13M${b.face[0] + 24} ${b.face[1] - 32}l7-11"/>`,
  zzz: (b) => `<text class="crew-note" x="${b.face[0] + 30}" y="${b.face[1] - 32}">z</text><text class="crew-note big" x="${b.face[0] + 39}" y="${b.face[1] - 42}">z</text>`,
  ask: (b) => `<text class="crew-note big" x="${b.face[0] - 44}" y="${b.face[1] - 28}">?</text>`,
};

const MOOD_DEF: Record<Mood, { eyes: string; mouth: string; pose: string; prop?: string; extra?: string; at?: 'r' | 'cup' | 'face' }> = {
  idle: { eyes: 'dot', mouth: 'smile', pose: 'rest' },
  happy: { eyes: 'happy', mouth: 'grin', pose: 'up', extra: 'spark' },
  proud: { eyes: 'happy', mouth: 'smirk', pose: 'hold', prop: 'brush' },
  paint: { eyes: 'focus', mouth: 'tiny', pose: 'hold', prop: 'brush' },
  swing: { eyes: 'focus', mouth: 'grin', pose: 'hold', prop: 'hammer' },
  panic: { eyes: 'wide', mouth: 'wobble', pose: 'up', extra: 'sweat' },
  facepalm: { eyes: 'shut', mouth: 'flat', pose: 'face' },
  sideeye: { eyes: 'side', mouth: 'flat', pose: 'rest' },
  mindblown: { eyes: 'spiral', mouth: 'o', pose: 'up', extra: 'boom' },
  shrug: { eyes: 'side', mouth: 'smirk', pose: 'shrug', extra: 'ask' },
  sip: { eyes: 'shut', mouth: 'sip', pose: 'cup', prop: 'mug', at: 'cup' },
  sleep: { eyes: 'shut', mouth: 'tiny', pose: 'rest', extra: 'zzz' },
  doubt: { eyes: 'squint', mouth: 'smirk', pose: 'hold', prop: 'glass' },
  count: { eyes: 'focus', mouth: 'flat', pose: 'hold', prop: 'coins' },
  scribble: { eyes: 'focus', mouth: 'tiny', pose: 'chin', prop: 'pen' },
  listen: { eyes: 'dot', mouth: 'o', pose: 'hold', prop: 'horn' },
};

/** The inner markup of one character. Wrap it in <svg viewBox={CREW_VIEW}>. */
export const CREW_VIEW = '-6 -6 142 142';
export function drawCrew(who: Who, mood: Mood): string {
  const b = CREW[who];
  const m = MOOD_DEF[mood];
  const [hl, hr] = POSE[m.pose](b);
  const leg = ([x, y]: Pt, dir: number) => `<path d="M${x} ${y}L${x + dir} ${b.foot - 3}L${x + dir * 3.4} ${b.foot - 2}"/>`;
  const propAt: Pt = m.at === 'cup' ? [b.face[0], b.face[1] + 17] : hr;
  const [fx, fy] = b.face;
  return [
    `<g class="crew-wash wash-${b.wash}"><path d="${b.shape}" transform="translate(1.6 1.8)"/></g>`,
    `<g class="crew-pool wash-${b.wash}"><path d="${b.pool}"/></g>`,
    `<g class="crew-ink">`,
    b.behind ? `<path d="${b.behind}"/>` : '',
    `<path d="${b.shape}"/>`,
    b.rim ? `<path d="${b.rim}"/>` : '',
    b.extra ? `<path d="${b.extra}"/>` : '',
    `<path class="gold-seam" d="${b.seam}"/>`,
    leg(b.legs[0], -3),
    leg(b.legs[1], 3),
    arm(b.armL, hl, -7),
    arm(b.armR, hr, 7),
    `<g transform="translate(${fx} ${fy})">${eyes(m.eyes)}</g>`,
    `<g transform="translate(${fx} ${fy + 11})">${mouth(m.mouth)}</g>`,
    m.prop ? PROPS[m.prop](propAt[0], propAt[1]) : '',
    m.extra ? EXTRAS[m.extra](b) : '',
    `</g>`,
  ].join('');
}

/* ---------- who turns up where ---------- */

export interface Casting {
  who: Who;
  mood: Mood;
  line: string;
}

interface Rule extends Omit<Casting, 'line'> {
  match: RegExp;
  lines: string[];
}

/** First words are the signal. A topic that hits several rules goes to the one it hits hardest. */
const RULES: Rule[] = [
  { match: /\b(fail\w*|wrong|broke\w*|bug\w*|incident|rogue|delet\w*|deprecat\w*|trap|doom|walkback|rehir\w*|cancel\w*)\b/gi, who: 'oops', mood: 'panic', lines: ['In my defence, it was like that when I got here.', 'That one was load-bearing, apparently.', 'I would like to speak to no one about this.'] },
  { match: /\b(claim\w*|hype|verif\w*|graded|autopsy|honest\w*|actually|really|measur\w*|percent|washing|95%)\b/gi, who: 'uso', mood: 'doubt', lines: ['Source?', 'Smells like a press release.', 'Let me just hold this up to the light.'] },
  { match: /\b(cost\w*|pric\w*|token\w*|billing|budget|margin\w*|econom\w*|roi|money|sav\w+)\b/gi, who: 'kiki', mood: 'count', lines: ['Who approved this invoice?', 'I counted twice. It got worse.', 'Somebody left the meter running.'] },
  { match: /\b(secur\w*|jailbreak|injection|complian\w*|regulat\w*|law|act|rules|legal|takedown|cert-in)\b/gi, who: 'uso', mood: 'sideeye', lines: ['Legal is typing…', 'I saw nothing. In writing.', 'This is fine, said no auditor.'] },
  { match: /\b(memor\w*|context|cach\w*|forget\w*|window|prefix)\b/gi, who: 'kiki', mood: 'sleep', lines: ['Sorry, what were we doing?', 'I had this a minute ago.', 'Remind me who I am again?'] },
  { match: /\b(agent\w*|autonom\w*|harness|skills?|routine\w*|scheduled|protocol|mcp|a2a)\b/gi, who: 'fude', mood: 'scribble', lines: ['Nobody told me to stop.', 'I wrote this while you were asleep.', 'Technically, I was supervised.'] },
  { match: /\b(model\w*|benchmark\w*|gpu|latency|bandwidth|fine-tun\w*|vision|inference|eeg|attention)\b/gi, who: 'fude', mood: 'mindblown', lines: ['There were numbers. So many numbers.', 'I read the appendix. Pray for me.', 'It gets weirder past page nine.'] },
  { match: /\b(what is|what a|explain\w*|basics?|why does|why ai|temperature|how)\b/gi, who: 'tsugi', mood: 'happy', lines: ['Small words. Big cracks.', 'Sit down, this one is gentle.', 'No homework, I promise.'] },
];

const FALLBACK: Record<string, Casting> = {
  technical: { who: 'fude', mood: 'scribble', line: 'Nobody told me to stop.' },
  business: { who: 'uso', mood: 'doubt', line: 'Source?' },
  basics: { who: 'tsugi', mood: 'happy', line: 'Small words. Big cracks.' },
  'case-studies': { who: 'uso', mood: 'doubt', line: 'Let me just hold this up to the light.' },
  talks: { who: 'kiki', mood: 'listen', line: 'I listened so you can skim.' },
};

const hash = (s: string) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7) >>> 0;

export function pickCrew(page: { slug: string; title: string; question?: string; keywords?: string[]; track: string }): Casting {
  // The title and question say what a piece is about; keywords only back them up.
  const lead = `${page.title} ${page.question ?? ''}`;
  const tags = (page.keywords ?? []).join(' ');
  const scored = RULES.map((rule) => ({
    rule,
    score: (lead.match(rule.match)?.length ?? 0) * 3 + (tags.match(rule.match)?.length ?? 0),
  }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
  if (!scored.length) return FALLBACK[page.track] ?? FALLBACK.technical;
  // Near-ties rotate by slug, so a run of similar pieces does not get one face.
  const top = scored.filter((r) => r.score >= scored[0].score - 1);
  const { rule } = top[hash(page.slug) % top.length];
  return { who: rule.who, mood: rule.mood, line: rule.lines[hash(`${page.slug}!`) % rule.lines.length] };
}
