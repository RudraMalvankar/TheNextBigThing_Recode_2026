const BOT_PATTERNS = [
  "bot", "crawl", "spider", "headless", "phantom", "selenium",
  "puppeteer", "playwright", "googlebot", "bingbot", "wget",
  "curl", "python-requests",
];

module.exports = (req, res, next) => {
  const events = req.body?.events || [];
  const ua = (req.headers["user-agent"] || "").toLowerCase();
  const referrer = req.body?.events?.[0]?.referrer || "";

  let isBot = false;

  if (BOT_PATTERNS.some((p) => ua.includes(p))) {
    isBot = true;
  }

  if (events.length > 50) {
    isBot = true;
  }

  if (events.length > 1) {
    const allSameTs = events.every((e) => e.ts === events[0].ts);
    if (allSameTs) isBot = true;
  }

  if (ua === "" && referrer === "") {
    isBot = true;
  }

  req.isBot = isBot;
  next();
};
