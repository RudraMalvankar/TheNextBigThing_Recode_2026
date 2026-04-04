import { useState, useEffect } from "react";
import { useSite } from "../context/SiteContext";
import api from "../api";
import { Zap, Terminal, Copy } from "lucide-react";
import toast from "react-hot-toast";

export default function CustomEvents() {
  const { activeSite } = useSite();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeSite?.siteId) return;
    setLoading(true);
    api.get("/custom-events", { params: { siteId: activeSite?.siteId || activeSite } })
      .then(res => setEvents(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeSite?.siteId]);

  const copySnippet = () => {
    navigator.clipboard.writeText(`InsightOS.track("button_clicked", { price: 99 })`);
    toast.success("Snippet copied");
  };

  const timeAgo = (dateStr) => {
    const min = Math.round((Date.now() - new Date(dateStr)) / 60000);
    if (min < 60) return `${min}m ago`;
    return `${Math.round(min / 60)}h ago`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Zap size={18} className="text-emerald-500" /> Custom Events
        </h3>
        <button 
          onClick={copySnippet}
          className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 rounded font-medium transition"
        >
          <Terminal size={12} /> View Code
        </button>
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center text-gray-400 animate-pulse">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="py-8 text-center border-2 border-dashed border-gray-100 rounded-xl bg-gray-50">
          <Terminal size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-600 font-medium mb-1">No custom events yet</p>
          <p className="text-sm text-gray-500 mb-4">Track any action via Javascript</p>
          <code className="text-xs bg-gray-900 text-emerald-400 p-2 rounded-lg inline-flex items-center gap-2">
            InsightOS.track("button_clicked")
            <Copy size={12} className="cursor-pointer hover:text-white" onClick={copySnippet} />
          </code>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-500 border-b border-gray-100">
                <th className="font-semibold py-3 px-2">Event Name</th>
                <th className="font-semibold py-3 px-2 text-right">Count</th>
                <th className="font-semibold py-3 px-2 text-right">Unique Sessions</th>
                <th className="font-semibold py-3 px-2 text-right">Last Triggered</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                  <td className="py-3 px-2">
                    <span className="font-mono text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                      {e.event}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right font-medium text-gray-900">{e.count.toLocaleString()}</td>
                  <td className="py-3 px-2 text-right text-gray-500">{e.sessions.toLocaleString()}</td>
                  <td className="py-3 px-2 text-right text-gray-400">{timeAgo(e.lastSeen)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
