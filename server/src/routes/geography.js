const express = require("express");
const router = express.Router();
const Session = require("../models/Session");
const { getCountryInfo } = require("../utils/countryMap");

// GET /api/geography
router.get("/", async (req, res) => {
  let { siteId, from, to } = req.query;
  if (!siteId) return res.status(400).json({ error: "siteId required" });

  const query = { siteId, country: { $ne: "Unknown" } };
  if (from && to) {
    query.endTime = { $gte: new Date(from), $lte: new Date(to) };
  }

  try {
    const stats = await Session.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$country",
          sessions: { $sum: 1 },
          pageviews: { $sum: "$pageviews" },
          bounces: {
            $sum: { $cond: [{ $eq: ["$pageviews", 1] }, 1, 0] },
          },
        },
      },
      { $sort: { sessions: -1 } },
    ]);

    const formatted = stats.map((s) => {
      const info = getCountryInfo(s._id);
      return {
        country: s._id,
        name: info.name,
        flag: info.flag,
        sessions: s.sessions,
        pageviews: s.pageviews,
        bounceRate: s.sessions > 0 ? Math.round((s.bounces / s.sessions) * 100) : 0,
        avgPages: s.sessions > 0 ? (s.pageviews / s.sessions).toFixed(1) : 0,
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error("Geography fetch error:", error);
    res.status(500).json({ error: "Server error fetching geography data" });
  }
});

// GET /api/geography/cities
router.get("/cities", async (req, res) => {
  const { siteId } = req.query;
  if (!siteId) return res.status(400).json({ error: "siteId required" });

  try {
    const cities = await Session.aggregate([
      { $match: { siteId, city: { $ne: "Unknown" } } },
      { $group: { _id: "$city", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);
    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: "Server error fetching cities" });
  }
});

module.exports = router;
