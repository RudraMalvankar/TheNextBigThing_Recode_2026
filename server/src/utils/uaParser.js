const UAParser = require("ua-parser-js");

function parseUA(uaString) {
  if (!uaString) {
    return { browser: "Unknown", os: "Unknown", device: "desktop" };
  }
  const parser = new UAParser(uaString);
  const result = parser.getResult();
  return {
    browser: result.browser.name || "Unknown",
    os: result.os.name || "Unknown",
    device: result.device.type || "desktop", // mobile/tablet/desktop
  };
}

module.exports = { parseUA };
