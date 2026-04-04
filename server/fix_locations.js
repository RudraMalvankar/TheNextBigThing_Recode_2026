require("dotenv").config();
const mongoose = require("mongoose");

async function fix() {
  if (!process.env.MONGODB_URI) {
    console.error("No MONGODB_URI found in .env");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to Atlas DB");

  const Session = mongoose.model("Session", new mongoose.Schema({
    country: String,
    city: String
  }, { collection: "sessions" }));

  const result = await Session.updateMany(
    { country: { $in: ["US", "Unknown", ""] } },
    { $set: { country: "IN", city: "Local Project" } }
  );

  console.log(`Updated ${result.modifiedCount} sessions to IN`);
  process.exit(0);
}

fix().catch(console.error);
