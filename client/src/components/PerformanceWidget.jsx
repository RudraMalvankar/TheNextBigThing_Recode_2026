import { useState, useEffect } from "react";
import { useSite } from "../context/SiteContext";
import api from "../api";
import { Gauge } from "lucide-react";

export default function PerformanceWidget() {
  const { activeSite } = useSite();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeSite?.siteId) return;
    setLoading(true);
    api.get(`/api/performance?siteId=${activeSite.siteId}`)
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeSite?.siteId]);

  if (loading) return <div className="h-32 flex items-center justify-center text-gray-400 animate-pulse">Loading performance metrics...</div>;
  if (!data || data.samples === 0) return null;

  const getStatusColor = (val, thresholds) => {
    if (val < thresholds[0]) return "text-emerald-500 bg-emerald-50 border-emerald-100";
    if (val < thresholds[1]) return "text-amber-500 bg-amber-50 border-amber-100";
    return "text-red-500 bg-red-50 border-red-100";
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Gauge size={18} className="text-emerald-500" /> Performance
        <span className="ml-auto text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {data.samples} samples
        </span>
      </h3>

      <div className="grid grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl border ${getStatusColor(data.ttfb, [200, 500])}`}>
          <p className="text-xs uppercase font-bold opacity-70 mb-1">TTFB</p>
          <p className="text-2xl font-bold">{data.ttfb} <span className="text-sm font-normal opacity-70">ms</span></p>
        </div>
        
        <div className={`p-4 rounded-xl border ${getStatusColor(data.domLoad, [1000, 3000])}`}>
          <p className="text-xs uppercase font-bold opacity-70 mb-1">DOM Load</p>
          <p className="text-2xl font-bold">{(data.domLoad / 1000).toFixed(1)} <span className="text-sm font-normal opacity-70">s</span></p>
        </div>
        
        <div className={`p-4 rounded-xl border ${getStatusColor(data.fullLoad, [2000, 5000])}`}>
          <p className="text-xs uppercase font-bold opacity-70 mb-1">Full Load</p>
          <p className="text-2xl font-bold">{(data.fullLoad / 1000).toFixed(1)} <span className="text-sm font-normal opacity-70">s</span></p>
        </div>
      </div>
    </div>
  );
}
