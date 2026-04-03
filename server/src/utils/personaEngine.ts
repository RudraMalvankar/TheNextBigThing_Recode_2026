import { PersonaType, SessionDocument } from "../models/Session";

export function classifyPersona(
  session: Pick<SessionDocument, "events" | "pageViews" | "startedAt" | "lastSeen">,
): PersonaType {
  const visited = new Set(session.events ?? []);
  const pageViews = session.pageViews ?? 0;

  if (visited.has("/pricing") && visited.has("/checkout")) {
    return "Buyer";
  }

  if (pageViews >= 4 && visited.size >= 3) {
    return "Explorer";
  }

  const timeOnSiteSeconds =
    (new Date(session.lastSeen).getTime() - new Date(session.startedAt).getTime()) / 1000;

  if (pageViews === 1 || timeOnSiteSeconds < 10) {
    return "Bouncer";
  }

  return "Unknown";
}
