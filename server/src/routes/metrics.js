const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const { eventQueue } = require("../queues/eventQueue");

router.get("/", async (req, res) => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      eventsLast1h,
      eventsLast24h,
      botsLast24h,
      rageLast24h,
      queueDepth
    ] = await Promise.all([
      Event.countDocuments({ createdAt: { $gte: oneHourAgo } }),
      Event.countDocuments({ createdAt: { $gte: oneDayAgo } }),
      Event.countDocuments({ isBot: true, createdAt: { $gte: oneDayAgo } }),
      Event.countDocuments({ isRageClick: true, createdAt: { $gte: oneDayAgo } }),
      eventQueue.getWaitingCount()
    ]);

    // Use global var for avgResponseMs set by middleware
    const avgResponseMs = global.avgResponseMs || 0;
    
    // Attempt to read socket connections
    const ioClients = global.ioServer ? global.ioServer.engine.clientsCount : 0;

    return res.json({
      uptime: process.uptime(),
      memoryUsed: process.memoryUsage().heapUsed / 1024 / 1024,
      eventsLast1h,
      eventsLast24h,
      avgResponseMs,
      queueDepth,
      activeConnections: ioClients,
      botEventsBlocked: botsLast24h,
      rageClicks: rageLast24h
    });
  } catch (err) {
    console.error("Metrics check error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
