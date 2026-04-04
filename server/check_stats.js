require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./src/config/db");

async function check() {
  // connectDB now handles all model registration internally
  await connectDB();
  
  const Event = mongoose.model("Event");
  const HourlyStats = mongoose.model("HourlyStats");
  
  const eventCount = await Event.countDocuments();
  const rollupCount = await HourlyStats.countDocuments();
  
  console.log(`--- DB STATUS ---`);
  console.log(`Total Events: ${eventCount}`);
  console.log(`Total Rollups: ${rollupCount}`);
  
  if (rollupCount === 0 && eventCount > 0) {
    console.log("⚠️ ROLLUPS ARE EMPTY but EVENTS EXIST. Running manual aggregation...");
    const { aggregateHourly } = require("./src/workers/aggregatorWorker");
    await aggregateHourly();
    const newRollupCount = await HourlyStats.countDocuments();
    console.log(`✅ Manual aggregation done. New Rollups: ${newRollupCount}`);
  }
  
  process.exit(0);
}

check().catch(err => {
  console.error("❌ Diagnostic failed:", err);
  process.exit(1);
});
