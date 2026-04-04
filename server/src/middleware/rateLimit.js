const redis = require("../queues/redis");

module.exports = async (req, res, next) => {
  try {
    const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket.remoteAddress;
    const key = "rl:" + ip;

    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, 60);
    }

    if (count > 100) {
      return res.status(429).json({ error: "Too many requests" });
    }

    next();
  } catch (err) {
    console.error("Rate limit error:", err.message);
    next();
  }
};
