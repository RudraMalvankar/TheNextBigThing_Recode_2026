const express = require("express");
const router = express.Router();
const { getLiveStats } = require("../socket/socketServer");
const Event = require("../models/Event");

router.get("/", async (req, res) => {
  try {
    const { siteId = "default" } = req.query;
    const data = await getLiveStats(siteId);
    return res.json(data);
  } catch (err) {
    console.error("Live route error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/live/history
router.get("/history", async (req, res) => {
  try {
    const { siteId } = req.query;
    if (!siteId) return res.status(400).json({ error: "siteId required for history" });

    const recentEvents = await Event.find({ siteId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Map to 'hacker feed' structure
    const mapped = recentEvents.map(e => ({
      siteId: e.siteId,
      sessionId: e.sessionId,
      type: e.type,
      page: e.page,
      label: e.label,
      isRageClick: e.isRageClick || false,
      ts: new Date(e.createdAt).getTime(),
      city: e.city || "Unknown",
      country: e.country || "Unknown",
    }));

    return res.json(mapped);
  } catch (err) {
    console.error("Live history error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
