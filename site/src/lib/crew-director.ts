/**
 * The crew director: decides whether a character may speak right now.
 *
 * The crew react to things that are true about the reader: they broke a claim,
 * they mended it, they skimmed, they came back, they finished. Each of those is
 * a "moment". The director's only job is restraint. It answers one question,
 * "may this moment get a line?", and it says no far more often than yes:
 *
 *  - one voice at a time, with a quiet gap between lines;
 *  - a small budget of lines per page view;
 *  - a moment marked `once` happens once per page view;
 *  - nothing ever happens on a timer by itself. No input, no line.
 *
 * Pure and DOM-free, so it can be tested in plain Node
 * (see site/scripts/test-crew.mjs).
 */

export interface MomentRule {
  /** Only ever once per page view. */
  once?: boolean;
  /** Minimum time before this same moment may speak again. */
  cooldownMs?: number;
  /** Speaks even inside the global quiet gap, and outside the budget. */
  priority?: boolean;
}

export interface DirectorOptions {
  /** Quiet time between any two lines. */
  gapMs?: number;
  /** Lines allowed per page view, not counting priority moments. */
  budget?: number;
  rules?: Record<string, MomentRule>;
}

export interface Director {
  /** True, and records the line, if `moment` may speak at `now`. */
  take(moment: string, now: number): boolean;
  /** Lines spoken so far, for tests and debugging. */
  spoken(): { moment: string; at: number }[];
}

export function createDirector(opts: DirectorOptions = {}): Director {
  const gap = opts.gapMs ?? 14000;
  const budget = opts.budget ?? 3;
  const rules = opts.rules ?? {};
  const log: { moment: string; at: number }[] = [];
  const last = new Map<string, number>();
  let lastAny = -Infinity;
  let used = 0;

  return {
    take(moment, now) {
      const rule = rules[moment] ?? {};
      const prev = last.get(moment);
      if (rule.once && prev !== undefined) return false;
      if (prev !== undefined && now - prev < (rule.cooldownMs ?? 0)) return false;
      if (!rule.priority) {
        if (now - lastAny < gap) return false;
        if (used >= budget) return false;
        used++;
      }
      last.set(moment, now);
      lastAny = now;
      log.push({ moment, at: now });
      return true;
    },
    spoken: () => log.slice(),
  };
}

/** Fill {n}-style holes. Unknown holes are left visible, so a typo shows up in review. */
export function fill(line: string, vars: Record<string, string | number> = {}): string {
  return line.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

/** A stable choice, so the same reader sees the same line for the same thing. */
export function choose<T>(items: readonly T[], seed: string): T {
  let h = 7;
  for (const c of seed) h = (Math.imul(h, 31) + c.charCodeAt(0)) | 0;
  return items[(h >>> 0) % items.length];
}
