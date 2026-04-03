import axios from "axios";

const rawApiUrl = import.meta.env.VITE_API_URL?.trim();
const baseURL = rawApiUrl ? `${rawApiUrl.replace(/\/$/, "")}/api` : "/api";

const api = axios.create({
  baseURL,
  timeout: 10000,
});

export type AuthUser = {
  email: string;
  name: string;
};

export function setAuthToken(token: string | null): void {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete api.defaults.headers.common.Authorization;
}

export async function loginWithPassword(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
  const response = await api.post<{ token: string; user: AuthUser }>("/auth/login", {
    email,
    password,
  });
  return response.data;
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await api.get<{ user: AuthUser }>("/auth/me");
  return response.data.user;
}

export type DateRangeValue = "24h" | "7d" | "30d";

export type EventPoint = {
  hour: string;
  count: number;
};

export type PageMetric = {
  page: string;
  views: number;
  sessions: number;
};

export type LiveData = {
  activeUsers: number;
  pages: Array<{ page: string; count: number }>;
};

export type FunnelRow = {
  step: string;
  path: string;
  users: number;
  dropoff: string | null;
};

export type HeatmapPoint = {
  x: number | null;
  y: number | null;
  isRageClick: boolean;
};

export type HeatmapData = {
  clicks: HeatmapPoint[];
  total: number;
};

export type SessionRecord = {
  sessionId: string;
  startedAt: string;
  lastSeen: string;
  pageViews: number;
  currentPage: string;
  country: string;
  persona: "Explorer" | "Buyer" | "Bouncer" | "Unknown";
  events: string[];
};

function rangeToFromDate(range: DateRangeValue): string {
  const now = Date.now();
  const offset = range === "24h" ? 24 : range === "7d" ? 24 * 7 : 24 * 30;
  return new Date(now - offset * 60 * 60 * 1000).toISOString();
}

export function buildRangeParams(range: DateRangeValue): { from: string; to: string } {
  return {
    from: rangeToFromDate(range),
    to: new Date().toISOString(),
  };
}

export async function getEventsByHour(siteId: string, range: DateRangeValue): Promise<EventPoint[]> {
  const { from, to } = buildRangeParams(range);
  const response = await api.get<EventPoint[]>("/events", {
    params: {
      siteId,
      groupBy: "hour",
      type: "pageview",
      from,
      to,
    },
  });
  return response.data;
}

export async function getTopPages(siteId: string, range: DateRangeValue): Promise<PageMetric[]> {
  const { from, to } = buildRangeParams(range);
  const response = await api.get<PageMetric[]>("/events", {
    params: {
      siteId,
      groupBy: "page",
      from,
      to,
    },
  });
  return response.data;
}

export async function getLiveData(siteId: string): Promise<LiveData> {
  const response = await api.get<LiveData>("/live", {
    params: { siteId },
  });
  return response.data;
}

export async function getFunnel(siteId: string): Promise<FunnelRow[]> {
  const response = await api.get<FunnelRow[]>("/funnel", {
    params: { siteId },
  });
  return response.data;
}

export async function getHeatmap(siteId: string, page: string): Promise<HeatmapData> {
  const response = await api.get<HeatmapData>("/heatmap", {
    params: { siteId, page },
  });
  return response.data;
}

export async function getSessions(siteId: string): Promise<SessionRecord[]> {
  const response = await api.get<{ sessions: SessionRecord[] }>("/sessions", {
    params: { siteId },
  });
  return response.data.sessions;
}

export async function getSuggestions(siteId: string): Promise<string[]> {
  const response = await api.get<{ suggestions: string[] }>("/suggestions", {
    params: { siteId },
  });
  return response.data.suggestions;
}
