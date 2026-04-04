const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const Session = require("../models/Session");
const FunnelStep = require("../models/FunnelStep");
const redis = require("../queues/redis");
const { generateInsights } = require("../utils/geminiEngine");

router.get("/insights", async (req, res) => {
  const { siteId } = req.query;
  if (!siteId) return res.status(400).json({ error: "siteId required" });

  try {
    // Check Redis Cache
    const cacheKey = `ai:insights:${siteId}`;
    const cachedInsights = await redis.get(cacheKey);
    if (cachedInsights) {
      return res.json(JSON.parse(cachedInsights));
    }

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Run parallel queries efficiently
    const [
      totalPageviews,
      totalSessions,
      bounceSessions,
      topPages,
      funnelSteps,
      ragePages,
      activeUsers,
      countries,
      isBotEvents,
    ] = await Promise.all([
      // Total Pageviews
      Event.countDocuments({ siteId, timestamp: { $gte: oneDayAgo }, type: "pageview" }),
      // Total Sessions
      Session.countDocuments({ siteId, endTime: { $gte: oneDayAgo } }),
      // Bounce Sessions (only 1 pageview)
      Session.countDocuments({ siteId, endTime: { $gte: oneDayAgo }, pageviews: 1 }),
      // Top Pages
      Event.aggregate([
        { $match: { siteId, type: "pageview", timestamp: { $gte: oneDayAgo } } },
        { $group: { _id: "$page", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      // Funnel Steps
      FunnelStep.find({ siteId }).sort({ order: 1 }),
      // Rage Clicks
      Event.aggregate([
        { $match: { siteId, isRageClick: true, timestamp: { $gte: oneDayAgo } } },
        { $group: { _id: "$page", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 3 },
      ]),
      // Active Users (approx. sessions active in last 5 mins)
      Session.countDocuments({ siteId, lastActive: { $gte: new Date(Date.now() - 5 * 60 * 1000) } }),
      // Top Countries
      Session.aggregate([
        { $match: { siteId, endTime: { $gte: oneDayAgo }, country: { $ne: "Unknown" } } },
        { $group: { _id: "$country", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      // Bot Events
      Event.countDocuments({ siteId, isBot: true, timestamp: { $gte: oneDayAgo } }),
    ]);

    // Calculate derived metrics
    const bounceRate = totalSessions > 0 ? Math.round((bounceSessions / totalSessions) * 100) : 0;
    const botPercent = totalPageviews > 0 ? Math.round((isBotEvents / (totalPageviews + isBotEvents)) * 100) : 0;

    const formattedTopPages = topPages.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {});
    const formattedRagePages = ragePages.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {});
    const formattedCountries = countries.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {});

    // For funnel data (simplified)
    const funnelObj = {};
    for (const step of funnelSteps) {
      const pvs = await Event.distinct("sessionId", { siteId, page: step.path, type: "pageview" });
      funnelObj[step.name] = pvs.length;
    }

    // Call Gemini with full context-aware data
    const insights = await generateInsights({
      siteName: siteId, // Could fetch from Site model if needed
      totalPageviews,
      uniqueSessions: totalSessions,
      bounceRate,
      avgPages: totalSessions > 0 ? (totalPageviews / totalSessions).toFixed(1) : 0,
      topPages: topPages.map(p => ({ page: p._id, views: p.count })),
      worstFunnelDrop: { from: "Home", to: "Pricing", dropoff: 45 }, // Placeholder until complex funnel logic
      rageClicks: ragePages.reduce((sum, p) => sum + p.count, 0),
      rageClickPages: ragePages.map(p => p._id),
      avgScrollDepth: 42, 
      activeUsers,
      topCountry: countries[0]?._id || "Unknown",
      botPercent,
      mobilePercent: 65, // Example split
      countries: formattedCountries,
    });

    // Cache for 10 minutes
    await redis.set(cacheKey, JSON.stringify(insights), "EX", 600);

    res.json(insights);
  } catch (error) {
    console.error("AI Insights Error:", error);
    res.status(500).json({ error: "Failed to generate insights" });
  }
});

// Placeholder endpoints for page analysis and funnel fix
router.get("/page-analysis", async (req, res) => {
  res.json({ message: "Page analysis endpoint coming soon." });
});

router.get("/funnel-fix", async (req, res) => {
  res.json({ message: "Funnel fix endpoint coming soon." });
});

module.exports = router;
