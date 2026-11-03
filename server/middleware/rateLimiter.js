// One bounded fixed-window store per middleware instance.
export function createRateLimiter({
  max,
  windowMs = 60_000,
  message = 'Too many requests. Please try again later.',
}) {
  const buckets = new Map();
  let nextCleanup = 0;
  return (req, res, next) => {
    const now = Date.now();
    if (now >= nextCleanup) {
      for (const [ip, bucket] of buckets)
        if (bucket.end <= now) buckets.delete(ip);
      nextCleanup = now + Math.min(windowMs, 60_000);
    }
    const ip = req.ip || req.socket.remoteAddress;
    let bucket = buckets.get(ip);
    if (!bucket || bucket.end <= now) {
      if (!bucket && buckets.size >= 10_000)
        return res
          .status(429)
          .set('Retry-After', '60')
          .json({ error: message });
      bucket = { count: 0, end: now + windowMs };
      buckets.set(ip, bucket);
    }
    if (bucket.count >= max)
      return res
        .status(429)
        .set('Retry-After', String(Math.ceil((bucket.end - now) / 1000)))
        .json({ code: 'RATE_LIMITED', error: message });
    bucket.count++;
    next();
  };
}
