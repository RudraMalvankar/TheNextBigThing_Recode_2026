const mongoose = require("mongoose");

const SiteSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  siteId:    { type: String, required: true, unique: true },
  domain:    { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Site", SiteSchema);
