import { Router } from "express";
import { Event } from "../models/Event";

const router = Router();

router.get("/", async (req, res) => {
  const siteId = String(req.query.siteId ?? "").trim();
  const page = String(req.query.page ?? "").trim();

  if (!siteId || !page) {
    res.status(400).json({ error: "siteId and page are required" });
    return;
  }

  try {
    const clicks = await Event.find(
      { siteId, page, type: "click", isBot: false },
      { clickX: 1, clickY: 1, isRageClick: 1, _id: 0 },
    )
      .limit(5000)
      .lean();

    res.status(200).json({
      clicks: clicks.map((point) => ({
        x: point.clickX,
        y: point.clickY,
        isRageClick: Boolean(point.isRageClick),
      })),
      total: clicks.length,
    });
  } catch (error) {
    console.error("[HeatmapRoute] Failed to fetch heatmap", error);
    res.status(500).json({ error: "Failed to fetch heatmap" });
  }
});

export const heatmapRouter = router;
