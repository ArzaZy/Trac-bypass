import "server-only";

// In-memory limiter. On serverless platforms each instance has its own memory,
// so this is best-effort. For strict global limits use a shared store (e.g. Upstash Redis).
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;

const hits = new Map<string, { count: number; reset: number }>();
const inflight = new Set<string>();

export function rateLimit(key: string): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
  }
  const entry = hits.get(key);
  if (!entry || entry.reset < now) {
    hits.set(key, { count: 1, reset: now + WINDOW_MS });
    return { ok: true, retryAfter: 0 };
  }
  if (entry.count >= MAX_PER_WINDOW) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((entry.reset - now) / 1000)) };
  }
  entry.count += 1;
  return { ok: true, retryAfter: 0 };
}

/** One in-flight request per client: prevents double processing from repeated clicks. */
export function acquire(key: string): boolean {
  if (inflight.has(key)) return false;
  inflight.add(key);
  return true;
}

export function release(key: string) {
  inflight.delete(key);
}
