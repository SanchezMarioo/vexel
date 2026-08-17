import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * ✅ DISTRIBUTED RATE LIMITER — PRODUCTION READY (VERCEL SERVERLESS)
 *
 * Uses Upstash Redis as a distributed store so rate limits are enforced
 * consistently across all serverless function invocations.
 *
 * Required environment variables:
 *   - UPSTASH_REDIS_REST_URL
 *   - UPSTASH_REDIS_REST_TOKEN
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

/**
 * Fallback in-memory rate limiter for development when Upstash is not configured.
 */
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

/**
 * Distributed rate limiter using Upstash Redis.
 * Falls back to in-memory if environment variables are not configured.
 */
const ratelimit =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(5, "60 m"),
        prefix: "xync:ratelimit",
      })
    : null;

export async function checkRateLimitUpstash(identifier: string): Promise<RateLimitResult> {
  // Fallback to in-memory if Upstash is not configured (development)
  if (!ratelimit) {
    console.warn("[rate-limit] Upstash not configured, falling back to in-memory");
    return checkRateLimit({
      bucket: "fallback",
      key: identifier,
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });
  }

  const { success, limit, reset, remaining } = await ratelimit.limit(identifier);
  return {
    ok: success,
    remaining,
    resetAt: reset,
  };
}
