import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import socket from "../socket/socket";
import { fetchLive } from "../api";

export default function LivePulse({ siteId }) {
  const [data, setData] = useState({ activeUsers: 0, pages: [] });
  const [connected, setConnected] = useState(socket.connected);

  useEffect(() => {
    let pollInterval;

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);
    const handleUpdate = (newData) => setData(newData);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("live:update", handleUpdate);

    // Initial fetch + fallback polling if disconnected
    const fetchFallback = async () => {
      if (!socket.connected) {
        try {
          const res = await fetchLive(siteId);
          setData(res);
        } catch (err) {
          console.error(err);
        }
      }
    };

    fetchFallback();
    pollInterval = setInterval(fetchFallback, 3000);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("live:update", handleUpdate);
      clearInterval(pollInterval);
    };
  }, [siteId]);

  return (
    <div className="card h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Activity size={16} className={connected ? "text-emerald animate-pulse" : "text-gray-500"} />
          Live Pulse
        </h2>
        <span className={`text-xs px-2 py-1 rounded-full ${connected ? "bg-emerald/10 text-emerald" : "bg-warning/10 text-warning"}`}>
          {connected ? "Socket connected" : "Polling fallback"}
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-6">
        <div className="relative mb-2">
          {data.activeUsers > 0 && (
            <div className="absolute inset-0 bg-emerald rounded-full blur-xl opacity-20 animate-pulse-live" />
          )}
          <div className="text-5xl font-extrabold text-black relative z-10 flex items-center gap-3 tracking-tighter">
            {data.activeUsers}
            {data.activeUsers > 0 && <span className="h-4 w-4 rounded-full bg-emerald shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse" />}
          </div>
        </div>
        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-4">Active Users</div>
      </div>

      {data.pages.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Top Active Pages</div>
          <div className="space-y-3">
            {data.pages.slice(0, 5).map((p, i) => {
              const maxCount = Math.max(...data.pages.map(x => x.count));
              const width = Math.max(10, (p.count / maxCount) * 100);
              
              return (
                <div key={i} className="relative">
                  <div className="flex justify-between text-xs font-medium text-gray-600 mb-1.5">
                    <span className="truncate pr-4">{p.page}</span>
                    <span className="font-bold text-emerald">{p.count}</span>
                  </div>
                  <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                    <div 
                      className="h-full bg-emerald/60 rounded-full transition-all duration-1000"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
