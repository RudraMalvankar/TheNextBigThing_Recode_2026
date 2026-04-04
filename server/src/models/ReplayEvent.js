const mongoose = require("mongoose");

const ReplayEventSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  siteId:    { type: String, required: true },
  type:      { type: String, enum: ["move", "click", "scroll", "resize"], required: true },
  x:         { type: Number, default: null }, // normalized 0-1
  y:         { type: Number, default: null }, // normalized 0-1
  page:      { type: String, required: true },
  ts:        { type: Number, required: true }, // timestamp ms
  createdAt: { type: Date, default: Date.now },
});

ReplayEventSchema.index({ sessionId: 1, ts: 1 });
ReplayEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 }); // 24h TTL

module.exports = mongoose.model("ReplayEvent", ReplayEventSchema);
