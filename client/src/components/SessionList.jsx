import { useEffect, useState } from "react";
import { fetchSessions } from "../api";
import { ChevronDown, ChevronUp, Globe, Clock, Target, Video } from "lucide-react";

const PersonaBadge = ({ persona }) => {
  const map = {
    Buyer: "badge-green",
    Explorer: "badge-blue",
    Bouncer: "badge-red",
    Unknown: "badge-gray"
  };
  return <span className={`badge ${map[persona] || "badge-gray"}`}>{persona}</span>;
};

export default function SessionList({ siteId, onWatch, activeId }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchSessions(siteId);
        setSessions(res.sessions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [siteId]);

  return (
    <div className="card h-full overflow-hidden flex flex-col">
      <h2 className="card-header border-l-2 border-accent pl-3">Recent Sessions</h2>
      
      <div className="flex-1 overflow-auto pr-2 -mr-2">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-16 skeleton w-full" />)}
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-sm text-gray-500 py-10 text-center">No sessions recorded recently.</div>
        ) : (
          <div className="space-y-3">
            {sessions.map(s => (
              <div 
                key={s.sessionId} 
                className={`bg-white rounded-2xl border ${activeId === s.sessionId ? "border-emerald-500 shadow-md ring-1 ring-emerald-500/20" : "border-gray-100"} overflow-hidden transition-all hover:border-black/10 hover:shadow-md group`}
              >
                {/* Header / Summary row */}
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedId(expandedId === s.sessionId ? null : s.sessionId)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center bg-gray-50 shrink-0">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{s.sessionId.slice(0, 4)}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-x-8 gap-y-4 flex-1 min-w-0">
                      <div className="flex flex-col min-w-[70px]">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Country</span>
                        <span className="text-xs font-black text-black">{(s.country === "US" || !s.country) ? "IN" : s.country}</span>
                      </div>
                      
                      <div className="flex flex-col min-w-[50px]">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Views</span>
                        <span className="text-xs font-black text-black">{s.pageViews}</span>
                      </div>
                      
                      <div className="flex flex-col min-w-[120px]">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Intent</span>
                        <span className="text-xs font-black text-black truncate max-w-[120px]">{s.intent}</span>
                      </div>
                      
                      <div className="flex flex-col min-w-[80px]">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Persona</span>
                        <PersonaBadge persona={s.persona} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 ml-4">
                    <div className="flex flex-col items-end hidden sm:flex">
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12}/> Last seen</span>
                      <span className="text-xs text-gray-500">
                        {new Date(s.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {onWatch && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onWatch(s.sessionId); }} 
                        className="text-accent hover:text-accent-light px-2 py-1 rounded bg-accent/10 border border-accent/20 flex items-center gap-1 text-xs transition-colors shadow-sm"
                      >
                        <Video size={14} /> Watch
                      </button>
                    )}
                    <button className="text-gray-500 hover:text-white p-1">
                      {expandedId === s.sessionId ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>
                
                {/* Timeline Expansion */}
                {expandedId === s.sessionId && (
                  <div className="p-6 bg-gray-50 border-t border-gray-100 animate-fade-up">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">User Journey</h4>
                    <div className="space-y-0 text-sm">
                      {s.events && s.events.map((page, i) => (
                        <div key={i} className="flex gap-4 group">
                          <div className="flex flex-col items-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-black/20 group-hover:bg-black ring-4 ring-gray-50 transition-colors z-10" />
                            {i !== s.events.length - 1 && <div className="w-px h-full bg-gray-200 -my-1 group-hover:bg-black/10" />}
                          </div>
                          <div className="pb-5 text-gray-600 w-full hover:text-black font-medium text-xs mt-[-2px]">
                            {page}
                          </div>
                        </div>
                      ))}
                      {(!s.events || s.events.length === 0) && (
                        <span className="text-gray-500 text-xs italic">No page data</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
