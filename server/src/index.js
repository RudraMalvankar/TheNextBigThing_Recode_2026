require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");

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

  // 🔥 RESPONSE TIME TRACKING
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const ms = Date.now() - start;
      global.avgResponseMs = global.avgResponseMs
        ? global.avgResponseMs * 0.9 + ms * 0.1
        : ms;
    });
    next();
  });

  // 🔥 CORS FIX (FINAL)
  app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(morgan("dev"));

  // ✅ HEALTH CHECK
  app.get("/health", (req, res) =>
    res.json({ status: "ok", uptime: process.uptime() })
  );

  // ✅ TRACKER FILE SERVE
  app.get("/tracker.js", (req, res) => {
    res.sendFile(
      path.resolve(__dirname, "../../client/public/tracker.js")
    );
  });

  // 🔒 AUTH MIDDLEWARE
  const protect = require("./middleware/auth");

  // ============================
  // 🔥 PUBLIC ROUTES (IMPORTANT)
  // ============================
  app.use("/api/track", trackRoutes);
  app.use("/api/events", eventsRoutes);
  app.use("/api/live", liveRoutes);
  app.use("/api/funnel", funnelRoutes);
  app.use("/api/heatmap", heatmapRoutes);
  app.use("/api/sessions", sessionsRoutes);
  app.use("/api/suggestions", suggestionsRoutes);
  app.use("/api/replay", require("./routes/replay"));

  // ============================
  // 🔒 PROTECTED ROUTES (ADMIN)
  // ============================
  app.use("/api/auth", require("./routes/auth"));
  app.use("/api/sites", protect, require("./routes/sites"));
  app.use("/api/metrics", protect, require("./routes/metrics"));
  app.use("/api/score", protect, require("./routes/score"));
  app.use("/api/export", protect, require("./routes/export"));

  // ADVANCED
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

  // 🔥 SERVER + SOCKET
  const server = http.createServer(app);
  const io = initSocket(server);
  global.ioServer = io;

  // 🔥 WORKERS (optional — can disable if error)
  require("./workers/eventWorker");
  require("./workers/aggregatorWorker");

  // 🔥 ANOMALY ENGINE
  const { startAnomalyEngine } = require("./utils/anomalyEngine");
  startAnomalyEngine(io);

  // 🚀 START SERVER
  server.listen(PORT, () => {
    console.log(`🚀 InsightOS running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});