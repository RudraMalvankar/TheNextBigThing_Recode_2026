import mongoose, { Document, Model, Schema } from "mongoose";

export interface FunnelStepDocument extends Document {
  siteId: string;
  name: string;
  path: string;
  order: number;
}

const funnelStepSchema = new Schema<FunnelStepDocument>(
  {
    siteId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    path: { type: String, required: true },
    order: { type: Number, required: true },
  },
  {
    versionKey: false,
  },
);

funnelStepSchema.index({ siteId: 1, order: 1 }, { unique: true });

export const FunnelStep: Model<FunnelStepDocument> =
  (mongoose.models.FunnelStep as Model<FunnelStepDocument>) ||
  mongoose.model<FunnelStepDocument>("FunnelStep", funnelStepSchema);
