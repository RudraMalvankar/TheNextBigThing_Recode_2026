import "dotenv/config";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import { createServer } from "http";
import { readFile } from "fs/promises";
import path from "path";
import { connectDB } from "./config/db";
import { requireAuth } from "./middleware/auth";
import { authRouter } from "./routes/auth";
import { trackRouter } from "./routes/track";
import { eventsRouter } from "./routes/events";
import { liveRouter } from "./routes/live";
import { funnelRouter } from "./routes/funnel";
import { heatmapRouter } from "./routes/heatmap";
import { sessionsRouter } from "./routes/sessions";
import { suggestionsRouter } from "./routes/suggestions";
import { initSocketServer } from "./socket/socketServer";

async function bootstrap(): Promise<void> {
  await connectDB();

  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    }),
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.get("/tracker.js", async (_req, res) => {
    try {
      const trackerPath = path.resolve(__dirname, "..", "..", "client", "public", "tracker.js");
      const trackerSource = await readFile(trackerPath, "utf8");

      res.setHeader("Content-Type", "application/javascript; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=300");
      res.status(200).send(trackerSource);
    } catch (error) {
      console.error("[TrackerRoute] Failed to load tracker.js", error);
      res.status(404).type("application/javascript").send("console.warn('InsightOS tracker.js not found');");
    }
  });

  app.use("/api/auth", authRouter);
  app.use("/api/track", trackRouter);
  app.use("/api/events", requireAuth, eventsRouter);
  app.use("/api/live", requireAuth, liveRouter);
  app.use("/api/funnel", requireAuth, funnelRouter);
  app.use("/api/heatmap", requireAuth, heatmapRouter);
  app.use("/api/sessions", requireAuth, sessionsRouter);
  app.use("/api/suggestions", requireAuth, suggestionsRouter);

  const server = createServer(app);
  initSocketServer(server);

  const port = Number(process.env.PORT ?? 4000);

  server.listen(port, () => {
    console.log(`🚀 InsightOS server running on port ${port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to bootstrap InsightOS server", error);
  process.exit(1);
});
