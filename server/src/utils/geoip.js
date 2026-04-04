const geoip = require("geoip-lite");

function getGeoData(ip) {
  if (!ip || ip === "::1" || ip === "127.0.0.1") {
    return { country: "IN", city: "Local Project", lat: 20.5937, lng: 78.9629 }; // India
  }
  const geo = geoip.lookup(ip);
  return {
    country: geo?.country || "Unknown",
    city: geo?.city || "",
    lat: geo?.ll?.[0] || null,
    lng: geo?.ll?.[1] || null,
  };
}

module.exports = { getGeoData };
