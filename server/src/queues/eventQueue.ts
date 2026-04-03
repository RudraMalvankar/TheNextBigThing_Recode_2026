import { JobsOptions, Queue } from "bullmq";
import { redis } from "./redis";

export type TrackEventType =
  | "pageview"
  | "click"
  | "scroll"
  | "hover"
  | "rage_click"
  | "custom";

export interface TrackEventJobData {
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
}

const defaultJobOptions: JobsOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 1000,
  },
  removeOnComplete: 200,
  removeOnFail: 100,
};

export const eventQueue = new Queue<TrackEventJobData>("events", {
  connection: redis,
  defaultJobOptions,
});

export async function addEventBulk(events: TrackEventJobData[]): Promise<void> {
  if (!events.length) {
    return;
  }

  await eventQueue.addBulk(
    events.map((event) => ({
      name: "track-event",
      data: event,
    })),
  );
}
