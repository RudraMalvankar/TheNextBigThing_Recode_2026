import crypto from "crypto";

export type AuthUser = {
  email: string;
  name: string;
};

type TokenPayload = AuthUser & {
  sub: string;
  exp: number;
};

const tokenSecret = process.env.JWT_SECRET?.trim() || "change_this_jwt_secret_in_env";
const tokenTTL = process.env.JWT_EXPIRES_IN?.trim() || "12h";

function encode(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function decode(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

function parseDurationSeconds(raw: string): number {
  const normalized = raw.trim().toLowerCase();
  const match = normalized.match(/^(\d+)(s|m|h|d)$/);

  if (!match) {
    return 60 * 60 * 12;
  }

  const value = Number(match[1]);
  const unit = match[2];

  if (unit === "s") {
    return value;
  }
  if (unit === "m") {
    return value * 60;
  }
  if (unit === "h") {
    return value * 60 * 60;
  }
  return value * 60 * 60 * 24;
}

function sign(content: string): string {
  return crypto.createHmac("sha256", tokenSecret).update(content).digest("base64url");
}

export function createAuthToken(user: AuthUser): string {
  const header = encode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload: TokenPayload = {
    sub: user.email,
    email: user.email,
    name: user.name,
    exp: Math.floor(Date.now() / 1000) + parseDurationSeconds(tokenTTL),
  };
  const payloadEncoded = encode(JSON.stringify(payload));
  const content = `${header}.${payloadEncoded}`;
  const signature = sign(content);

  return `${content}.${signature}`;
}

export function verifyAuthToken(token: string): AuthUser | null {
  const parts = token.split(".");

  if (parts.length !== 3) {
    return null;
  }

  const [header, payload, signature] = parts;
  const content = `${header}.${payload}`;
  const expected = sign(content);

  if (signature.length !== expected.length) {
    return null;
  }

  const isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));

  if (!isValid) {
    return null;
  }

  try {
    const parsed = JSON.parse(decode(payload)) as Partial<TokenPayload>;

    if (!parsed.email || !parsed.name || !parsed.exp) {
      return null;
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    if (parsed.exp <= nowSeconds) {
      return null;
    }

    return {
      email: parsed.email,
      name: parsed.name,
    };
  } catch {
    return null;
  }
}

export function getConfiguredCredentials(): { email: string; password: string; name: string } {
  return {
    email: (process.env.AUTH_EMAIL || "admin@insightos.local").trim().toLowerCase(),
    password: (process.env.AUTH_PASSWORD || "admin123").trim(),
    name: (process.env.AUTH_NAME || "Personal Admin").trim(),
  };
}