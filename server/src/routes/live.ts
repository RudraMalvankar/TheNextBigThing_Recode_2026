import { Router } from "express";
import { Session } from "../models/Session";

const router = Router();

router.get("/", async (req, res) => {
  const siteId = String(req.query.siteId ?? "").trim();

  if (!siteId) {
    res.status(400).json({ error: "siteId is required" });
    return;
  }

  try {
    const activeSince = new Date(Date.now() - 5 * 60 * 1000);

    const sessions = await Session.find({
      siteId,
      isBot: false,
      lastSeen: { $gte: activeSince },
    })
      .select({ currentPage: 1 })
      .lean();

    const pageCounts = new Map<string, number>();

    for (const session of sessions) {
      const page = session.currentPage || "/";
      pageCounts.set(page, (pageCounts.get(page) ?? 0) + 1);
    }

    res.status(200).json({
      activeUsers: sessions.length,
      pages: Array.from(pageCounts.entries())
        .map(([page, count]) => ({ page, count }))
        .sort((a, b) => b.count - a.count),
    });
  } catch (error) {
    console.error("[LiveRoute] Failed to fetch live metrics", error);
    res.status(500).json({ error: "Failed to fetch live data" });
  }
});

export const liveRouter = router;
