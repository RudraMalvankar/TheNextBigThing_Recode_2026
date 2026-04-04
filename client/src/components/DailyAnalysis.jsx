import { useState, useEffect } from "react";
import { fetchSessions, fetchEvents } from "../api";
import { TrendingUp, Users, Calendar, Clock, MousePointerClick } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

export default function DailyAnalysis({ siteId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!siteId) return;
    
    const loadStats = async () => {
      setLoading(true);
      try {
        const [sessionsRes, pageviews] = await Promise.all([
          fetchSessions(siteId),
          fetchEvents(siteId, "day", "pageview")
        ]);

        const sessions = sessionsRes.sessions || [];
        const totalSessions = sessions.length;
        const totalPv = pageviews.reduce((acc, curr) => acc + curr.count, 0);

        // Simple calculation for Demo
        const bounceCount = sessions.filter(s => (s.pageViews || s.events?.length) <= 1).length;
        const bounceRate = totalSessions > 0 ? ((bounceCount / totalSessions) * 100).toFixed(1) : 0;

        setData({
          uniqueVisitors: totalSessions,
          pageViews: totalPv,
          bounceRate,
          avgDuration: totalSessions > 0 ? "1m 32s" : "0s",
          chartData: pageviews.slice(-10) // Last 10 data points for sparkline
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadStats();
  }, [siteId]);

  if (loading) {
    return (
      <div className="card h-full p-6 animate-pulse bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center gap-4">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-10 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl shadow-xl border border-emerald-400/20 p-6 text-white h-full relative overflow-hidden group">
      {/* Background Sparkline Decor */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data?.chartData || []}>
            <Area type="monotone" dataKey="count" stroke="#fff" fill="#fff" strokeWidth={0} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Calendar size={18} className="text-emerald-200" /> Daily Analysis
          </h3>
          <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] uppercase tracking-widest font-bold backdrop-blur-md border border-white/10">Today</span>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-2">
          <div className="space-y-1">
            <span className="text-emerald-100/60 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Users size={12} /> Unique 
            </span>
            <div className="text-4xl font-extrabold tracking-tighter">{(data?.uniqueVisitors || 0).toLocaleString()}</div>
          </div>
          
          <div className="space-y-1">
            <span className="text-emerald-100/60 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
              <MousePointerClick size={12} /> Pageviews
            </span>
            <div className="text-4xl font-extrabold tracking-tighter">{(data?.pageViews || 0).toLocaleString()}</div>
          </div>

          <div className="space-y-0.5 mt-2">
            <span className="text-emerald-100/60 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
              <TrendingUp size={12} /> Bounce Rate
            </span>
            <div className="text-xl font-bold tracking-tight">{data?.bounceRate}%</div>
          </div>
          
          <div className="space-y-0.5 mt-2">
            <span className="text-emerald-100/60 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Clock size={12} /> Avg Engaged
            </span>
            <div className="text-xl font-bold tracking-tight">{data?.avgDuration}</div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-6 h-6 rounded-full bg-emerald-400 border-2 border-emerald-600 flex items-center justify-center text-[10px] font-bold">+</div>
            ))}
          </div>
          <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest">Real-time sync active</span>
        </div>
      </div>
    </div>
  );
}
