const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  siteId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  metric: {
    type: String,
    enum: [
      "bounce_rate",
      "active_users",
      "rage_clicks",
      "traffic_drop",
      "traffic_spike",
      "funnel_drop",
    ],
    required: true,
  },
  condition: {
    type: String,
    enum: ["above", "below"],
    required: true,
  },
  threshold: {
    type: Number,
    required: true,
  },
  triggered: {
    type: Boolean,
    default: false,
  },
  lastFired: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

alertSchema.index({ siteId: 1, userId: 1 });

module.exports = mongoose.model("Alert", alertSchema);
