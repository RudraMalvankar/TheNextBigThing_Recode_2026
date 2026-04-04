import { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { Globe } from "lucide-react";
import socket from "../socket/socket";
import { fetchLive } from "../api";

// URL to a simple topojson map of the world
const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

export default function GlobalMap({ siteId }) {
  const [activeUsers, setActiveUsers] = useState(0);
  const [markers, setMarkers] = useState([]);
  const [hoveredMarker, setHoveredMarker] = useState(null);

  useEffect(() => {
    const fetchFallback = async () => {
      if (!socket.connected) {
        try {
          const res = await fetchLive(siteId);
          setActiveUsers(res.activeUsers || 0);
          setMarkers(res.markers || []);
        } catch (err) {}
      }
    };

    const handleUpdate = (data) => {
      setActiveUsers(data.activeUsers || 0);
      setMarkers(data.markers || []);
    };

    socket.on("live:update", handleUpdate);
    fetchFallback();

    return () => socket.off("live:update", handleUpdate);
  }, [siteId]);

  return (
    <div className="card w-full h-[450px] flex flex-col relative overflow-hidden">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Globe size={18} className="text-accent" />
          Global Map
        </h2>
      </div>
      
      <div className="absolute top-4 right-4 z-10 text-[10px] font-bold bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-100 flex items-center gap-2 text-gray-600">
        <span className="w-2 h-2 rounded-full bg-emerald shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></span>
        {activeUsers} LIVE WORLDWIDE
      </div>

      <div className="flex-1 w-full h-full -mt-8 relative">
        <ComposableMap projectionConfig={{ scale: 140 }} style={{ width: "100%", height: "100%" }}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography 
                  key={geo.rsmKey} 
                  geography={geo} 
                   fill="#f1f5f9" 
                  stroke="#e2e8f0" 
                  strokeWidth={0.5} 
                  style={{ default: { outline: "none" }, hover: { outline: "none", fill: "#e2e8f0" }, pressed: { outline: "none" } }}
                />
              ))
            }
          </Geographies>

          {markers.filter(m => m.lat && m.lng).map((marker, i) => (
            <Marker key={i} coordinates={[marker.lng, marker.lat]}>
              <g 
                onMouseEnter={() => setHoveredMarker(marker)}
                onMouseLeave={() => setHoveredMarker(null)}
                className="cursor-pointer"
              >
                <circle r={4} fill="#10b981" opacity={0.9} />
                <circle r={12} fill="#10b981" opacity={0.3}>
                  <animate attributeName="r" from="4" to="20" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" repeatCount="indefinite" />
                </circle>
              </g>
            </Marker>
          ))}
        </ComposableMap>

        {hoveredMarker && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white px-4 py-2.5 border border-gray-100 rounded-xl text-xs text-black shadow-xl animate-fade-up font-bold flex flex-col items-center">
            <span className="">{hoveredMarker.city || hoveredMarker.country}</span>
            <span className="text-[10px] text-gray-400 font-medium">{hoveredMarker.page || hoveredMarker.currentPage}</span>
          </div>
        )}

        {activeUsers === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-sm font-medium text-gray-500 bg-surface/50 px-4 py-2 rounded-full border border-white/5 backdrop-blur-sm">
              Waiting for visitors...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
