const express = require("express");
const router = express.Router();
const Alert = require("../models/Alert");

// GET /api/alerts?siteId=
router.get("/", async (req, res) => {
  const { siteId } = req.query;
  if (!siteId) return res.status(400).json({ error: "siteId required" });

  try {
    const alerts = await Alert.find({ siteId, userId: req.user._id }).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
});

// POST /api/alerts
router.post("/", async (req, res) => {
  const { siteId, name, metric, condition, threshold } = req.body;

  try {
    const alert = new Alert({
      userId: req.user._id,
      siteId,
      name,
      metric,
      condition,
      threshold,
    });
    await alert.save();
    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ error: "Failed to create alert" });
  }
});

// DELETE /api/alerts/:id
router.delete("/:id", async (req, res) => {
  try {
    const alert = await Alert.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!alert) return res.status(404).json({ error: "Alert not found" });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete alert" });
  }
});

module.exports = router;
