const express = require("express");
const router = express.Router();
const Event = require("../models/Event");

router.get("/", async (req, res) => {
  const { siteId, from, to } = req.query;
  if (!siteId) return res.status(400).json({ error: "siteId required" });

  const query = { siteId, type: "pageview" };
  if (from && to) {
    query.timestamp = { $gte: new Date(from), $lte: new Date(to) };
  }

  try {
    const referrers = await Event.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            source: { $ifNull: ["$referrerDomain", "Direct"] },
            sessionId: "$sessionId",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.source",
          sessions: { $sum: 1 },
          pageviews: { $sum: "$count" },
        },
      },
      { $sort: { sessions: -1 } },
    ]);

    const totalSessions = referrers.reduce((acc, curr) => acc + curr.sessions, 0);

    const formatted = referrers.map((r) => ({
      source: r._id,
      sessions: r.sessions,
      pageviews: r.pageviews,
      percent: totalSessions > 0 ? Math.round((r.sessions / totalSessions) * 100) : 0,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Referrers fetch error:", error);
    res.status(500).json({ error: "Server error fetching referrers" });
  }
});

// GET /api/referrers/utm - UTM Source tracking
router.get("/utm", async (req, res) => {
  const { siteId } = req.query;
  if (!siteId) return res.status(400).json({ error: "siteId required" });

  try {
    const stats = await Event.aggregate([
      { $match: { siteId, utmSource: { $ne: null } } },
      {
        $group: {
          _id: "$utmSource",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const total = stats.reduce((acc, curr) => acc + curr.count, 0);
    const formatted = stats.map((s) => ({
      source: s._id,
      pageviews: s.count,
      percent: total > 0 ? Math.round((s.count / total) * 100) : 0,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: "Server error fetching UTM stats" });
  }
});

module.exports = router;
