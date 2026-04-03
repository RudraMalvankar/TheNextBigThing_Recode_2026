import "dotenv/config";
import { connectDB } from "./config/db";
import { FunnelStep } from "./models/FunnelStep";

async function seed(): Promise<void> {
  await connectDB();

  try {
    await FunnelStep.deleteMany({ siteId: "default" });

    await FunnelStep.insertMany([
      { siteId: "default", name: "Home", path: "/", order: 1 },
      { siteId: "default", name: "Pricing", path: "/pricing", order: 2 },
      { siteId: "default", name: "Checkout", path: "/checkout", order: 3 },
    ]);

    console.log("Seeded default funnel steps");
  } catch (error) {
    console.error("Failed to seed funnel steps", error);
    process.exitCode = 1;
  }
}

seed().finally(() => {
  process.exit();
});
