const mongoose = require("mongoose");

const FunnelStepSchema = new mongoose.Schema({
  siteId: { type: String, required: true },
  name:   { type: String, required: true },
  path:   { type: String, required: true },
  order:  { type: Number, required: true },
});

module.exports = mongoose.model("FunnelStep", FunnelStepSchema);
