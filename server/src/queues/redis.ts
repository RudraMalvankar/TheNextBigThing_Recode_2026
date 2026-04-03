import Redis, { RedisOptions } from "ioredis";

type RedisTlsMode = "auto" | "on" | "off";

function getTlsMode(): RedisTlsMode {
  const raw = (process.env.REDIS_TLS || "auto").trim().toLowerCase();

  if (raw === "true" || raw === "1" || raw === "on") {
    return "on";
  }

  if (raw === "false" || raw === "0" || raw === "off") {
    return "off";
  }

  return "auto";
}

function shouldUseTls(mode: RedisTlsMode, protocolIsTls: boolean): boolean {
  if (mode === "on") {
    return true;
  }

  if (mode === "off") {
    return false;
  }

  return protocolIsTls;
}

function buildRedisOptions(): RedisOptions {
  const redisUrl = process.env.REDIS_URL?.trim();
  const tlsMode = getTlsMode();

  const base: RedisOptions = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    connectTimeout: 10000,
  };

  if (redisUrl) {
    const parsed = new URL(redisUrl);
    const protocolIsTls = parsed.protocol === "rediss:";
    const tlsEnabled = shouldUseTls(tlsMode, protocolIsTls);

    return {
      ...base,
      host: parsed.hostname,
      port: Number(parsed.port || 6379),
      username: parsed.username ? decodeURIComponent(parsed.username) : undefined,
      password: parsed.password ? decodeURIComponent(parsed.password) : undefined,
      tls: tlsEnabled ? {} : undefined,
    };
  }

  const host = process.env.REDIS_HOST?.trim();
  const portRaw = process.env.REDIS_PORT?.trim();

  if (!host) {
    throw new Error("REDIS_URL or REDIS_HOST must be set");
  }

  const port = Number(portRaw || 6379);
  const tlsEnabled = shouldUseTls(tlsMode, false);

  return {
    ...base,
    host,
    port,
    username: process.env.REDIS_USERNAME?.trim() || undefined,
    password: process.env.REDIS_PASSWORD?.trim() || undefined,
    tls: tlsEnabled ? {} : undefined,
  };
}

export const redis = new Redis(buildRedisOptions());

let sslHintShown = false;

redis.on("error", (error) => {
  const code = (error as NodeJS.ErrnoException).code;

  if (code === "ERR_SSL_WRONG_VERSION_NUMBER") {
    if (!sslHintShown) {
      sslHintShown = true;
      console.error("[Redis] SSL protocol mismatch. Set REDIS_TLS=off for non-TLS redis endpoints, or REDIS_TLS=on for TLS endpoints.");
    }
    return;
  }

  console.error("[Redis] Connection error", error);
});
