require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const { initSocket } = require("./socket/socketServer");

const trackRoutes = require("./routes/track");
const eventsRoutes = require("./routes/events");
const liveRoutes = require("./routes/live");
const funnelRoutes = require("./routes/funnel");
const heatmapRoutes = require("./routes/heatmap");
const sessionsRoutes = require("./routes/sessions");
const suggestionsRoutes = require("./routes/suggestions");

async function start() {
  const PORT = 4001;
  console.log(`📡 FORCING START ON PORT: ${PORT}`);

  await connectDB();

  const app = express();

  // Response time measuring middleware
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const ms = Date.now() - start;
      global.avgResponseMs = global.avgResponseMs ? (global.avgResponseMs * 0.9 + ms * 0.1) : ms;
    });
    next();
  });

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow all local origins for development (file://, localhost, etc)
        if (!origin || origin.includes("localhost") || origin === "null") {
          return callback(null, true);
        }
        if (process.env.NODE_ENV === "production" && origin === process.env.CLIENT_ORIGIN) {
          return callback(null, true);
        }
        callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(morgan("dev"));

  app.get("/health", (req, res) => res.json({ status: "ok", uptime: process.uptime() }));
  app.get("/tracker.js", (req, res) => {
    res.sendFile(require("path").resolve(__dirname, "../../client/public/tracker.js"));
  });

  const protect = require("./middleware/auth");

  app.use("/api/auth", require("./routes/auth"));
  app.use("/api/track", trackRoutes); // Tracker script is public
  app.use("/api/replay", require("./routes/replay")); // Ingestion is public, GET is protected inside the route
  
  app.use("/api/events", protect, eventsRoutes);
  app.use("/api/live", protect, liveRoutes);
  app.use("/api/funnel", protect, funnelRoutes);
  app.use("/api/heatmap", protect, heatmapRoutes);
  app.use("/api/sessions", protect, sessionsRoutes);
  app.use("/api/suggestions", protect, suggestionsRoutes);

  app.use("/api/sites", protect, require("./routes/sites"));
  app.use("/api/metrics", protect, require("./routes/metrics"));
  app.use("/api/score", protect, require("./routes/score"));
  app.use("/api/export", protect, require("./routes/export"));

  // Advanced V2 Routes
  app.use("/api/screenshot", protect, require("./routes/screenshot"));
  app.use("/api/ai", protect, require("./routes/ai"));
  app.use("/api/referrers", protect, require("./routes/referrers"));
  app.use("/api/custom-events", protect, require("./routes/customEvents"));
  app.use("/api/performance", protect, require("./routes/performance"));
  app.use("/api/alerts", protect, require("./routes/alerts"));
  app.use("/api/geography", protect, require("./routes/geography"));
  app.use("/api/devices", protect, require("./routes/devices"));
  app.use("/api/scrollmap", protect, require("./routes/scrollmap"));
  app.use("/api/demo", protect, require("./routes/demo"));

  const server = http.createServer(app);
  const io = initSocket(server);
  global.ioServer = io;

  // Start Background Workers
  require("./workers/eventWorker");
  require("./workers/aggregatorWorker");

  // Anomaly engine (runs every 5 min)
  const { startAnomalyEngine } = require("./utils/anomalyEngine");
  startAnomalyEngine(io);

  server.listen(PORT, () => {
    console.log(`🚀 InsightOS running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
