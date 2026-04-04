const express = require("express");
const router = express.Router();
const Event = require("../models/Event");

router.get("/", async (req, res) => {
  const { siteId, page } = req.query;
  if (!siteId) return res.status(400).json({ error: "siteId required" });

  const query = { siteId, type: "custom", label: "page_performance" };
  if (page) query.page = page;

  try {
    const events = await Event.find(query).limit(500); // Consider last 500 events

    // Calculate averages
    let ttfbSum = 0;
    let domLoadSum = 0;
    let fullLoadSum = 0;
    let validCount = 0;

    events.forEach((event) => {
      try {
        const perfData = JSON.parse(event.customProps);
        if (perfData.ttfb && perfData.domLoad && perfData.fullLoad) {
          ttfbSum += perfData.ttfb;
          domLoadSum += perfData.domLoad;
          fullLoadSum += perfData.fullLoad;
          validCount++;
        }
      } catch (err) {
        // Skip invalid JSON
      }
    });

    if (validCount === 0) {
      return res.json({
        page: page || "All Pages",
        samples: 0,
        ttfb: 0,
        domLoad: 0,
        fullLoad: 0,
      });
    }

    res.json({
      page: page || "All Pages",
      samples: validCount,
      ttfb: Math.round(ttfbSum / validCount),
      domLoad: Math.round(domLoadSum / validCount),
      fullLoad: Math.round(fullLoadSum / validCount),
    });
  } catch (error) {
    console.error("Performance fetch error:", error);
    res.status(500).json({ error: "Server error fetching performance stats" });
  }
});

module.exports = router;
