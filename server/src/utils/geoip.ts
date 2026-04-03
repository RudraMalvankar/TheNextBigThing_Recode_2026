import geoip from "geoip-lite";

function normalizeIp(ip: string): string {
  if (!ip) {
    return "";
  }

  const first = ip.split(",")[0]?.trim() ?? "";
  if (first === "::1") {
    return "127.0.0.1";
  }

  if (first.startsWith("::ffff:")) {
    return first.replace("::ffff:", "");
  }

  return first;
}

export function getCountry(ip: string): string {
  const normalized = normalizeIp(ip);
  if (!normalized) {
    return "Unknown";
  }

  const found = geoip.lookup(normalized);
  return found?.country ?? "Unknown";
}
