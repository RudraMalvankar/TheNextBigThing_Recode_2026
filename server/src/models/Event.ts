import mongoose, { Document, Model, Schema } from "mongoose";

export type EventType =
  | "pageview"
  | "click"
  | "scroll"
  | "hover"
  | "rage_click"
  | "custom";

export interface EventDocument extends Document {
  siteId: string;
  type: EventType;
  page: string;
  referrer: string;
  userAgent: string;
  ip: string;
  country: string;
  sessionId: string;
  clickX: number | null;
  clickY: number | null;
  scrollDepth: number | null;
  timeOnPage: number | null;
  label: string;
  isBot: boolean;
  isRageClick: boolean;
  createdAt: Date;
}

const eventSchema = new Schema<EventDocument>(
  {
    siteId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ["pageview", "click", "scroll", "hover", "rage_click", "custom"],
      required: true,
    },
    page: { type: String, required: true },
    referrer: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    ip: { type: String, default: "" },
    country: { type: String, default: "" },
    sessionId: { type: String, required: true, index: true },
    clickX: { type: Number, default: null },
    clickY: { type: Number, default: null },
    scrollDepth: { type: Number, default: null },
    timeOnPage: { type: Number, default: null },
    label: { type: String, default: "" },
    isBot: { type: Boolean, default: false },
    isRageClick: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
  },
);

eventSchema.index({ siteId: 1, type: 1, createdAt: -1 });
eventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

export const Event: Model<EventDocument> =
  (mongoose.models.Event as Model<EventDocument>) ||
  mongoose.model<EventDocument>("Event", eventSchema);
