const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const Session = require("../models/Session");
const FunnelStep = require("../models/FunnelStep");

router.get("/", async (req, res) => {
  try {
    const { siteId = "default" } = req.query;
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);

    let score = 50;

    // 1. Bounce Rate
    const totalSessions = await Session.countDocuments({ siteId, isBot: false });
    const bounceSessions = await Session.countDocuments({ siteId, isBot: false, pageViews: 1 });
    const bounceRate = totalSessions > 0 ? (bounceSessions / totalSessions) * 100 : 0;
    
    if (bounceRate < 40) score += 10;
    if (bounceRate > 70) score -= 10;

    // 2. Avg session pageViews
    const avgPagesAgg = await Session.aggregate([
      { $match: { siteId, isBot: false } },
      { $group: { _id: null, avgPages: { $avg: "$pageViews" } } }
    ]);
    const avgSessionPages = avgPagesAgg[0]?.avgPages || 0;
    if (avgSessionPages > 3) score += 10;

    // 3. Funnel Conversion
    let funnelConversion = 0;
    const steps = await FunnelStep.find({ siteId }).sort({ order: 1 }).lean();
    if (steps.length >= 2) {
      const topOfFunnel = await Event.distinct("sessionId", { siteId, page: steps[0].path, isBot: false });
      const bottomOfFunnel = await Event.distinct("sessionId", { siteId, page: steps[steps.length - 1].path, isBot: false });
      if (topOfFunnel.length > 0) {
        funnelConversion = (bottomOfFunnel.length / topOfFunnel.length) * 100;
        if (funnelConversion > 20) score += 10;
      }
    }

    // 4. Rage Clicks
    const rageClicks24h = await Event.countDocuments({ siteId, type: "rage_click", isBot: false, createdAt: { $gte: dayAgo } });
    if (rageClicks24h === 0) score += 10;
    if (rageClicks24h > 20) score -= 10;

    // 5. Traffic Growth
    const trafficToday = await Event.countDocuments({ siteId, isBot: false, createdAt: { $gte: dayAgo } });
    const trafficYesterday = await Event.countDocuments({ siteId, isBot: false, createdAt: { $gte: twoDaysAgo, $lt: dayAgo } });
    if (trafficToday > trafficYesterday) score += 10;

    // 6. Zero traffic
    const recentTraffic = await Event.countDocuments({ siteId, isBot: false, createdAt: { $gte: sixHoursAgo } });
    if (recentTraffic === 0) score -= 10;

    // Clamp score
    score = Math.max(0, Math.min(100, score));

    // Grade Mapping
    let grade = "D";
    if (score >= 90) grade = "A+";
    else if (score >= 80) grade = "A";
    else if (score >= 70) grade = "B";
    else if (score >= 60) grade = "C";

    // Achievements
    const activeUsers = await Session.countDocuments({ siteId, lastSeen: { $gte: new Date(Date.now() - 5 * 60 * 1000) }, isBot: false });
    const botsBlocked = await Event.countDocuments({ siteId, isBot: true });
    
    const achievements = [
      { name: "On Fire", icon: "🔥", unlocked: activeUsers > 10 },
      { name: "Converter", icon: "🎯", unlocked: funnelConversion > 30 },
      { name: "Sticky", icon: "💎", unlocked: avgSessionPages > 5 },
      { name: "Bot Slayer", icon: "🛡", unlocked: botsBlocked > 50 },
      { name: "Growing", icon: "📈", unlocked: trafficToday > trafficYesterday * 1.5 },
      { name: "Speed Demon", icon: "⚡", unlocked: global.avgResponseMs < 30 && global.avgResponseMs > 0 }
    ];

    res.json({ score, grade, achievements });
  } catch (err) {
    console.error("Score metrics error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
