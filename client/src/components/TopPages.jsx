import { useEffect, useState } from "react";
import { fetchEvents } from "../api";

export default function TopPages({ siteId }) {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchEvents(siteId, "page", "pageview");
        setPages(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
    const timer = setInterval(load, 60000); // 60s polling
    return () => clearInterval(timer);
  }, [siteId]);

  return (
    <div className="card h-full">
      <h2 className="card-header border-l-2 border-emerald pl-3">Top Pages</h2>
      
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 skeleton w-full" />)}
        </div>
      ) : pages.length === 0 ? (
        <div className="text-sm text-gray-500 py-10 text-center">No pageviews recorded yet</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] font-bold text-gray-400 uppercase bg-gray-50/50 tracking-widest">
              <tr>
                <th className="px-6 py-4 rounded-tl-2xl">Page Path</th>
                <th className="px-6 py-4">Total Views</th>
                <th className="px-6 py-4">Unique Sessions</th>
                <th className="px-6 py-4 rounded-tr-2xl">Engagement Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pages.map((p, i) => {
                const engagement = p.views > 0 ? ((p.sessions / p.views) * 100).toFixed(0) : 0;
                return (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0">
                    <td className="px-6 py-4 font-bold text-black">{p.page}</td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{p.views.toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-500">{p.sessions.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="badge badge-blue font-bold px-3">{engagement}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
