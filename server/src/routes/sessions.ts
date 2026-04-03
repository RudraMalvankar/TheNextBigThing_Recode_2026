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
    const sessions = await Session.find({ siteId })
      .sort({ lastSeen: -1 })
      .limit(50)
      .select({
        sessionId: 1,
        startedAt: 1,
        lastSeen: 1,
        pageViews: 1,
        currentPage: 1,
        country: 1,
        persona: 1,
        events: 1,
      })
      .lean();

    res.status(200).json({ sessions });
  } catch (error) {
    console.error("[SessionsRoute] Failed to fetch sessions", error);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

export const sessionsRouter = router;
