const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  siteId:      { type: String, required: true },
  type:        { type: String, enum: ["pageview", "click", "scroll", "hover", "rage_click", "custom"], required: true },
  page:        { type: String, required: true },
  referrer:    { type: String, default: "" },
  userAgent:   { type: String, default: "" },
  ip:          { type: String, default: "" },
  country:     { type: String, default: "" },
  sessionId:   { type: String, required: true },
  clickX:      { type: Number, default: null },
  clickY:      { type: Number, default: null },
  scrollDepth: { type: Number, default: null },
  timeOnPage:  { type: Number, default: null },
  label:       { type: String, default: "" },
  isBot:       { type: Boolean, default: false },
  isRageClick: { type: Boolean, default: false },
  referrerDomain: { type: String, default: "" },
  utmSource: { type: String, default: "" },
  utmMedium: { type: String, default: "" },
  utmCampaign: { type: String, default: "" },
  customProps: { type: String, default: "" },
  createdAt:   { type: Date, default: Date.now },
});

EventSchema.index({ siteId: 1, type: 1, createdAt: -1 });
EventSchema.index({ sessionId: 1 });
EventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model("Event", EventSchema);
