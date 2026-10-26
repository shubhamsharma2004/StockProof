// Tiny in-memory TTL cache. On a long-running dev/preview server it lives
// for the process; on serverless hosts it lives for a warm instance — either
// way it only saves upstream calls, it's never the source of truth.
const store = new Map();

export async function cached(key, ttlMs, load) {
  const hit = store.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.value;
  const value = await load();
  store.set(key, { value, at: Date.now() });
  return value;
}

// Last successful value regardless of age — used to serve stale-but-real
// data when the live source is briefly unreachable.
export function lastKnown(key) {
  return store.get(key)?.value;
}

export function forget(key) {
  store.delete(key);
}
