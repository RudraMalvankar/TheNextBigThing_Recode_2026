const mongoose = require("mongoose");

const screenshotSchema = new mongoose.Schema({
  siteId: {
    type: String,
    required: true,
  },
  page: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  imageBase64: {
    type: String,
    required: true,
  },
  width: {
    type: Number,
    default: 1280,
  },
  height: {
    type: Number,
    default: 800,
  },
  capturedAt: {
    type: Date,
    default: Date.now,
  },
});

// Refresh daily
screenshotSchema.index({ capturedAt: 1 }, { expireAfterSeconds: 86400 });
screenshotSchema.index({ siteId: 1, page: 1 });

module.exports = mongoose.model("Screenshot", screenshotSchema);
