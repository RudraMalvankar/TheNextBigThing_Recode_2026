const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const FunnelStep = require("../models/FunnelStep");

router.get("/", async (req, res) => {
  try {
    const { siteId = "default" } = req.query;

    const steps = await FunnelStep.find({ siteId }).sort({ order: 1 }).lean();

    if (!steps.length) {
      return res.json({ steps: [], message: "No funnel configured" });
    }

    const results = [];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const path = step.path;
      const uniqueSessions = await Event.distinct("sessionId", {
        siteId,
        page: path === "/" ? { $in: ["/", "", "/index.html"] } : path,
        isBot: false,
      });
      const users = uniqueSessions.length;

      let dropoff = 0;
      if (i > 0 && results[i - 1].users > 0) {
        dropoff = Math.round((1 - users / results[i - 1].users) * 100);
      }

      results.push({
        step: step.name,
        path: step.path,
        order: step.order,
        users,
        dropoff,
      });
    }

    return res.json({ steps: results });
  } catch (err) {
    console.error("Funnel route error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/calculate", async (req, res) => {
  try {
    const { siteId, steps } = req.body;
    if (!siteId || !steps || !Array.isArray(steps)) {
      return res.status(400).json({ error: "siteId and steps array required" });
    }

    const results = [];
    let previousSessionIds = null;

    for (let i = 0; i < steps.length; i++) {
      const path = steps[i];
      const query = {
        siteId,
        page: path === "/" ? { $in: ["/", "", "/index.html"] } : path,
        isBot: false,
      };

      // If it's not the first step, only count sessions that reached the previous step
      if (previousSessionIds) {
        query.sessionId = { $in: previousSessionIds };
      }

      const activeSessionIds = await Event.distinct("sessionId", query);
      const users = activeSessionIds.length;

      let dropoff = 0;
      if (i > 0 && results[i - 1].users > 0) {
        dropoff = Math.round((1 - users / results[i - 1].users) * 100);
      }

      results.push({
        path,
        users,
        dropoff,
      });

      // Update for next step
      previousSessionIds = activeSessionIds;
      if (users === 0) break; // Optimization: if 0 users reached this step, 0 will reach next
    }

    return res.json({ steps: results });
  } catch (err) {
    console.error("Funnel calculation error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
