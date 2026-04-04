const express = require("express");
const router = express.Router();
const { parse } = require("json2csv");
const Event = require("../models/Event");
const Session = require("../models/Session");
const FunnelStep = require("../models/FunnelStep");

router.get("/csv", async (req, res) => {
  try {
    const { siteId = "default", from, to } = req.query;
    const dateQuery = {};
    if (from || to) {
      dateQuery.createdAt = {};
      if (from) dateQuery.createdAt.$gte = new Date(from);
      if (to) dateQuery.createdAt.$lte = new Date(to);
    }
    
    const events = await Event.find({ siteId, ...dateQuery }).sort({ createdAt: 1 }).lean();
    
    if (events.length === 0) {
      return res.status(404).send("No events found in date range");
    }

    const fields = ["createdAt", "page", "type", "country", "sessionId", "clickX", "clickY", "scrollDepth", "label"];
    const csv = parse(events, { fields });

    res.setHeader("Content-Disposition", 'attachment; filename="insightos-export.csv"');
    res.setHeader("Content-Type", "text/csv");
    return res.send(csv);
  } catch (err) {
    console.error("CSV Export error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/summary", async (req, res) => {
  try {
    const { siteId = "default", from, to } = req.query;
    const dateQuery = {};
    if (from || to) {
      dateQuery.createdAt = {};
      if (from) dateQuery.createdAt.$gte = new Date(from);
      if (to) dateQuery.createdAt.$lte = new Date(to);
    }

    const totalPageviews = await Event.countDocuments({ siteId, type: "pageview", ...dateQuery });
    const totalSessions = await Session.countDocuments({ siteId });
    const uniqueCountries = (await Session.distinct("country", { siteId })).length;
    const botsBlocked = await Event.countDocuments({ siteId, isBot: true, ...dateQuery });

    const topPageAgg = await Event.aggregate([
      { $match: { siteId, type: "pageview", ...(from || to ? { createdAt: dateQuery.createdAt } : {}) } },
      { $group: { _id: "$page", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    const topPage = topPageAgg[0]?._id || "None";

    const scrollAgg = await Event.aggregate([
      { $match: { siteId, type: "scroll", scrollDepth: { $ne: null } } },
      { $group: { _id: null, avgScrollDepth: { $avg: "$scrollDepth" } } }
    ]);
    const avgScrollDepth = scrollAgg[0]?.avgScrollDepth || 0;

    const bounceSessions = await Session.countDocuments({ siteId, pageViews: 1 });
    const bounceRate = totalSessions > 0 ? (bounceSessions / totalSessions) * 100 : 0;

    let funnelCompletion = 0;
    const steps = await FunnelStep.find({ siteId }).sort({ order: 1 }).lean();
    if (steps.length >= 2) {
      const topOfFunnel = await Event.distinct("sessionId", { siteId, page: steps[0].path, isBot: false });
      const bottomOfFunnel = await Event.distinct("sessionId", { siteId, page: steps[steps.length - 1].path, isBot: false });
      if (topOfFunnel.length > 0) {
        funnelCompletion = (bottomOfFunnel.length / topOfFunnel.length) * 100;
      }
    }

    return res.json({
      totalPageviews,
      totalSessions,
      uniqueCountries,
      topPage,
      avgScrollDepth: Math.round(avgScrollDepth),
      bounceRate: Math.round(bounceRate),
      funnelCompletion: Math.round(funnelCompletion),
      botsBlocked,
      dateRange: { from, to }
    });
  } catch (err) {
    console.error("Summary Export error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
