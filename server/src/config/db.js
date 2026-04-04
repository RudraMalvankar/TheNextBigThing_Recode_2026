const mongoose = require("mongoose");

// Pre-register models to prevent "Schema hasn't been registered" errors
// This is critical for all entry points (cron workers, test scripts, main server)
require("../models/Event");
require("../models/Session");
require("../models/HourlyStats");
require("../models/Site");
require("../models/FunnelStep");

let cached = global.mongoose || { conn: null, promise: null };
global.mongoose = cached;

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  console.log("✅ MongoDB connected");

  // Ensure mission-critical indexes for 10k+ events/sec
  try {
    const db = mongoose.connection;
    
    // Cautiously create or recreate indexes via direct collection access
    // This avoids "Schema hasn't been registered" but we still registered them above for safety
    await db.collection('events').createIndex(
      { siteId: 1, type: 1, createdAt: -1 },
      { background: true }
    );

    // For TTL: check if index exists without TTL, and if so, drop it first to avoid conflicts
    try {
      await db.collection('events').createIndex(
        { createdAt: 1 },
        { expireAfterSeconds: 7776000, background: true } // 90-day TTL
      );
    } catch(e) {
      if (e.codeName === 'IndexOptionsConflict') {
        await db.collection('events').dropIndex('createdAt_1');
        await db.collection('events').createIndex(
          { createdAt: 1 },
          { expireAfterSeconds: 7776000, background: true }
        );
      }
    }

    await db.collection('sessions').createIndex(
      { siteId: 1, lastSeen: -1 },
      { background: true }
    );
    console.log("⚡ DB Indexes verified");
  } catch (err) {
    console.error("❌ Index sync failed:", err.message);
  }

  return cached.conn;
}

module.exports = connectDB;
