import { useState, useEffect } from "react";
import { useSite } from "../context/SiteContext";
import api from "../api";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Laptop, Smartphone, MonitorSmartphone } from "lucide-react";

export default function DeviceChart() {
  const { activeSite } = useSite();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeSite?.siteId) return;
    setLoading(true);
    api.get("/devices", { params: { siteId: activeSite?.siteId || activeSite } })
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeSite?.siteId]);

  if (loading) return <div className="h-64 flex items-center justify-center text-gray-400 animate-pulse">Loading audience data...</div>;
  if (!data) return null;

  const COLORS = {
    devices: ['#10b981', '#3b82f6', '#8b5cf6'],
    browsers: ['#f59e0b', '#ec4899', '#06b6d4', '#84cc16'],
    os: ['#3b82f6', '#10b981', '#6366f1', '#f43f5e'],
    screens: ['#6366f1', '#8b5cf6', '#ec4899'],
    languages: ['#14b8a6', '#0ea5e9', '#6366f1']
  };

  const renderChart = (title, items, colors) => (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col items-center">
      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">{title}</h4>
      <div className="h-40 w-full mb-6 relative">
        {!items || items.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">No data</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={items}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={4}
                dataKey="count"
                stroke="none"
              >
                {items.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="w-full space-y-3">
        {items?.slice(0, 3).map((item, i) => (
          <div key={item.name} className="flex items-center justify-between text-[11px] font-bold">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i % colors.length] }}></span>
              <span className="text-gray-500 uppercase tracking-tight">{item.name}</span>
            </div>
            <span className="text-gray-900">{item.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {renderChart("Devices", data.devices, COLORS.devices)}
        {renderChart("Browsers", data.browsers, COLORS.browsers)}
        {renderChart("OS", data.os, COLORS.os)}
        {renderChart("Resolution", data.screens, COLORS.screens)}
        {renderChart("Language", data.languages, COLORS.languages)}
      </div>
    </div>
  );
}
