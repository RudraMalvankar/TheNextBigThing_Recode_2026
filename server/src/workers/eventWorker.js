const { Worker } = require("bullmq");
const redis = require("../queues/redis");
const Event = require("../models/Event");
const Session = require("../models/Session");
const personaEngine = require("../utils/personaEngine");
const { parseUA } = require("../utils/uaParser");
const { emitLiveUpdate, getLiveStats, emitActivity } = require("../socket/socketServer");

let processedCount = 0;

console.log("👷 Worker starting up for 'events' queue...");

const worker = new Worker(
  "events",
  async (job) => {
    const event = job.data;
    console.log(`[Worker] 📥 Processing job ${job.id} - Type: ${event.type}`);

    try {
      let referrerDomain = "";
      let utmSource = "";
      if (event.referrer) {
        try {
          referrerDomain = new URL(event.referrer).hostname;
          if (referrerDomain.includes("google")) utmSource = "Google";
          else if (referrerDomain.includes("facebook") || referrerDomain.includes("fb.com")) utmSource = "Facebook";
          else if (referrerDomain.includes("instagram")) utmSource = "Instagram";
          else if (referrerDomain.includes("twitter") || referrerDomain.includes("t.co")) utmSource = "Twitter/X";
          else if (referrerDomain.includes("linkedin")) utmSource = "LinkedIn";
          else if (referrerDomain.includes("github")) utmSource = "GitHub";
          else utmSource = referrerDomain;
        } catch (e) {}
      }
      
      event.referrerDomain = referrerDomain || "Direct";
      if (utmSource) event.utmSource = utmSource;

      await Event.create(event);

      const { browser, os, device } = parseUA(event.userAgent);

      const session = await Session.findOneAndUpdate(
        { sessionId: event.sessionId },
        {
          $set: {
            lastSeen: new Date(),
            currentPage: event.page,
            country: event.country,
            city: event.city,
            lat: event.lat,
            lng: event.lng,
            siteId: event.siteId,
            isBot: event.isBot,
            browser,
            os,
            deviceType: device,
            screenResolution: event.screenResolution,
            language: event.language,
            isRageClick: event.isRageClick || false,
            utmSource: event.utm_source,
            utmMedium: event.utm_medium,
            utmCampaign: event.utm_campaign,
          },
          $inc: { pageViews: event.type === "pageview" ? 1 : 0 },
          $push: { events: event.page },
          $setOnInsert: { startedAt: new Date() },
        },
        { upsert: true, new: true }
      );

      const persona = personaEngine.classify(session);
      await Session.findByIdAndUpdate(session._id, { persona });

      processedCount++;
      if (processedCount % 100 === 0) {
        console.log(`[Worker] ✅ Total processed: ${processedCount}`);
      }

      console.log(`[Worker] ✨ Success - Job ${job.id}`);

      try {
        const liveData = await getLiveStats(event.siteId);
        emitLiveUpdate(liveData);

        const activity = {
          type: event.type,
          page: event.page,
          label: event.label || "",
          country: event.country || "Unknown",
          city: event.city || "",
          sessionId: event.sessionId.slice(-6),
          isRageClick: event.isRageClick,
          ts: new Date().toISOString()
        };
        emitActivity(event.siteId, activity);
      } catch (socketErr) {
        // Socket not yet initialized — ignore
      }
    } catch (err) {
      console.error("[Worker] ❌ Error processing event:", err.message);
      throw err;
    }
  },
  {
    connection: redis,
    concurrency: 10,
  }
);

worker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err.message);
});

worker.on("error", (err) => {
  console.error("[Worker] Error:", err.message);
});

module.exports = worker;
