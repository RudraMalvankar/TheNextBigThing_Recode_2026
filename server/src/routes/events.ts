import { Router } from "express";
import { Event } from "../models/Event";

const router = Router();

router.get("/", async (req, res) => {
  const siteId = String(req.query.siteId ?? "").trim();
  const groupBy = String(req.query.groupBy ?? "hour");
  const eventType = String(req.query.type ?? "pageview");
  const fromRaw = String(req.query.from ?? "");
  const toRaw = String(req.query.to ?? "");

  if (!siteId) {
    res.status(400).json({ error: "siteId is required" });
    return;
  }

  const toDate = toRaw ? new Date(toRaw) : new Date();
  const fromDate = fromRaw ? new Date(fromRaw) : new Date(Date.now() - 24 * 60 * 60 * 1000);

  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    res.status(400).json({ error: "Invalid date range" });
    return;
  }

  if (groupBy === "hour") {
    try {
      const rows = await Event.aggregate([
        {
          $match: {
            siteId,
            type: eventType,
            isBot: false,
            createdAt: { $gte: fromDate, $lte: toDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%dT%H:00",
                date: "$createdAt",
              },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      res.status(200).json(rows.map((row) => ({ hour: row._id, count: row.count })));
      return;
    } catch (error) {
      console.error("[EventsRoute] Failed hour aggregation", error);
      res.status(500).json({ error: "Failed to fetch event trend" });
      return;
    }
  }

  if (groupBy === "page") {
    try {
      const rows = await Event.aggregate([
        {
          $match: {
            siteId,
            type: "pageview",
            isBot: false,
            createdAt: { $gte: fromDate, $lte: toDate },
          },
        },
        {
          $group: {
            _id: "$page",
            views: { $sum: 1 },
            sessionsSet: { $addToSet: "$sessionId" },
          },
        },
        {
          $project: {
            _id: 0,
            page: "$_id",
            views: 1,
            sessions: { $size: "$sessionsSet" },
          },
        },
        {
          $sort: { views: -1 },
        },
      ]);

      res.status(200).json(rows);
      return;
    } catch (error) {
      console.error("[EventsRoute] Failed page aggregation", error);
      res.status(500).json({ error: "Failed to fetch page metrics" });
      return;
    }
  }

  res.status(400).json({ error: "Invalid groupBy. Use hour or page" });
});

export const eventsRouter = router;
