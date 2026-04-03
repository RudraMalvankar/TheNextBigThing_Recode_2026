import { Router } from "express";
import { Event } from "../models/Event";
import { FunnelStep } from "../models/FunnelStep";

const router = Router();
const DEFAULT_STEP_TEMPLATE = [
  { name: "Home", path: "/", order: 1 },
  { name: "Pricing", path: "/pricing", order: 2 },
  { name: "Checkout", path: "/checkout", order: 3 },
];
type FunnelStepLike = {
  siteId: string;
  name: string;
  path: string;
  order: number;
};

function toFunnelStepLike(step: {
  siteId?: string;
  name?: string;
  path?: string;
  order?: number;
}): FunnelStepLike {
  return {
    siteId: step.siteId ?? "",
    name: step.name ?? "",
    path: step.path ?? "/",
    order: step.order ?? 0,
  };
}

function shouldAutoSeedFunnel(): boolean {
  const raw = (process.env.AUTO_SEED_FUNNEL ?? "true").trim().toLowerCase();
  return raw !== "false" && raw !== "0" && raw !== "off";
}

router.get("/", async (req, res) => {
  const siteId = String(req.query.siteId ?? "").trim();

  if (!siteId) {
    res.status(400).json({ error: "siteId is required" });
    return;
  }

  try {
    let steps: FunnelStepLike[] = (await FunnelStep.find({ siteId }).sort({ order: 1 }).lean()).map(toFunnelStepLike);

    if (!steps.length && shouldAutoSeedFunnel()) {
      try {
        await FunnelStep.insertMany(
          DEFAULT_STEP_TEMPLATE.map((step) => ({
            siteId,
            name: step.name,
            path: step.path,
            order: step.order,
          })),
          { ordered: false },
        );
      } catch {
        // Ignore duplicate write errors from concurrent requests.
      }

      steps = (await FunnelStep.find({ siteId }).sort({ order: 1 }).lean()).map(toFunnelStepLike);
    }

    if (!steps.length) {
      steps = DEFAULT_STEP_TEMPLATE.map((step) => ({
        siteId,
        name: step.name,
        path: step.path,
        order: step.order,
      }));
    }

    const result: Array<{ step: string; path: string; users: number; dropoff: string | null }> = [];

    for (let i = 0; i < steps.length; i += 1) {
      const step = steps[i];

      let users: string[] = [];
      try {
        users = await Event.distinct("sessionId", {
          siteId,
          page: step.path,
          isBot: false,
        });
      } catch (error) {
        console.error("[FunnelRoute] Failed to fetch step users", error);
        throw error;
      }

      const currCount = users.length;
      const prevCount = result[i - 1]?.users ?? null;

      let dropoff: string | null = null;
      if (prevCount !== null && prevCount > 0) {
        dropoff = (((prevCount - currCount) / prevCount) * 100).toFixed(1);
      }

      result.push({
        step: step.name,
        path: step.path,
        users: currCount,
        dropoff,
      });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("[FunnelRoute] Failed to fetch funnel", error);
    res.status(500).json({ error: "Failed to fetch funnel" });
  }
});

export const funnelRouter = router;
