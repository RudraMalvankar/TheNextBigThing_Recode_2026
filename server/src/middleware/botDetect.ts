import { NextFunction, Request, Response } from "express";

declare global {
  namespace Express {
    interface Request {
      isBot?: boolean;
    }
  }
}

const BOT_PATTERNS = [
  "bot",
  "crawl",
  "spider",
  "headless",
  "phantom",
  "selenium",
  "puppeteer",
  "playwright",
  "googlebot",
  "bingbot",
  "slurp",
  "duckduck",
  "archive",
  "wget",
  "curl",
  "python-requests",
];

type IncomingEvent = {
  timestamp?: number;
  referrer?: string;
};

export function botDetect(req: Request, _res: Response, next: NextFunction): void {
  const ua = (req.get("user-agent") ?? "").toLowerCase();
  const body = req.body as { events?: IncomingEvent[] };
  const events = Array.isArray(body?.events) ? body.events : [];

  const hasBotUA = BOT_PATTERNS.some((pattern) => ua.includes(pattern));
  const isAbusiveBatch = events.length > 50;

  let identicalTimestamps = false;
  if (events.length > 1) {
    const firstTimestamp = events[0]?.timestamp;
    identicalTimestamps = events.every((event) => event.timestamp === firstTimestamp);
  }

  const hasReferrer = events.some((event) => (event.referrer ?? "").trim().length > 0);
  const hasUserAgent = ua.trim().length > 0;
  const missingReferrerAndUA = !hasReferrer && !hasUserAgent;

  req.isBot = hasBotUA || isAbusiveBatch || identicalTimestamps || missingReferrerAndUA;
  next();
}
