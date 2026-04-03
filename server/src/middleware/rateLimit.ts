import { NextFunction, Request, Response } from "express";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitEntry>();

function getWindowMs(): number {
  const parsed = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60000);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 60000;
}

function getMaxRequests(): number {
  const parsed = Number(process.env.RATE_LIMIT_MAX ?? 100);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 100;
}

function getIp(req: Request): string {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (Array.isArray(forwardedFor)) {
    return forwardedFor[0] ?? req.socket.remoteAddress ?? "unknown";
  }

  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    return forwardedFor.split(",")[0]?.trim() ?? req.socket.remoteAddress ?? "unknown";
  }

  return req.socket.remoteAddress ?? "unknown";
}

export async function rateLimit(req: Request, res: Response, next: NextFunction): Promise<void> {
  const ip = getIp(req);
  const key = `ratelimit:${ip}`;
  const now = Date.now();
  const windowMs = getWindowMs();
  const maxRequests = getMaxRequests();

  try {
    const entry = buckets.get(key);

    if (!entry || entry.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    entry.count += 1;

    if (entry.count > maxRequests) {
      res.status(429).json({ error: "Too many requests" });
      return;
    }

    next();
  } catch (error) {
    console.error("[RateLimit] Failed to apply rate limit", error);
    next();
  }
}
