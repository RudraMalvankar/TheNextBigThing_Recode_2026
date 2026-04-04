const mongoose = require('mongoose');

const hourlyStatsSchema = new mongoose.Schema({
  siteId: { type: String, required: true, index: true },
  hour: { type: Date, required: true },
  pageviews: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  topPages: [{ 
    _id: String, // page path
    count: Number 
  }],
  countries: [{ 
    _id: String, // country code
    count: Number 
  }],
  rageClicks: { type: Number, default: 0 }
}, { timestamps: true });

// Compound index for fast range queries
hourlyStatsSchema.index({ siteId: 1, hour: -1 });

// TTL index to automatically expire data after 90 days (7,776,000 seconds)
hourlyStatsSchema.index({ hour: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('HourlyStats', hourlyStatsSchema);
