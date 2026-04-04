import { useState, useEffect } from "react";
import { useSite } from "../context/SiteContext";
import api from "../api";
import { Bell, BellOff, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AlertsManager() {
  const { activeSite } = useSite();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [metric, setMetric] = useState("bounce_rate");
  const [condition, setCondition] = useState("above");
  const [threshold, setThreshold] = useState("");

  const fetchAlerts = async () => {
    if (!activeSite?.siteId) return;
    setLoading(true);
    try {
      const res = await api.get("/alerts", { params: { siteId: activeSite?.siteId || activeSite } });
      setAlerts(res.data);
    } catch (error) {
      toast.error("Failed to fetch alerts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [activeSite?.siteId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name || !threshold) return toast.error("Please fill all fields");
    
    try {
      const res = await api.post("/alerts", {
        siteId: activeSite?.siteId || activeSite,
        name,
        metric,
        condition,
        threshold: Number(threshold)
      });
      setAlerts([res.data, ...alerts]);
      setName("");
      setThreshold("");
      toast.success("Alert created successfully");
    } catch (error) {
      toast.error("Failed to create alert");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/alerts/${id}`);
      setAlerts(alerts.filter((a) => a._id !== id));
      toast.success("Alert deleted");
    } catch (error) {
      toast.error("Failed to delete alert");
    }
  };

  const getMetricName = (m) => m.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
          <Bell className="text-emerald-600" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Smart Alerts</h3>
          <p className="text-sm text-gray-500">Get notified when metrics cross your custom thresholds</p>
        </div>
      </div>

      <form onSubmit={handleCreate} className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-8 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Alert Name</label>
          <input 
            type="text" 
            placeholder="e.g. Traffic Spike" 
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:border-emerald-500 outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        
        <div className="w-32">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Metric</label>
          <select 
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white"
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
          >
            <option value="bounce_rate">Bounce Rate</option>
            <option value="active_users">Active Users</option>
            <option value="rage_clicks">Rage Clicks</option>
            <option value="funnel_drop">Funnel Drop</option>
          </select>
        </div>

        <div className="w-24">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Condition</label>
          <select 
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          >
            <option value="above">Above</option>
            <option value="below">Below</option>
          </select>
        </div>

        <div className="w-24">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Threshold</label>
          <input 
            type="number" 
            placeholder="e.g. 80" 
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:border-emerald-500 outline-none"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
          />
        </div>

        <button 
          type="submit" 
          className="h-10 px-4 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition flex items-center gap-2 whitespace-nowrap"
        >
          <Plus size={16} /> Create
        </button>
      </form>

      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Active Alerts ({alerts.length})</h4>
        
        {loading ? (
          <div className="py-4 text-center text-gray-400 animate-pulse">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="py-8 text-center border-2 border-dashed border-gray-100 rounded-xl">
            <BellOff className="mx-auto text-gray-300 mb-2" size={24} />
            <p className="text-gray-500 text-sm">No alerts configured yet</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm transition bg-white">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${alert.triggered ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                <div>
                  <h5 className="font-bold text-gray-900 text-sm">{alert.name}</h5>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Trigger when <span className="font-semibold text-gray-700">{getMetricName(alert.metric)}</span> is {alert.condition} <span className="font-semibold text-gray-700">{alert.threshold}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {alert.triggered && (
                  <span className="text-xs font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded-full uppercase tracking-widest border border-red-100">
                    Triggered
                  </span>
                )}
                <button 
                  onClick={() => handleDelete(alert._id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
