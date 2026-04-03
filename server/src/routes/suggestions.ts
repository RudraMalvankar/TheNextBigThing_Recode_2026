import { Router } from "express";
import { Event } from "../models/Event";
import { Session } from "../models/Session";
import { FunnelStep } from "../models/FunnelStep";

const router = Router();

router.get("/", async (req, res) => {
  const siteId = String(req.query.siteId ?? "").trim();

  if (!siteId) {
    res.status(400).json({ error: "siteId is required" });
    return;
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const suggestions: string[] = [];

  try {
    const rageByPage = await Event.aggregate([
      {
        $match: {
          siteId,
          type: "rage_click",
          isBot: false,
          createdAt: { $gte: since },
        },
      },
      {
        $group: {
          _id: "$page",
          count: { $sum: 1 },
        },
      },
    ]);

    for (const row of rageByPage) {
      if (row.count > 10) {
        suggestions.push(`⚠️ High frustration detected on ${row._id} - check for broken elements`);
      }
    }

    const totalSessions = await Session.countDocuments({ siteId, isBot: false });
    const bouncedSessions = await Session.countDocuments({ siteId, isBot: false, pageViews: 1 });

    if (totalSessions > 0 && bouncedSessions / totalSessions > 0.6) {
      suggestions.push("📉 Bounce rate is high - consider improving above-the-fold content");
    }

    const steps = await FunnelStep.find({ siteId }).sort({ order: 1 }).limit(2).lean();
    if (steps.length === 2) {
      const [step1, step2] = steps;
      const step1Users = await Event.distinct("sessionId", {
        siteId,
        page: step1.path,
        isBot: false,
      });
      const step2Users = await Event.distinct("sessionId", {
        siteId,
        page: step2.path,
        isBot: false,
      });

      if (step1Users.length > 0) {
        const drop = ((step1Users.length - step2Users.length) / step1Users.length) * 100;
        if (drop > 50) {
          suggestions.push(`🚨 Major drop-off between ${step1.name} -> ${step2.name}`);
        }
      }
    }

    const clickByPage = await Event.aggregate([
      {
        $match: {
          siteId,
          isBot: false,
          createdAt: { $gte: since },
          type: { $in: ["click", "pageview"] },
        },
      },
      {
        $group: {
          _id: "$page",
          clickCount: {
            $sum: {
              $cond: [{ $eq: ["$type", "click"] }, 1, 0],
            },
          },
          viewCount: {
            $sum: {
              $cond: [{ $eq: ["$type", "pageview"] }, 1, 0],
            },
          },
        },
      },
    ]);

    for (const row of clickByPage) {
      if (row.clickCount < 5 && row.viewCount > 50) {
        suggestions.push(`🧊 Dead zone detected on ${row._id} - users are not engaging`);
      }
    }

    const lowScrollPages = await Event.aggregate([
      {
        $match: {
          siteId,
          type: "scroll",
          isBot: false,
          createdAt: { $gte: since },
          scrollDepth: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$page",
          avgScroll: { $avg: "$scrollDepth" },
        },
      },
    ]);

    for (const row of lowScrollPages) {
      if (row.avgScroll < 30) {
        suggestions.push(`📜 Users are not scrolling on ${row._id} - move key content up`);
      }
    }

    res.status(200).json({ suggestions });
  } catch (error) {
    console.error("[SuggestionsRoute] Failed to generate suggestions", error);
    res.status(500).json({ error: "Failed to generate suggestions" });
  }
});

export const suggestionsRouter = router;
