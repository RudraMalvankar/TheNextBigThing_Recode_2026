require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./src/config/db");
const FunnelStep = require("./src/models/FunnelStep");
const Site = require("./src/models/Site");

async function seed() {
  await connectDB();

  // 1. Ensure Default Site exists
  const defaultSite = { siteId: "default", name: "Default Project", domain: "localhost" };
  await Site.findOneAndUpdate({ siteId: "default" }, defaultSite, { upsert: true });

  const steps = [
    { siteId: "default", name: "Home", path: "/", order: 1 },
    { siteId: "default", name: "Pricing", path: "/pricing", order: 2 },
    { siteId: "default", name: "Checkout", path: "/checkout", order: 3 },
  ];

  await FunnelStep.deleteMany({ siteId: "default" });
  await FunnelStep.insertMany(steps);

  console.log("✅ Seed complete — Default site & 3 funnel steps created/updated");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
