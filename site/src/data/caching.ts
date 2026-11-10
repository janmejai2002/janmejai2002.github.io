/** Prompt caching arithmetic, shared by the calculator's server and browser code. */
export type CacheInputs = {
  prefix: number;
  fresh: number;
  output: number;
  calls: number;
  runs: number;
  inPrice: number;
  outPrice: number;
  write: number;
  read: number;
};

export const DEFAULTS: CacheInputs = {
  prefix: 20000,
  fresh: 500,
  output: 800,
  calls: 5,
  runs: 24,
  inPrice: 3,
  outPrice: 15,
  write: 1.25,
  read: 0.1,
};

export function compute(v: CacheInputs) {
  const m = 1_000_000;
  const outputCost = (v.calls * v.output * v.outPrice) / m;
  const freshCost = (v.calls * v.fresh * v.inPrice) / m;
  const uncached = (v.calls * v.prefix * v.inPrice) / m + freshCost + outputCost;
  const cached =
    (v.prefix * v.inPrice * (v.write + Math.max(v.calls - 1, 0) * v.read)) / m + freshCost + outputCost;
  // Smallest whole number of calls where write + (n-1)*read < n.
  const breakEven = v.read < 1 ? Math.floor((v.write - v.read) / (1 - v.read)) + 1 : null;
  const monthly = 30 * v.runs;
  return {
    uncachedRun: uncached,
    cachedRun: cached,
    uncachedMonth: uncached * monthly,
    cachedMonth: cached * monthly,
    saved: (uncached - cached) * monthly,
    pct: uncached > 0 ? ((uncached - cached) / uncached) * 100 : 0,
    breakEven,
  };
}

export const money = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
