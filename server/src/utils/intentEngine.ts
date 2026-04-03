import { SessionDocument } from "../models/Session";

export function classifyIntent(session: Pick<SessionDocument, "events" | "pageViews">): string {
  const visited = new Set(session.events ?? []);

  if (visited.has("/checkout") || visited.has("/payment")) {
    return "Purchase Intent";
  }

  if (visited.has("/pricing") && !visited.has("/checkout")) {
    return "Research Intent";
  }

  if ((session.pageViews ?? 0) >= 5) {
    return "Explorer Intent";
  }

  if ((session.pageViews ?? 0) === 1) {
    return "Bounce";
  }

  return "Browsing";
}
