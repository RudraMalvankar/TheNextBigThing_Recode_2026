const express = require("express");
const router = express.Router();
const botDetect = require("../middleware/botDetect");
const rateLimit = require("../middleware/rateLimit");
const { addEventsBulk } = require("../queues/eventQueue");
const { getGeoData } = require("../utils/geoip");

router.post("/", botDetect, rateLimit, async (req, res) => {
  try {
    const { siteId, sessionId, events, metadata } = req.body;
    const { screen = "Unknown", lang = "Unknown" } = metadata || {};

    if (!siteId || !events || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"] || "";
    const geoData = getGeoData(ip);

    const enriched = events.map((event) => ({
      siteId,
      sessionId: sessionId || event.sessionId || "unknown",
      type: event.type || "custom",
      page: event.page || "/",
      referrer: event.referrer || "",
      clickX: event.clickX ?? null,
      clickY: event.clickY ?? null,
      scrollDepth: event.scrollDepth ?? null,
      timeOnPage: event.timeOnPage ?? null,
      label: event.label || "",
      isRageClick: event.type === "rage_click",
      isBot: req.isBot,
      ip,
      userAgent,
      country: geoData.country,
      city: geoData.city,
      lat: geoData.lat,
      lng: geoData.lng,
      screenResolution: screen,
      language: lang,
      createdAt: event.ts ? new Date(event.ts) : new Date(),
    }));

    const queued = await addEventsBulk(enriched);
    return res.status(200).json({ received: true, queued });
  } catch (err) {
    console.error("Track error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
