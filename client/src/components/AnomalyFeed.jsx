import { useEffect, useState } from "react";
import socket from "../socket/socket";
import { AlertTriangle, TrendingUp, TrendingDown, EyeOff, X } from "lucide-react";

export default function AnomalyFeed() {
  const [anomalies, setAnomalies] = useState([]);

  useEffect(() => {
    const handleAnomaly = (data) => {
      const anomaly = { ...data, id: Math.random().toString(36) };
      setAnomalies((prev) => {
        const next = [anomaly, ...prev].slice(0, 10); // Keep last 10
        return next;
      });

      // Auto dismiss
      setTimeout(() => {
        setAnomalies((current) => current.filter((a) => a.id !== anomaly.id));
      }, 8000);
    };

    socket.on("anomaly", handleAnomaly);
    return () => socket.off("anomaly", handleAnomaly);
  }, []);

  const remove = (id) => setAnomalies((prev) => prev.filter((a) => a.id !== id));

  if (anomalies.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 w-80 pointer-events-none">
      {anomalies.map((a) => {
        let Icon = AlertTriangle;
        let colorClasses = "bg-surface-card border-white/10 text-gray-200";
        
        if (a.severity === "info" || a.type === "spike") {
          Icon = TrendingUp;
          colorClasses = "bg-blue-900/30 border-blue-500/30 text-blue-100 ring-1 ring-blue-500/20";
        } else if (a.severity === "warning" || a.type === "drop") {
          Icon = TrendingDown;
          colorClasses = "bg-yellow-900/30 border-yellow-500/30 text-yellow-100 ring-1 ring-yellow-500/20";
        } else if (a.severity === "error" || a.type === "rage" || a.type === "dead") {
          Icon = a.type === "dead" ? EyeOff : AlertTriangle;
          colorClasses = "bg-red-900/30 border-red-500/30 text-red-100 ring-1 ring-red-500/20";
        }

        return (
          <div 
            key={a.id} 
            className={`pointer-events-auto p-4 rounded-xl border backdrop-blur-md shadow-2xl flex items-start gap-3 animate-fade-up ${colorClasses}`}
          >
            <Icon size={18} className={`mt-0.5 shrink-0 ${a.severity === "error" ? "animate-pulse" : ""}`} />
            <div className="flex-1 text-sm font-medium pr-4 leading-snug">
              {a.message}
            </div>
            <button 
              onClick={() => remove(a.id)}
              className="text-white/50 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
