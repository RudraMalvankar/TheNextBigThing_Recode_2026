const express = require("express");
const router = express.Router();
const Event = require("../models/Event");

// GET /api/scrollmap
router.get("/", async (req, res) => {
  const { siteId, page } = req.query;
  if (!siteId || !page) return res.status(400).json({ error: "siteId and page required" });

  try {
    // We only want the MAX scroll depth per session for this page
    const maxScrolls = await Event.aggregate([
      { $match: { siteId, page, type: "scroll" } },
      { $group: { _id: "$sessionId", maxDepth: { $max: "$scrollDepth" } } }
    ]);

    const totalSessions = maxScrolls.length;
    
    let depths = { 25: 0, 50: 0, 75: 0, 100: 0 };
    
    maxScrolls.forEach((session) => {
      const depth = session.maxDepth || 0;
      if (depth >= 25) depths[25]++;
      if (depth >= 50) depths[50]++;
      if (depth >= 75) depths[75]++;
      if (depth >= 95) depths[100]++; // Using 95+ as 100% since reaching exactly 100 is rare
    });

    res.json({
      page,
      totalSessions,
      depths: [
        { depth: 25, sessions: depths[25], percent: totalSessions > 0 ? Math.round((depths[25]/totalSessions)*100) : 0 },
        { depth: 50, sessions: depths[50], percent: totalSessions > 0 ? Math.round((depths[50]/totalSessions)*100) : 0 },
        { depth: 75, sessions: depths[75], percent: totalSessions > 0 ? Math.round((depths[75]/totalSessions)*100) : 0 },
        { depth: 100, sessions: depths[100], percent: totalSessions > 0 ? Math.round((depths[100]/totalSessions)*100) : 0 },
      ]
    });
  } catch (error) {
    console.error("Scrollmap fetch error:", error);
    res.status(500).json({ error: "Server error fetching scrollmap data" });
  }
});

module.exports = router;
