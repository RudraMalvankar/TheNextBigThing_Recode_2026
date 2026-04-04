import { useEffect, useState } from "react";
import { fetchSuggestions } from "../api";
import { AlertCircle, HelpCircle, Activity, Layout, EyeOff, RefreshCw } from "lucide-react";

export default function UXSuggestions({ siteId }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetchSuggestions(siteId);
      setSuggestions(res.suggestions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [siteId]);

  const getIconAndColor = (text) => {
    if (text.startsWith("⚠️")) return { icon: AlertCircle, color: "text-amber-600 border-amber-100 bg-amber-50", p: text.slice(2) };
    if (text.startsWith("📉")) return { icon: Activity, color: "text-orange-600 border-orange-100 bg-orange-50", p: text.slice(2) };
    if (text.startsWith("🚨")) return { icon: AlertCircle, color: "text-red-600 border-red-100 bg-red-50", p: text.slice(2) };
    if (text.startsWith("🧊")) return { icon: EyeOff, color: "text-blue-600 border-blue-100 bg-blue-50", p: text.slice(2) };
    if (text.startsWith("📜")) return { icon: Layout, color: "text-purple-600 border-purple-100 bg-purple-50", p: text.slice(2) };
    return { icon: HelpCircle, color: "text-gray-500 border-gray-100 bg-gray-50", p: text };
  };

  return (
    <div className="card h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 border-l-2 border-amber-500 pl-3">
        <h2 className="card-header border-none pl-0 mb-0">AI UX Suggestions</h2>
        <button 
          onClick={load} 
          disabled={loading}
          className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-surface-hover transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="flex-1 overflow-auto -mr-2 pr-2 space-y-3">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-14 skeleton w-full rounded-lg" />)
        ) : suggestions.length === 0 ? (
          <div className="text-sm text-gray-500 py-6 text-center border shadow-sm border-white/5 rounded-lg bg-surface-hover/20">
            No actionable suggestions right now.<br/>Your UX is looking solid!
          </div>
        ) : (
          suggestions.map((s, i) => {
            const { icon: Icon, color, p } = getIconAndColor(s);
            return (
              <div 
                key={i} 
                className={`p-4 rounded-xl border flex items-start gap-3 animate-fade-up shadow-sm font-medium ${color}`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <Icon size={18} className="mt-0.5 shrink-0" />
                <span className="text-sm">{p}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
