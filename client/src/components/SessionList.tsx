import { Fragment, useEffect, useMemo, useState } from "react";
import { getSessions, SessionRecord } from "../api";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Table, TBody, THead } from "./ui/table";

type SessionListProps = {
  siteId: string;
};

function personaClass(persona: SessionRecord["persona"]): string {
  if (persona === "Buyer") {
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
  }
  if (persona === "Explorer") {
    return "border-blue-500/40 bg-blue-500/10 text-blue-300";
  }
  if (persona === "Bouncer") {
    return "border-red-500/40 bg-red-500/10 text-red-300";
  }
  return "border-zinc-600 bg-zinc-700/20 text-zinc-300";
}

function timelineWithEstimate(session: SessionRecord): Array<{ page: string; time: string }> {
  const start = new Date(session.startedAt).getTime();
  const end = new Date(session.lastSeen).getTime();
  const span = Math.max(end - start, 0);
  const steps = Math.max(session.events.length - 1, 1);

  return session.events.map((page, index) => {
    const at = new Date(start + (span / steps) * index);
    return {
      page,
      time: at.toLocaleTimeString(),
    };
  });
}

export default function SessionList({ siteId }: SessionListProps): JSX.Element {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const rows = await getSessions(siteId);
        if (mounted) {
          setSessions(rows);
        }
      } catch (_err) {
        if (mounted) {
          setError("Failed to load sessions");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [siteId]);

  const content = useMemo(() => sessions, [sessions]);

  return (
    <Card>
      <h3 className="mb-4 text-lg font-semibold">Session Explorer</h3>

      {loading ? (
        <Skeleton className="h-60 w-full" />
      ) : error ? (
        <div className="rounded-xl border border-red-500/40 bg-red-900/10 p-4 text-sm text-red-300">{error}</div>
      ) : content.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 p-4 text-sm text-zinc-400">No sessions found</div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <THead>
              <tr>
                <th className="py-2 pr-2">Session ID</th>
                <th className="py-2 pr-2">Country</th>
                <th className="py-2 pr-2">Pages</th>
                <th className="py-2 pr-2">Persona</th>
                <th className="py-2">Last Seen</th>
              </tr>
            </THead>
            <TBody>
              {content.map((session) => {
                const isOpen = expanded === session.sessionId;
                const timeline = timelineWithEstimate(session);

                return (
                  <Fragment key={session.sessionId}>
                    <tr
                      className="cursor-pointer hover:bg-zinc-900/50"
                      onClick={() => setExpanded(isOpen ? null : session.sessionId)}
                    >
                      <td className="mono py-2 pr-2 text-zinc-300">{session.sessionId.slice(0, 12)}...</td>
                      <td className="py-2 pr-2">{session.country || "Unknown"}</td>
                      <td className="py-2 pr-2">{session.pageViews}</td>
                      <td className="py-2 pr-2">
                        <Badge className={personaClass(session.persona)}>{session.persona}</Badge>
                      </td>
                      <td className="py-2">{new Date(session.lastSeen).toLocaleString()}</td>
                    </tr>

                    {isOpen && (
                      <tr>
                        <td colSpan={5} className="bg-zinc-950/60 px-4 py-3">
                          <ol className="space-y-2">
                            {timeline.map((entry, index) => (
                              <li key={`${session.sessionId}-${entry.page}-${index}`} className="flex items-center justify-between text-sm">
                                <span className="mono text-zinc-300">{entry.page}</span>
                                <span className="text-zinc-500">{entry.time}</span>
                              </li>
                            ))}
                          </ol>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </TBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
