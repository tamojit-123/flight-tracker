const requests = new Map();

export const rateLimiter = {
  check(ip) {
    const now = Date.now();
    const windowMs = 60_000;
    const max = 20;
    const entry = requests.get(ip) ?? { count: 0, resetAt: now + windowMs };
    if (now > entry.resetAt) {
      entry.count = 0;
      entry.resetAt = now + windowMs;
    }
    entry.count++;
    requests.set(ip, entry);
    if (requests.size > 10_000) {
      const oldest = [...requests.entries()].sort((a, b) => a[1].resetAt - b[1].resetAt)[0][0];
      requests.delete(oldest);
    }
    return entry.count <= max;
  },

  getStatus(ip) {
    const entry = requests.get(ip);
    if (!entry) return { remaining: 20, resetAt: null };
    const now = Date.now();
    if (now > entry.resetAt) return { remaining: 20, resetAt: null };
    return {
      remaining: Math.max(0, 20 - entry.count),
      resetAt: entry.resetAt,
    };
  },

  clear() {
    requests.clear();
  },
};