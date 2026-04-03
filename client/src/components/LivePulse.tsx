import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { getLiveData, LiveData } from "../api";
import { socket } from "../socket/socket";
import { Card } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

type LivePulseProps = {
  siteId: string;
};

export default function LivePulse({ siteId }: LivePulseProps): JSX.Element {
  const [live, setLive] = useState<LiveData>({ activeUsers: 0, pages: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSocketLive, setIsSocketLive] = useState(socket.connected);
  const pollRef = useRef<number | null>(null);
  const unauthorizedRef = useRef(false);

  const fetchFallback = useCallback(async () => {
    try {
      const next = await getLiveData(siteId);
      setLive(next);
      setError(null);
      unauthorizedRef.current = false;
    } catch (_error) {
      if (axios.isAxiosError(_error) && _error.response?.status === 401) {
        unauthorizedRef.current = true;
        if (pollRef.current !== null) {
          window.clearInterval(pollRef.current);
          pollRef.current = null;
        }
        setError("Session expired. Please login again.");
        setLoading(false);
        return;
      }

      setError("Live feed unavailable");
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  const startPolling = useCallback(() => {
    if (unauthorizedRef.current) {
      return;
    }

    if (pollRef.current !== null) {
      return;
    }

    pollRef.current = window.setInterval(() => {
      void fetchFallback();
    }, 3000);
  }, [fetchFallback]);

  const stopPolling = useCallback(() => {
    if (pollRef.current !== null) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    void fetchFallback();

    const onConnect = (): void => {
      setIsSocketLive(true);
      stopPolling();
    };

    const onDisconnect = (): void => {
      setIsSocketLive(false);
      startPolling();
    };

    const onLiveUpdate = (payload: LiveData): void => {
      setLive(payload);
      setLoading(false);
      setError(null);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("live:update", onLiveUpdate);

    if (!socket.connected) {
      startPolling();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("live:update", onLiveUpdate);
      stopPolling();
    };
  }, [fetchFallback, startPolling, stopPolling]);

  const maxPageCount = useMemo(
    () => Math.max(...live.pages.map((entry) => entry.count), 1),
    [live.pages],
  );

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Live Pulse</h3>
        <span className={`mono text-xs ${isSocketLive ? "text-emerald-400" : "text-amber-400"}`}>
          {isSocketLive ? "socket" : "polling"}
        </span>
      </div>

      {loading ? (
        <Skeleton className="h-44 w-full" />
      ) : error ? (
        <div className="rounded-xl border border-red-500/40 bg-red-900/10 p-4 text-sm text-red-300">{error}</div>
      ) : (
        <div className="space-y-4 animated-enter">
          <div className="flex items-center gap-3">
            <span className="relative inline-flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500" />
            </span>
            <p className="text-sm text-zinc-200">
              <span className="text-xl font-bold text-emerald-400">{live.activeUsers}</span> users online right now
            </p>
          </div>

          {live.pages.length === 0 ? (
            <div className="rounded-xl border border-zinc-800 p-3 text-sm text-zinc-400">No active pages right now</div>
          ) : (
            <div className="space-y-2">
              {live.pages.map((entry) => (
                <div key={entry.page} className="space-y-1">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span className="mono text-zinc-300">{entry.page}</span>
                    <span>{entry.count}</span>
                  </div>
                  <div className="h-2 rounded bg-zinc-800">
                    <div
                      className="h-2 rounded bg-gradient-to-r from-accent to-emerald-500"
                      style={{ width: `${(entry.count / maxPageCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
