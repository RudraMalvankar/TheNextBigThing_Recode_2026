import { Router } from "express";
import { botDetect } from "../middleware/botDetect";
import { rateLimit } from "../middleware/rateLimit";
import { addEventBulk, TrackEventJobData, TrackEventType } from "../queues/eventQueue";
import { getCountry } from "../utils/geoip";

type IncomingEvent = {
  type?: TrackEventType;
  page?: string;
  referrer?: string;
  clickX?: number;
  clickY?: number;
  scrollDepth?: number;
  timeOnPage?: number;
  label?: string;
  timestamp?: number;
  sessionId?: string;
};

const allowedTypes: TrackEventType[] = ["pageview", "click", "scroll", "hover", "rage_click", "custom"];

function getIp(forwardedFor: string | string[] | undefined, socketIp: string | undefined): string {
  if (Array.isArray(forwardedFor)) {
    return forwardedFor[0] ?? socketIp ?? "";
  }

  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    return forwardedFor.split(",")[0]?.trim() ?? socketIp ?? "";
  }

  return socketIp ?? "";
}

export const trackRouter = Router();

trackRouter.post("/", botDetect, rateLimit, async (req, res) => {
  try {
    const body = req.body as {
      siteId?: string;
      sessionId?: string;
      events?: IncomingEvent[];
    };

    const siteId = body.siteId?.trim();
    const events = Array.isArray(body.events) ? body.events : [];
    const requestSessionId = body.sessionId?.trim();

    if (!siteId || events.length === 0) {
      res.status(400).json({ error: "siteId and events are required" });
      return;
    }

    const ip = getIp(req.headers["x-forwarded-for"], req.socket.remoteAddress);
    const userAgent = req.get("user-agent") ?? "";
    const country = getCountry(ip);
    const isBot = Boolean(req.isBot);

    const jobs: TrackEventJobData[] = events
      .filter((event) => typeof event.page === "string" && typeof event.type === "string")
      .map((event) => {
        const normalizedType = allowedTypes.includes(event.type as TrackEventType)
          ? (event.type as TrackEventType)
          : "custom";

        return {
          siteId,
          type: normalizedType,
          page: event.page?.trim() || "/",
          referrer: event.referrer ?? "",
          userAgent,
          ip,
          country,
          sessionId: event.sessionId?.trim() || requestSessionId || "",
          clickX: typeof event.clickX === "number" ? event.clickX : null,
          clickY: typeof event.clickY === "number" ? event.clickY : null,
          scrollDepth: typeof event.scrollDepth === "number" ? event.scrollDepth : null,
          timeOnPage: typeof event.timeOnPage === "number" ? event.timeOnPage : null,
          label: event.label ?? "",
          isBot,
          isRageClick: normalizedType === "rage_click",
          createdAt: new Date(event.timestamp ?? Date.now()),
        };
      })
      .filter((job) => job.sessionId.length > 0);

    if (jobs.length === 0) {
      res.status(400).json({ error: "No valid events in payload" });
      return;
    }

    await addEventBulk(jobs);

    res.status(200).json({ received: true, queued: jobs.length });
  } catch (error) {
    console.error("[TrackRoute] Failed to enqueue events", error);
    res.status(500).json({ error: "Failed to enqueue events" });
  }
});
