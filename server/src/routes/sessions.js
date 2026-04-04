const express = require("express");
const router = express.Router();
const Session = require("../models/Session");
const intentEngine = require("../utils/intentEngine");

router.get("/", async (req, res) => {
  try {
    const { siteId = "default" } = req.query;

    const sessions = await Session.find({ siteId, isBot: false })
      .sort({ lastSeen: -1 })
      .limit(50)
      .lean();

    const enriched = sessions.map((s) => ({
      sessionId: s.sessionId,
      country: s.country,
      pageViews: s.pageViews,
      persona: s.persona,
      intent: intentEngine.classify(s),
      currentPage: s.currentPage,
      events: s.events,
      startedAt: s.startedAt,
      lastSeen: s.lastSeen,
    }));

    return res.json({ sessions: enriched });
  } catch (err) {
    console.error("Sessions route error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
