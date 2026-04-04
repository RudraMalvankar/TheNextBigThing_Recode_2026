const express = require("express");
const router = express.Router();
const ReplayEvent = require("../models/ReplayEvent");
const protect = require("../middleware/auth");

router.post("/", async (req, res) => {
  try {
    const { sessionId, siteId, events } = req.body;

    if (!sessionId || !siteId || !events || !events.length) {
      return res.status(400).json({ error: "Invalid replay payload" });
    }

    const payload = events.map(e => ({
      sessionId,
      siteId,
      type: e.type,
      x: e.x,
      y: e.y,
      page: e.page,
      ts: e.ts,
    }));

    await ReplayEvent.insertMany(payload);
    return res.status(200).json({ saved: events.length });
  } catch (err) {
    console.error("Replay flush error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:sessionId", protect, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const events = await ReplayEvent.find({ sessionId })
      .sort({ ts: 1 })
      .limit(2000)
      .lean();

    const duration = events.length > 1 
      ? events[events.length - 1].ts - events[0].ts 
      : 0;

    return res.json({ events, duration });
  } catch (err) {
    console.error("Replay fetch error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
