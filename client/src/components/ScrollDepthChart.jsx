import { useState, useEffect } from "react";
import { useSite } from "../context/SiteContext";
import api from "../api";
import { ArrowDownToLine } from "lucide-react";

export default function ScrollDepthChart() {
  const { activeSite } = useSite();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("/");

  useEffect(() => {
    if (!activeSite?.siteId) return;
    setLoading(true);
    api.get("/scrollmap", { params: { siteId: activeSite?.siteId || activeSite, page } })
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeSite?.siteId, page]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <ArrowDownToLine size={18} className="text-emerald-500" /> Scroll Depth
        </h3>
        
        <input 
          type="text" 
          placeholder="Path e.g. /pricing" 
          value={page}
          onChange={(e) => setPage(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-emerald-500"
        />
      </div>

      {loading ? (
        <div className="h-[400px] flex items-center justify-center animate-pulse text-gray-400">Loading map...</div>
      ) : !data || data.totalSessions === 0 ? (
        <div className="h-[400px] flex items-center justify-center text-gray-500">No scroll data found for this page.</div>
      ) : (
        <div className="flex justify-center">
          <div className="w-full max-w-sm border-2 border-gray-900 rounded-xl overflow-hidden relative shadow-xl bg-white h-[500px]">
            {/* Fake browser header */}
            <div className="h-8 bg-gray-100 border-b border-gray-300 flex items-center px-4 gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
              <div className="ml-4 h-4 bg-white border border-gray-200 rounded w-full max-w-[150px]"></div>
            </div>
            
            {/* Scroll bands container */}
            <div className="absolute top-8 left-0 right-0 bottom-0 flex flex-col">
              {/* Green band - 0-25% */}
              <div className="flex-1 flex flex-col relative group">
                <div className="absolute inset-0 bg-emerald-500 opacity-60"></div>
                <div className="relative z-10 m-auto bg-black/70 text-white text-sm font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition">
                  {data.depths.find(d => d.depth === 25)?.percent || 0}% reached 25%
                </div>
              </div>
              
              {/* Yellow band - 25-50% */}
              <div className="flex-1 flex flex-col relative group border-t border-white/20">
                <div className="absolute inset-0 bg-yellow-500 opacity-60"></div>
                <div className="relative z-10 m-auto bg-black/70 text-white text-sm font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition">
                  {data.depths.find(d => d.depth === 50)?.percent || 0}% reached 50%
                </div>
              </div>
              
              {/* Orange band - 50-75% */}
              <div className="flex-1 flex flex-col relative group border-t border-white/20">
                <div className="absolute inset-0 bg-orange-500 opacity-60"></div>
                <div className="relative z-10 m-auto bg-black/70 text-white text-sm font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition">
                  {data.depths.find(d => d.depth === 75)?.percent || 0}% reached 75%
                </div>
              </div>
              
              {/* Red band - 75-100% */}
              <div className="flex-1 flex flex-col relative group border-t border-white/20">
                <div className="absolute inset-0 bg-red-500 opacity-60"></div>
                <div className="relative z-10 m-auto bg-black/70 text-white text-sm font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition">
                  {data.depths.find(d => d.depth === 100)?.percent || 0}% reached 100%
                  <p className="text-[10px] font-normal text-center mt-1 text-red-200">Most users drop off before here</p>
                </div>
              </div>
            </div>
            
            <div className="absolute -left-6 top-8 bottom-0 w-4 flex flex-col items-center justify-between text-[10px] text-gray-500 py-1">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
