import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSite } from "../context/SiteContext";
import { Eye, MousePointerClick, ShieldAlert, ArrowDown, Activity } from "lucide-react";
import api from "../api";
import io from "socket.io-client";

export default function ActivityFeed() {
  const [feed, setFeed] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const { activeSite } = useSite();

  useEffect(() => {
    const sid = activeSite?.siteId || activeSite;
    if (!sid) return;

    if (!initialLoaded) {
      api.get("/live/history", { params: { siteId: sid } })
        .then(res => {
          if (Array.isArray(res.data)) {
            setFeed(prev => [...prev, ...res.data].slice(0, 50));
          }
        })
        .catch(err => console.error("History fetch error:", err))
        .finally(() => setInitialLoaded(true));
    }

    const socket = io(import.meta.env.VITE_API_URL || "http://localhost:4001", {
      withCredentials: true,
    });

    socket.on("activity:new", (data) => {
      if (data.siteId !== sid) return;
      if (!isPaused) {
        setFeed((prev) => [data, ...prev].slice(0, 50));
      }
    });

    return () => socket.disconnect();
  }, [activeSite?.siteId, isPaused]);

  // Handle timestamp formatting relative to now
  const timeAgo = (dateStr) => {
    const s = Math.round((Date.now() - new Date(dateStr)) / 1000);
    if (s < 10) return "just now";
    if (s < 60) return `${s}s ago`;
    return `${Math.round(s / 60)}m ago`;
  };

  const getIcon = (type, isRage) => {
    if (isRage) return <ShieldAlert size={14} className="text-red-500" />;
    switch (type) {
      case "pageview": return <Eye size={14} className="text-emerald-400" />;
      case "click": return <MousePointerClick size={14} className="text-blue-400" />;
      case "scroll": return <ArrowDown size={14} className="text-purple-400" />;
      default: return <Activity size={14} className="text-gray-400" />;
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-sm text-gray-300 font-mono text-sm overflow-hidden flex flex-col h-[400px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-950 font-sans">
        <h3 className="font-bold text-white tracking-wide text-sm flex items-center gap-2">
          Hacker Feed 
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] uppercase font-bold tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
            LIVE
          </div>
          <button 
            onClick={() => setIsPaused(!isPaused)} 
            className="text-xs px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded transition"
          >
            {isPaused ? "Resume" : "Pause"}
          </button>
          <button 
            onClick={() => setFeed([])} 
            className="text-xs px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded transition"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Feed Area */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-2 relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {feed.length === 0 && (
          <div className="flex h-full items-center justify-center text-gray-500 flex-col gap-2">
            <Activity className="animate-pulse opacity-50" size={24} />
            <p>Waiting for live events...</p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {feed.map((item, i) => (
            <motion.div
              key={`${item.ts}-${i}`}
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`p-2.5 rounded-lg border-l-4 flex items-center justify-between gap-4 bg-gray-800/40 hover:bg-gray-800 transition ${
                item.isRageClick ? 'border-red-500 text-red-100 bg-red-500/5' : 'border-gray-700'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-gray-900 rounded-md">
                  {getIcon(item.type, item.isRageClick)}
                </span>
                
                <span className="truncate">
                  {item.type === "pageview" && (
                    <>User <span className="text-white">••{item.sessionId}</span> from {item.city},{item.country} viewed <span className="text-emerald-300">{item.page}</span></>
                  )}
                  {item.type === "click" && !item.isRageClick && (
                    <>User <span className="text-white">••{item.sessionId}</span> clicked '{item.label}' on <span className="text-blue-300">{item.page}</span></>
                  )}
                  {item.isRageClick && (
                    <><span className="font-bold text-red-500">RAGE CLICK</span> on '{item.label}' — {item.page}</>
                  )}
                  {item.type === "scroll" && (
                    <>User <span className="text-white">••{item.sessionId}</span> scrolled on <span className="text-purple-300">{item.page}</span></>
                  )}
                  {item.type === "custom" && (
                    <>Custom: '{item.label}' on {item.page}</>
                  )}
                </span>
              </div>
              <span className="text-xs text-gray-500 font-sans flex-shrink-0 whitespace-nowrap">
                {timeAgo(item.ts)}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
