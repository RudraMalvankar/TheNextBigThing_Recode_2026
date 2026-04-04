const Event = require("../models/Event");

let anomalyInterval = null;

function startAnomalyEngine(io) {
  if (anomalyInterval) clearInterval(anomalyInterval);

  anomalyInterval = setInterval(async () => {
    try {
      const now = new Date();
      const m5 = new Date(now.getTime() - 5 * 60 * 1000);
      const m10 = new Date(now.getTime() - 10 * 60 * 1000);

      // Check 1 & 2 — Traffic Spike & Sudden Drop
      const current5m = await Event.countDocuments({ createdAt: { $gte: m5 } });
      const prev5m = await Event.countDocuments({ createdAt: { $gte: m10, $lt: m5 } });

      if (prev5m > 0) {
        if (current5m > prev5m * 2) {
          const increase = Math.round((current5m / prev5m) * 100);
          io.emit("anomaly", { type: "spike", message: `🚀 Traffic spike: ${increase}% increase`, severity: "info", ts: Date.now() });
        } else if (current5m < prev5m * 0.3) {
          const drop = Math.round((1 - current5m / prev5m) * 100);
          io.emit("anomaly", { type: "drop", message: `⚠️ Traffic dropped ${drop}%`, severity: "warning", ts: Date.now() });
        }
      }

      // Check 3 — Rage Click Surge
      const rageAgg = await Event.aggregate([
        { $match: { type: "rage_click", createdAt: { $gte: m5 } } },
        { $group: { _id: "$page", count: { $sum: 1 } } }
      ]);
      
      rageAgg.forEach(r => {
        if (r.count > 20) {
          io.emit("anomaly", { type: "rage", message: `😤 Rage click surge on ${r._id}`, severity: "error", ts: Date.now() });
        }
      });

      // Check 4 — Zero Traffic (if previously had traffic)
      const allEventsLast10m = await Event.countDocuments({ createdAt: { $gte: m10 } });
      const priorEvents = await Event.countDocuments({ createdAt: { $lt: m10 } }).limit(1);
      
      if (allEventsLast10m === 0 && priorEvents > 0) {
        io.emit("anomaly", { type: "dead", message: "💀 No traffic for 10 minutes", severity: "error", ts: Date.now() });
      }

    } catch (err) {
      console.error("Anomaly engine error:", err.message);
    }
  }, 5 * 60 * 1000); // Check every 5 minutes
}

module.exports = { startAnomalyEngine };
