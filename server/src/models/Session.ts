import mongoose, { Document, Model, Schema } from "mongoose";

export type PersonaType = "Explorer" | "Buyer" | "Bouncer" | "Unknown";

export interface SessionDocument extends Document {
  siteId: string;
  sessionId: string;
  startedAt: Date;
  lastSeen: Date;
  currentPage: string;
  pageViews: number;
  country: string;
  isBot: boolean;
  persona: PersonaType;
  events: string[];
}

const sessionSchema = new Schema<SessionDocument>(
  {
    siteId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, unique: true },
    startedAt: { type: Date, default: Date.now },
    lastSeen: { type: Date, default: Date.now },
    currentPage: { type: String, default: "/" },
    pageViews: { type: Number, default: 0 },
    country: { type: String, default: "" },
    isBot: { type: Boolean, default: false },
    persona: {
      type: String,
      enum: ["Explorer", "Buyer", "Bouncer", "Unknown"],
      default: "Unknown",
    },
    events: { type: [String], default: [] },
  },
  {
    versionKey: false,
  },
);

sessionSchema.index({ lastSeen: 1 }, { expireAfterSeconds: 1800 });

export const Session: Model<SessionDocument> =
  (mongoose.models.Session as Model<SessionDocument>) ||
  mongoose.model<SessionDocument>("Session", sessionSchema);
