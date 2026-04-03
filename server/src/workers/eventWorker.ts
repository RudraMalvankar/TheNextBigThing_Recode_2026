import { Job, Worker } from "bullmq";
import { connectDB } from "../config/db";
import { Event } from "../models/Event";
import { Session, SessionDocument } from "../models/Session";
import { redis } from "../queues/redis";
import { TrackEventJobData } from "../queues/eventQueue";
import { classifyPersona } from "../utils/personaEngine";
import { emitLiveUpdate, LiveUpdatePayload } from "../socket/socketServer";

let worker: Worker<TrackEventJobData> | null = null;
let totalProcessed = 0;

async function insertEvent(event: TrackEventJobData): Promise<void> {
  try {
    await Event.create(event);
  } catch (error) {
    console.error("[Worker] Failed to insert event", error);
    throw error;
  }
}

async function upsertSession(event: TrackEventJobData): Promise<SessionDocument | null> {
  try {
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
  } catch (error) {
    console.error("[Worker] Failed to upsert session", error);
    throw error;
  }
}

async function savePersona(session: SessionDocument): Promise<void> {
  try {
    const persona = classifyPersona(session);
    session.persona = persona;
    await session.save();
  } catch (error) {
    console.error("[Worker] Failed to classify persona", error);
    throw error;
  }
}

async function getLiveStats(siteId: string): Promise<LiveUpdatePayload> {
  try {
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
  } catch (error) {
    console.error("[Worker] Failed to compute live stats", error);
    return { activeUsers: 0, pages: [] };
  }
}

async function processJob(job: Job<TrackEventJobData>): Promise<void> {
  const event = job.data;

  await insertEvent(event);
  const session = await upsertSession(event);

  if (session) {
    await savePersona(session);
  }

  const liveStats = await getLiveStats(event.siteId);
  emitLiveUpdate(liveStats);

  totalProcessed += 1;
  if (totalProcessed % 100 === 0) {
    console.log(`[Worker] ✅ ${totalProcessed} events processed`);
  }
}

export async function startEventWorker(): Promise<Worker<TrackEventJobData>> {
  if (worker) {
    return worker;
  }

  await connectDB();

  worker = new Worker<TrackEventJobData>("events", processJob, {
    connection: redis,
    concurrency: 30,
  });

  worker.on("failed", (_job, error) => {
    console.error("[Worker] Job failed", error);
  });

  return worker;
}
