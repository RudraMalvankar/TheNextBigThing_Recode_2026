import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import api from "../api";
import { AlertCircle, Plus, Trash2, Layout, ArrowRightCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function FunnelChart({ siteId }) {
  const [availablePages, setAvailablePages] = useState([]);
  const [funnelSteps, setFunnelSteps] = useState(["/", "/pricing", "/register"]); // Default path
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch all tracked pages to populate the builder
    api.get(`/events?siteId=${siteId}&groupBy=page`)
      .then(res => setAvailablePages(res.data))
      .catch(console.error);
    
    calculateFunnel();
  }, [siteId]);

  const calculateFunnel = async (currentSteps = funnelSteps) => {
    setLoading(true);
    try {
      // 2. We'll use a new dynamic calculation endpoint
      const { data } = await api.post("/funnel/calculate", {
        siteId,
        steps: currentSteps
      });
      setStats(data.steps);
    } catch (err) {
      console.error(err);
      toast.error("Failed to calculate funnel drop-off");
    } finally {
      setLoading(false);
    }
  };

  const addStep = (path) => {
    const newSteps = [...funnelSteps, path];
    setFunnelSteps(newSteps);
    calculateFunnel(newSteps);
  };

  const removeStep = (index) => {
    const newSteps = funnelSteps.filter((_, i) => i !== index);
    setFunnelSteps(newSteps);
    calculateFunnel(newSteps);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex items-center justify-between">
        <div>
          <h2 className="font-black text-gray-900 tracking-tight text-xl italic uppercase">Funnel Engine</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Conversion Drop-off Visualizer</p>
        </div>
        <div className="flex items-center gap-2">
           <select 
             onChange={(e) => addStep(e.target.value)}
             className="h-10 px-3 bg-gray-50 border border-gray-200 text-xs font-bold rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
           >
             <option value="">+ Add Funnel Step</option>
             {availablePages.map(p => <option key={p.page} value={p.page}>{p.page}</option>)}
           </select>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        {loading ? (
          <div className="h-full flex items-center justify-center animate-pulse">
             <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Recalculating conversion...</div>
          </div>
        ) : stats.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400">No data for this path</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Visual Chart */}
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={stats} margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="path" type="category" axisLine={false} tickLine={false} tick={false} width={10} />
                  <Tooltip 
                    cursor={{ fill: "rgba(0,0,0,0.02)" }}
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="users" radius={[0, 12, 12, 0]} barSize={40}>
                    {stats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`rgba(16, 185, 129, ${1 - index * 0.15})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* List View with Controls */}
            <div className="space-y-6">
               {stats.map((step, i) => (
                 <div key={i} className="group relative">
                    {i > 0 && (
                      <div className="absolute -top-6 left-6 h-6 border-l-2 border-dashed border-gray-200">
                         <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 bg-red-50 text-red-500 text-[10px] font-black px-2 py-0.5 rounded-full border border-red-100">
                            -{step.dropoff}% LEAK
                         </div>
                      </div>
                    )}
                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex items-center justify-between group-hover:bg-white group-hover:shadow-lg transition-all">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center font-black text-emerald-500 italic">
                             {i + 1}
                          </div>
                          <div>
                             <p className="text-xs font-black text-gray-900 truncate max-w-[200px]">{step.path}</p>
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{step.users} Unique Visitors</p>
                          </div>
                       </div>
                       <button onClick={() => removeStep(i)} className="p-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all">
                          <Trash2 size={16} />
                       </button>
                    </div>
                 </div>
               ))}
               
               {stats.length < 5 && (
                 <div className="border-2 border-dashed border-gray-100 rounded-2xl p-5 flex items-center justify-center text-gray-300 font-bold uppercase tracking-widest text-[10px]">
                    Add more steps to define your path
                 </div>
               )}
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-gray-900 text-white flex items-center justify-between">
         <div className="flex items-center gap-3">
            <ArrowRightCircle className="text-emerald-500" size={24} />
            <div>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">End-to-End Conversion</p>
               <p className="text-xl font-black italic tracking-tight">
                  {stats.length > 0 ? Math.round((stats[stats.length-1].users / stats[0].users) * 100) : 0}% OVERALL SUCCESS
               </p>
            </div>
         </div>
         <div className="bg-emerald-500/20 border border-emerald-500/30 px-4 py-2 rounded-xl flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
            <span className="text-[10px] font-black uppercase tracking-widest">Live Optimization</span>
         </div>
      </div>
    </div>
  );
}
