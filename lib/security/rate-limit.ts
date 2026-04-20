import "server-only";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitStore = Map<string, RateLimitEntry>;

const globalForRateLimit = globalThis as typeof globalThis & {
  __vexelRateLimitStore?: RateLimitStore;
  __vexelRateLimitLastSweep?: number;
};

const SWEEP_INTERVAL_MS = 60_000;

function getStore() {
  if (!globalForRateLimit.__vexelRateLimitStore) {
    globalForRateLimit.__vexelRateLimitStore = new Map();
  }

  return globalForRateLimit.__vexelRateLimitStore;
}

function sweepExpiredEntries(store: RateLimitStore, now: number) {
  const lastSweep = globalForRateLimit.__vexelRateLimitLastSweep ?? 0;

  if (now - lastSweep < SWEEP_INTERVAL_MS) {
    return;
  }

  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }

  globalForRateLimit.__vexelRateLimitLastSweep = now;
}

export interface RateLimitInput {
  bucket: string;
  key: string;
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(input: RateLimitInput): RateLimitResult {
  const now = Date.now();
  const store = getStore();
  const bucketKey = `${input.bucket}:${input.key}`;

  sweepExpiredEntries(store, now);

  const existing = store.get(bucketKey);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + input.windowMs;
    store.set(bucketKey, { count: 1, resetAt });

    return {
      ok: true,
      remaining: Math.max(0, input.limit - 1),
      resetAt,
    };
  }

  existing.count += 1;
  store.set(bucketKey, existing);

  return {
    ok: existing.count <= input.limit,
    remaining: Math.max(0, input.limit - existing.count),
    resetAt: existing.resetAt,
  };
}
