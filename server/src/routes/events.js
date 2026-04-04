const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const HourlyStats = require("../models/HourlyStats");

router.get("/", async (req, res) => {
  try {
    const { siteId, groupBy = "hour", from, to, type = "pageview" } = req.query;

    if (!siteId) return res.status(400).json({ error: "siteId is required" });

    const now = new Date();
    const dateFrom = from ? new Date(from) : new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const dateTo = to ? new Date(to) : now;

    // For historical trends (> 2 hours), use pre-aggregated HourlyStats for sub-ms performance
    const hoursDiff = (dateTo - dateFrom) / (1000 * 60 * 60);

    if (groupBy === "hour" && hoursDiff > 2 && type === "pageview") {
      const stats = await HourlyStats.find({
        siteId,
        hour: { $gte: dateFrom, $lte: dateTo }
      }).sort({ hour: 1 });

      if (stats.length > 0) {
        return res.json(stats.map(s => ({
          hour: s.hour.toISOString().slice(0, 16).replace('T', ' '),
          count: s.pageviews
        })));
      }
    }

    // fallback to raw events for live data (last 2 hours) or custom groupings
    const matchStage = {
      siteId,
      type,
      isBot: false,
      createdAt: { $gte: dateFrom, $lte: dateTo },
    };

    if (groupBy === "page") {
      const pipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: "$page",
            views: { $sum: 1 },
            sessions: { $addToSet: "$sessionId" },
          },
        },
        {
          $project: {
            page: "$_id",
            views: 1,
            sessions: { $size: "$sessions" },
            _id: 0,
          },
        },
        { $sort: { views: -1 } },
        { $limit: 50 },
      ];
      const results = await Event.aggregate(pipeline);
      return res.json(results);
    }

    // Default: groupBy hour from raw Events
    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%dT%H:00", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          hour: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ];
    const results = await Event.aggregate(pipeline);
    return res.json(results);
  } catch (err) {
    console.error("Events route error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
