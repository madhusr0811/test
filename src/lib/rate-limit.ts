// In-memory limiter (single server process). Moves to the database later if needed.
const hits = new Map<string, { count: number; reset: number }>();
const MAX = 5, WINDOW = 15 * 60 * 1000;

export function checkLimit(ip: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const e = hits.get(ip);
  if (!e || e.reset < now) return { allowed: true, retryAfter: 0 };
  return { allowed: e.count < MAX, retryAfter: Math.ceil((e.reset - now) / 1000) };
}
export function recordFailure(ip: string) {
  const now = Date.now();
  const e = hits.get(ip);
  if (!e || e.reset < now) hits.set(ip, { count: 1, reset: now + WINDOW });
  else e.count++;
}
export function clearFailures(ip: string) { hits.delete(ip); }
