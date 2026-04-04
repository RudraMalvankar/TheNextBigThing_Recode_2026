const express = require("express");
const router = express.Router();
const Event = require("../models/Event");

router.get("/", async (req, res) => {
  const { siteId, from, to } = req.query;
  if (!siteId) return res.status(400).json({ error: "siteId required" });

  const query = { siteId, type: "custom" };
  if (from && to) {
    query.timestamp = { $gte: new Date(from), $lte: new Date(to) };
  }

  try {
    const customEvents = await Event.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            event: "$label",
            sessionId: "$sessionId",
          },
          count: { $sum: 1 },
          lastSeen: { $max: "$timestamp" },
        },
      },
      {
        $group: {
          _id: "$_id.event",
          sessions: { $sum: 1 },
          count: { $sum: "$count" },
          lastSeen: { $max: "$lastSeen" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const formatted = customEvents.map((e) => ({
      event: e._id,
      sessions: e.sessions,
      count: e.count,
      lastSeen: e.lastSeen,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Custom Events fetch error:", error);
    res.status(500).json({ error: "Server error fetching custom events" });
  }
});

module.exports = router;
