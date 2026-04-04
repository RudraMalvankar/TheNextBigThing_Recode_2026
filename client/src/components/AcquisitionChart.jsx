import { useState, useEffect } from "react";
import { useSite } from "../context/SiteContext";
import api from "../api";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Globe, ArrowRight, Share2, Target, MousePointer2 } from "lucide-react";

export default function AcquisitionChart() {
  const { activeSite } = useSite();
  const [data, setData] = useState([]);
  const [mode, setMode] = useState("referrers"); // "referrers" or "utm"
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeSite?.siteId) return;
    setLoading(true);
    const endpoint = mode === "referrers" ? "/referrers" : "/referrers/utm";
    
    api.get(`${endpoint}?siteId=${activeSite.siteId}`)
      .then(res => setData(res.data.slice(0, 5)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeSite?.siteId, mode]);

  const COLORS = ['#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308'];

  const getSourceIcon = (source) => {
    const s = source.toLowerCase();
    if (s === "direct") return <ArrowRight size={14} className="text-gray-400" />;
    if (s.includes("google")) return <span className="font-bold text-blue-500">G</span>;
    if (s.includes("facebook")) return <span className="font-bold text-blue-600">f</span>;
    if (s.includes("twitter") || s.includes("x")) return <span className="font-bold text-black">X</span>;
    return mode === "utm" ? <Target size={14} className="text-emerald-500" /> : <Globe size={14} className="text-gray-400" />;
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-xl">
             <Share2 size={20} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="font-black text-gray-900 tracking-tight">Acquisition Radar</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Traffic Origin Analysis</p>
          </div>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-xl">
           <button 
             onClick={() => setMode("referrers")}
             className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${mode === "referrers" ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
           >
             Referrers
           </button>
           <button 
             onClick={() => setMode("utm")}
             className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${mode === "utm" ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
           >
             UTM Sources
           </button>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 animate-pulse font-bold uppercase tracking-widest text-[10px]">Synchronizing Origins...</div>
        ) : data.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
             <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center border border-dashed border-gray-200">
                <Target size={20} className="text-gray-300" />
             </div>
             <p className="text-xs font-bold uppercase tracking-widest">No {mode} data available</p>
          </div>
        ) : (
          <div className="flex flex-col xl:flex-row items-center gap-8 h-full">
            <div className="flex-1 w-full space-y-4">
              {data.map((item, i) => (
                <div key={item.source} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 group-hover:border-emerald-200 transition-colors">
                       {getSourceIcon(item.source)}
                    </div>
                    <div className="flex-1">
                       <p className="text-xs font-black text-gray-900 truncate max-w-[120px]">{item.source}</p>
                       <div className="w-full bg-gray-50 h-1 rounded-full mt-1 overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full transition-all duration-1000" 
                            style={{ width: `${item.percent}%` }}
                          />
                       </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-gray-900">{item.pageviews.toLocaleString()}</p>
                    <p className="text-[9px] font-bold text-emerald-500 uppercase">{item.percent}%</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="w-40 h-40 shrink-0">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={8}
                      dataKey="pageviews"
                      stroke="none"
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={4} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ display: 'none' }}
                    />
                  </PieChart>
               </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <MousePointer2 size={12} className="text-gray-400" />
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Attribution</span>
         </div>
         <span className="text-[10px] font-bold text-gray-900">
            {data.reduce((acc, curr) => acc + curr.pageviews, 0).toLocaleString()} Views
         </span>
      </div>
    </div>
  );
}
