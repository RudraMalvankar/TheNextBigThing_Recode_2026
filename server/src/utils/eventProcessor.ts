import { Event } from "../models/Event";
import { Session, SessionDocument } from "../models/Session";
import { classifyPersona } from "./personaEngine";
import { emitLiveUpdate, LiveUpdatePayload } from "../socket/socketServer";

export type TrackEventType =
  | "pageview"
  | "click"
  | "scroll"
  | "hover"
  | "rage_click"
  | "custom";

export type TrackEventInput = {
  siteId: string;
  type: TrackEventType;
  page: string;
  referrer?: string;
  userAgent?: string;
  ip?: string;
  country?: string;
  sessionId: string;
  clickX?: number | null;
  clickY?: number | null;
  scrollDepth?: number | null;
  timeOnPage?: number | null;
  label?: string;
  isBot?: boolean;
  isRageClick?: boolean;
  createdAt?: Date;
};

async function upsertSession(event: TrackEventInput): Promise<SessionDocument | null> {
  const session = await Session.findOneAndUpdate(
    { sessionId: event.sessionId },
    {
      $set: {
        siteId: event.siteId,
        lastSeen: event.createdAt ?? new Date(),
        currentPage: event.page,
        country: event.country ?? "",
        isBot: Boolean(event.isBot),
      },
      $setOnInsert: {
        startedAt: event.createdAt ?? new Date(),
      },
      $inc: {
        pageViews: event.type === "pageview" ? 1 : 0,
      },
      $push: {
        events: event.page,
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  );

  return session;
}

async function savePersona(session: SessionDocument): Promise<void> {
  session.persona = classifyPersona(session);
  await session.save();
}

async function getLiveStats(siteId: string): Promise<LiveUpdatePayload> {
  const activeSince = new Date(Date.now() - 5 * 60 * 1000);

  const sessions = await Session.find({
    siteId,
    isBot: false,
    lastSeen: { $gte: activeSince },
  })
    .select({ currentPage: 1 })
    .lean();

  const pageCounts = new Map<string, number>();

  for (const session of sessions) {
    const page = session.currentPage || "/";
    pageCounts.set(page, (pageCounts.get(page) ?? 0) + 1);
  }

  return {
    activeUsers: sessions.length,
    pages: Array.from(pageCounts.entries())
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count),
  };
}

export async function processTrackedEvents(events: TrackEventInput[]): Promise<number> {
  if (!events.length) {
    return 0;
  }

  for (const event of events) {
    await Event.create(event);
    const session = await upsertSession(event);

    if (session) {
      await savePersona(session);
    }

    const liveStats = await getLiveStats(event.siteId);
    emitLiveUpdate(liveStats);
  }

  return events.length;
}