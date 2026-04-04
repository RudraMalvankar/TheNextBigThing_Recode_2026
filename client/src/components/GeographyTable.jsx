import { useState, useEffect } from "react";
import { useSite } from "../context/SiteContext";
import api from "../api";
import { Globe2 } from "lucide-react";

export default function GeographyTable() {
  const { activeSite } = useSite();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeSite?.siteId) return;
    setLoading(true);
    api.get("/geography", { params: { siteId: activeSite?.siteId || activeSite } })
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeSite?.siteId]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Globe2 size={18} className="text-emerald-500" /> Geography Data
      </h3>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-gray-400 animate-pulse">Loading location data...</div>
      ) : data.length === 0 ? (
        <div className="py-8 text-center text-gray-500">No geographic data available</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-500 border-b border-gray-100">
                <th className="font-semibold py-3 px-2 w-10 text-center"></th>
                <th className="font-semibold py-3 px-2">Country</th>
                <th className="font-semibold py-3 px-2 text-right">Sessions</th>
                <th className="font-semibold py-3 px-2 text-right">Pageviews</th>
                <th className="font-semibold py-3 px-2 text-right">Bounce Rate</th>
                <th className="font-semibold py-3 px-2 text-right">Avg Pages</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                  <td className="py-3 px-2 text-center text-xl">{row.flag}</td>
                  <td className="py-3 px-2 font-medium text-gray-900">{row.name}</td>
                  <td className="py-3 px-2 text-right font-medium text-emerald-600">
                    {row.sessions.toLocaleString()}
                  </td>
                  <td className="py-3 px-2 text-right text-gray-600">{row.pageviews.toLocaleString()}</td>
                  <td className="py-3 px-2 text-right text-gray-600">{row.bounceRate}%</td>
                  <td className="py-3 px-2 text-right text-gray-600">{row.avgPages}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
