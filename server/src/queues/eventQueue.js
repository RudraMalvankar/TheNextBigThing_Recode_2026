const { Queue } = require("bullmq");
const redis = require("./redis");

const eventQueue = new Queue("events", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: 200,
    removeOnFail: 100,
  },
});

async function addEventsBulk(events) {
  const jobs = events.map((event, i) => ({
    name: "process-event",
    data: event,
    opts: { jobId: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}` },
  }));
  await eventQueue.addBulk(jobs);
  return jobs.length;
}

module.exports = { eventQueue, addEventsBulk };
