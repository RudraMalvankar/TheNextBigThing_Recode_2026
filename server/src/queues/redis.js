const Redis = require("ioredis");

const options = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

if (process.env.REDIS_HOST) {
  options.host = process.env.REDIS_HOST;
  options.port = process.env.REDIS_PORT || 6379;
  options.username = process.env.REDIS_USERNAME;
  options.password = process.env.REDIS_PASSWORD;
  if (process.env.REDIS_TLS === "on") {
    options.tls = {};
  }
}

const redis = process.env.REDIS_HOST 
  ? new Redis(options) 
  : new Redis(process.env.REDIS_URL, options);

redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("error", (err) => console.error("❌ Redis error:", err.message));

module.exports = redis;
