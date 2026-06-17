import "server-only";

/**
 * ⚠️  IN-MEMORY RATE LIMITER — DEVELOPMENT / SINGLE-INSTANCE ONLY
 *
 * This store lives in the Node.js process memory. It resets on every deploy,
 * cold start, or server restart, and each serverless function invocation gets
 * its own empty map.
 *
 * **For production on Vercel (serverless) replace with a distributed store:**
 *   - @upstash/ratelimit + @upstash/redis  (recommended, ~5 min setup)
 *   - Vercel KV
 *
 * @see https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
 */

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitStore = Map<string, RateLimitEntry>;

const globalForRateLimit = globalThis as typeof globalThis & {
  __xyncRateLimitStore?: RateLimitStore;
  __xyncRateLimitLastSweep?: number;
};

const SWEEP_INTERVAL_MS = 60_000;

function getStore() {
  if (!globalForRateLimit.__xyncRateLimitStore) {
    globalForRateLimit.__xyncRateLimitStore = new Map();
  }

  return globalForRateLimit.__xyncRateLimitStore;
}

function sweepExpiredEntries(store: RateLimitStore, now: number) {
  const lastSweep = globalForRateLimit.__xyncRateLimitLastSweep ?? 0;

  if (now - lastSweep < SWEEP_INTERVAL_MS) {
    return;
  }

  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }

  globalForRateLimit.__xyncRateLimitLastSweep = now;
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
