import { useState, useEffect } from "react";
import { useSite } from "../context/SiteContext";
import api from "../api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Globe, ArrowRight, Share2 } from "lucide-react";

export default function ReferrerChart() {
  const { activeSite } = useSite();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeSite?.siteId) return;
    setLoading(true);
    api.get(`/referrers?siteId=${activeSite.siteId}`)
      .then(res => setData(res.data.slice(0, 5)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeSite?.siteId]);

  const COLORS = ['#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308'];

  const getSourceIcon = (source) => {
    const s = source.toLowerCase();
    if (s === "direct") return <ArrowRight size={14} className="text-gray-400" />;
    if (s.includes("google")) return <span className="font-bold text-blue-500">G</span>;
    if (s.includes("facebook")) return <span className="font-bold text-blue-600">f</span>;
    if (s.includes("twitter") || s.includes("x")) return <span className="font-bold text-black font-serif">X</span>;
    if (s.includes("instagram")) return <span className="font-bold text-pink-500">ig</span>;
    return <Globe size={14} className="text-gray-400" />;
  };

  if (loading) return <div className="h-64 flex items-center justify-center text-gray-400 animate-pulse">Loading sources...</div>;
  if (data.length === 0) return <div className="h-64 flex items-center justify-center text-gray-400">No referrer data yet</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Share2 size={18} className="text-emerald-500" /> Traffic Sources
      </h3>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4">
          {data.map((item, i) => (
            <div key={item.source} className="flex items-center justify-between group">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-6 text-center">{getSourceIcon(item.source)}</div>
                <div className="flex-1 border-b border-dashed border-gray-200 group-hover:border-emerald-300 transition-colors">
                  <span className="font-medium text-gray-800 pr-2 bg-white relative top-2">
                    {item.source}
                  </span>
                </div>
              </div>
              <div className="w-32 flex justify-end gap-4 text-sm relative top-2">
                <span className="font-semibold text-gray-900">{item.pageviews.toLocaleString()}</span>
                <span className="text-emerald-500 font-medium w-10 text-right">{item.percent}%</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="w-full lg:w-48 h-48 lg:h-auto flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="pageviews"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name, props) => [`${value} views`, props.payload.source]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
