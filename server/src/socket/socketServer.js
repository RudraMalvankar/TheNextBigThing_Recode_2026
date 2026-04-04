const { Server } = require("socket.io");
const Session = require("../models/Session");

let io = null;

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);
    socket.on("disconnect", () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

function emitLiveUpdate(data) {
  if (io) {
    io.emit("live:update", data);
  }
}

function emitActivity(siteId, data) {
  if (io) {
    io.emit("activity:new", { siteId, ...data });
  }
}

async function getLiveStats(siteId) {
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000); // Extended to 30 min for better visibility
  try {
    const sessions = await Session.find({
      siteId,
      lastSeen: { $gte: thirtyMinAgo },
      isBot: false,
    }).lean();

    const pageMap = {};
    sessions.forEach((s) => {
      const page = s.currentPage || "/";
      pageMap[page] = (pageMap[page] || 0) + 1;
    });

    const pages = Object.entries(pageMap)
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count);

    const markers = sessions
      .filter((s) => s.lat && s.lng)
      .map((s) => ({
        lat: s.lat,
        lng: s.lng,
        city: s.city,
        country: s.country,
        page: s.currentPage,
      }));

    return { activeUsers: sessions.length, pages, markers };
  } catch (err) {
    console.error("getLiveStats error:", err.message);
    return { activeUsers: 0, pages: [], markers: [] };
  }
}

module.exports = { initSocket, emitLiveUpdate, getLiveStats, emitActivity };
