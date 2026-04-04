const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Site = require("../models/Site");

router.get("/", async (req, res) => {
  try {
    const sites = await Site.find().sort({ name: 1 }).lean();
    if (sites.length === 0) {
      // Create default site if none exists
      const defaultSite = await Site.create({
        name: "Default Project",
        siteId: "default",
        domain: "localhost"
      });
      return res.json([defaultSite]);
    }
    return res.json(sites);
  } catch (err) {
    console.error("Sites fetch error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, domain } = req.body;
    if (!name || !domain) {
      return res.status(400).json({ error: "Name and domain are required" });
    }

    const siteId = crypto.randomBytes(6).toString("hex");

    const site = await Site.create({ name, domain, siteId });
    return res.status(201).json(site);
  } catch (err) {
    console.error("Site create error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
