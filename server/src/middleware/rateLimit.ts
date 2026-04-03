import { NextFunction, Request, Response } from "express";
import { redis } from "../queues/redis";

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

  try {
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, 60);
    }

    if (count > 100) {
      res.status(429).json({ error: "Too many requests" });
      return;
    }

    next();
  } catch (error) {
    console.error("[RateLimit] Redis error", error);
    next();
  }
}
