const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
  siteId:      { type: String, required: true },
  sessionId:   { type: String, required: true, unique: true },
  startedAt:   { type: Date, default: Date.now },
  lastSeen:    { type: Date, default: Date.now },
  currentPage: { type: String, default: "/" },
  pageViews:   { type: Number, default: 0 },
  country:     { type: String, default: "" },
  city:        { type: String, default: "" },
  lat:         { type: Number, default: null },
  lng:         { type: Number, default: null },
  isBot:       { type: Boolean, default: false },
  persona:     { type: String, enum: ["Explorer", "Buyer", "Bouncer", "Unknown"], default: "Unknown" },
  browser:     { type: String, default: "Unknown" },
  os:          { type: String, default: "Unknown" },
  deviceType:  { type: String, enum: ["desktop", "mobile", "tablet"], default: "desktop" },
  events:      [String],
});

SessionSchema.index({ siteId: 1, lastSeen: -1 });
SessionSchema.index({ lastSeen: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model("Session", SessionSchema);
