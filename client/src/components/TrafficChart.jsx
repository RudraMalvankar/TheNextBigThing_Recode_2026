import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { fetchEvents } from "../api";

export default function TrafficChart({ siteId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchEvents(siteId, "hour", "pageview");
        
        const formatted = res.map((item) => {
          const d = new Date(item.hour);
          const hourStr = d.toLocaleTimeString([], { hour: "numeric" });
          return { ...item, displayTime: hourStr };
        });
        
        setData(formatted);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
    const timer = setInterval(load, 30000); // 30s polling
    return () => clearInterval(timer);
  }, [siteId]);

  if (error) return <div className="card text-danger text-sm flex items-center justify-center p-10">Error loading traffic data</div>;

  return (
    <div className="card h-full flex flex-col">
      <h2 className="card-header border-l-2 border-accent pl-3">Traffic Overview (24h)</h2>
      
      <div className="flex-1 w-full min-h-[250px] relative">
        {loading ? (
          <div className="absolute inset-0 skeleton" />
        ) : data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">No traffic data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#000" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#000" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="displayTime" axisLine={false} tickLine={false} dy={10} tick={{fill: '#94a3b8', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", borderColor: "#e2e8f0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                itemStyle={{ color: "#000", fontWeight: "bold" }}
              />
              <Area type="monotone" dataKey="count" stroke="#000" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
