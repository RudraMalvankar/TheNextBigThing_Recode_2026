const express = require("express");
const router = express.Router();
const Event = require("../models/Event");

router.get("/", async (req, res) => {
  try {
    const { siteId = "default", page = "/" } = req.query;

    const clicks = await Event.find(
      { siteId, page, type: "click", isBot: false },
      { clickX: 1, clickY: 1, isRageClick: 1, _id: 0 }
    )
      .sort({ createdAt: -1 })
      .limit(5000)
      .lean();

    const rageClicks = await Event.find(
      { siteId, page, type: "rage_click", isBot: false },
      { clickX: 1, clickY: 1, _id: 0 }
    )
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    const allClicks = [
      ...clicks.map((c) => ({ x: c.clickX, y: c.clickY, isRageClick: c.isRageClick || false })),
      ...rageClicks.map((c) => ({ x: c.clickX, y: c.clickY, isRageClick: true })),
    ];

    return res.json({ clicks: allClicks, total: allClicks.length });
  } catch (err) {
    console.error("Heatmap route error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
