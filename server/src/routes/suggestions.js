const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const Session = require("../models/Session");
const FunnelStep = require("../models/FunnelStep");

router.get("/", async (req, res) => {
  try {
    const { siteId = "default" } = req.query;
    const suggestions = [];
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // 1. Rage clicks on any page > 10 in 24h
    const rageByPage = await Event.aggregate([
      { $match: { siteId, type: "rage_click", isBot: false, createdAt: { $gte: dayAgo } } },
      { $group: { _id: "$page", count: { $sum: 1 } } },
      { $match: { count: { $gt: 10 } } },
    ]);
    rageByPage.forEach((r) => {
      suggestions.push(`⚠️ Frustration on ${r._id} — check broken elements (${r.count} rage clicks)`);
    });

    // 2. High bounce rate
    const totalSessions = await Session.countDocuments({ siteId, isBot: false });
    const bounceSessions = await Session.countDocuments({ siteId, isBot: false, pageViews: 1 });
    if (totalSessions > 0 && bounceSessions / totalSessions > 0.6) {
      const pct = Math.round((bounceSessions / totalSessions) * 100);
      suggestions.push(`📉 High bounce rate (${pct}%) — improve above-fold content`);
    }

    // 3. Funnel drop-off > 50%
    const steps = await FunnelStep.find({ siteId }).sort({ order: 1 }).lean();
    if (steps.length >= 2) {
      const stepCounts = [];
      for (const step of steps) {
        const users = await Event.distinct("sessionId", { siteId, page: step.path, isBot: false });
        stepCounts.push({ name: step.name, users: users.length });
      }
      for (let i = 1; i < stepCounts.length; i++) {
        if (stepCounts[i - 1].users > 0) {
          const drop = Math.round((1 - stepCounts[i].users / stepCounts[i - 1].users) * 100);
          if (drop > 50) {
            suggestions.push(`🚨 Major drop-off: ${stepCounts[i - 1].name} → ${stepCounts[i].name} (${drop}%)`);
          }
        }
      }
    }

    // 4. Dead zones — pages with high views but low clicks
    const deadZones = await Event.aggregate([
      { $match: { siteId, isBot: false, createdAt: { $gte: dayAgo } } },
      {
        $group: {
          _id: "$page",
          pageviews: { $sum: { $cond: [{ $eq: ["$type", "pageview"] }, 1, 0] } },
          clicks: { $sum: { $cond: [{ $eq: ["$type", "click"] }, 1, 0] } },
        },
      },
      { $match: { pageviews: { $gt: 50 }, clicks: { $lt: 5 } } },
    ]);
    deadZones.forEach((d) => {
      suggestions.push(`🧊 Dead zone on ${d._id} — users not engaging (${d.pageviews} views, ${d.clicks} clicks)`);
    });

    // 5. Low scroll depth
    const lowScroll = await Event.aggregate([
      { $match: { siteId, type: "scroll", isBot: false, scrollDepth: { $ne: null } } },
      { $group: { _id: "$page", avgDepth: { $avg: "$scrollDepth" } } },
      { $match: { avgDepth: { $lt: 30 } } },
    ]);
    lowScroll.forEach((s) => {
      suggestions.push(`📜 Users not scrolling on ${s._id} — move content up (avg ${Math.round(s.avgDepth)}%)`);
    });

    return res.json({ suggestions });
  } catch (err) {
    console.error("Suggestions route error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
