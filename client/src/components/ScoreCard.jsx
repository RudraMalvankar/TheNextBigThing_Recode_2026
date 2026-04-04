import { useEffect, useState } from "react";
import api from "../api";
import { Server, Zap, Layers, Activity, Shield, BarChart3 } from "lucide-react";

export default function ScoreCard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const { data } = await api.get("/metrics");
        setMetrics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds) => {
    if (!seconds) return "0h 0m";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const getLatencyColor = (ms) => {
    if (ms < 50) return "text-emerald";
    if (ms < 200) return "text-yellow-400";
    return "text-danger";
  };

  const getQueueColor = (count) => {
    if (count === 0) return "text-emerald";
    if (count < 10) return "text-yellow-400";
    return "text-danger";
  };

  if (loading && !metrics) {
    return (
      <div className="card h-full">
        <h2 className="card-header border-l-2 border-blue-500 pl-3">Server Performance</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-20 skeleton rounded-xl" />)}
        </div>
      </div>
    );
  }

  const items = [
    { label: "Uptime", value: formatUptime(metrics?.uptime), icon: Server, color: "text-blue-400", tip: "Total server uptime since last deployment." },
    { label: "Avg Response", value: `${Math.round(metrics?.avgResponseMs || 0)}ms`, icon: Zap, color: getLatencyColor(metrics?.avgResponseMs), tip: "Average time to process tracking events (target < 50ms)." },
    { label: "Queue Depth", value: metrics?.queueDepth || 0, icon: Layers, color: getQueueColor(metrics?.queueDepth), tip: "Current tasks in Redis/BullMQ. High depth indicates ingestion lag." },
    { label: "Live Sockets", value: metrics?.activeConnections || 0, icon: Activity, color: "text-emerald animate-pulse", tip: "Real-time WebSocket connections for live dashboards." },
    { label: "Bots Blocked", value: metrics?.botEventsBlocked || 0, icon: Shield, color: "text-purple-400", tip: "Automated traffic detected and discarded by the ingestion filter." },
    { label: "Events (24h)", value: (metrics?.eventsLast24h || 0).toLocaleString(), icon: BarChart3, color: "text-gray-300", tip: "Total atomic events (clicks, views) processed in the last 24 hours." }
  ];

  return (
    <div className="card h-full">
      <h2 className="card-header border-l-2 border-blue-500 pl-3">Platform Health</h2>
      
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div 
              key={i} 
              title={item.tip}
              className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex flex-col items-center justify-center text-center group hover:bg-gray-100 transition-all shadow-sm cursor-help"
            >
              <Icon size={20} className={`${item.color} mb-3 opacity-90 transition-opacity`} />
              <div className="text-2xl font-extrabold text-black mb-1 tracking-tighter">{item.value}</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
