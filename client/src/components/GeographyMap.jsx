import React, { useState, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup
} from "react-simple-maps";
import api from "../api";
import { Map as MapIcon, Maximize2, Minimize2, ZoomIn, ZoomOut } from "lucide-react";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const getColor = (id) => {
  // Fallback color for regions
  return "#f1f5f9";
};

export default function GeographyMap({ siteId }) {
  const [markers, setMarkers] = useState([]);
  const [geoData, setGeoData] = useState({});
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        const [liveRes, geoRes] = await Promise.all([
          api.get(`/live?siteId=${siteId}`),
          api.get(`/geography?siteId=${siteId}`)
        ]);
        
        if (isMounted) {
          if (liveRes.data.markers) setMarkers(liveRes.data.markers);
          
          // Convert geo array to map for fast lookup
          const gMap = {};
          let maxSessions = 0;
          geoRes.data.forEach(item => {
            gMap[item.country] = item.sessions;
            if (item.sessions > maxSessions) maxSessions = item.sessions;
          });
          setGeoData({ stats: gMap, max: maxSessions });
        }
      } catch (err) {
        console.error("Map data fetch failed:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [siteId]);

  const getColor = (id) => {
    if (!geoData.stats || !geoData.stats[id]) return "#f1f5f9";
    const intensity = geoData.stats[id] / (geoData.max || 1);
    // Return shades of emerald
    if (intensity > 0.8) return "#065f46";
    if (intensity > 0.5) return "#059669";
    if (intensity > 0.2) return "#10b981";
    return "#6ee7b7";
  };

  function handleZoomIn() {
    if (position.zoom >= 8) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom * 2 }));
  }

  function handleZoomOut() {
    if (position.zoom <= 1) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom / 2 }));
  }

  function handleMoveEnd(pos) {
    setPosition(pos);
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col h-[600px] relative">
      <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-xl">
             <MapIcon size={20} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="font-black text-gray-900 tracking-tight">Live Interactive Radar</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Real-time Presence Tracking</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <button 
             onClick={handleZoomIn}
             className="p-2 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors"
           >
             <ZoomIn size={18} className="text-gray-600" />
           </button>
           <button 
             onClick={handleZoomOut}
             className="p-2 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors"
           >
             <ZoomOut size={18} className="text-gray-600" />
           </button>
           <div className="h-4 w-px bg-gray-100 mx-2"></div>
           <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
             {markers.length} LIVE SESSIONS
           </div>
        </div>
      </div>

      <div className="flex-1 bg-[#f8fafc] relative">
        <ComposableMap
          projection="geoMercator"
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={handleMoveEnd}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getColor(geo.properties.ISO_A2 || geo.properties.iso_a2 || geo.id)}
                    stroke="#e2e8f0"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#d1fae5", outline: "none" },
                      pressed: { outline: "none" }
                    }}
                  />
                ))
              }
            </Geographies>
            {(markers || []).map((m, i) => (
              <Marker key={i} coordinates={[m.lng, m.lat]}>
                <g>
                   <circle r={8 / position.zoom} fill="#10b981" opacity={0.3} className="animate-ping" />
                   <circle r={4 / position.zoom} fill="#10b981" />
                </g>
              </Marker>
            ))}
          </ZoomableGroup>
        </ComposableMap>
        
        {/* Map Legend */}
        <div className="absolute bottom-6 left-6 flex flex-col gap-2">
           <div className="bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-white shadow-lg text-[10px] font-bold text-gray-500 flex items-center gap-3">
              <div className="flex items-center gap-1">
                 <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                 <span>Live Access</span>
              </div>
              <div className="flex items-center gap-1">
                 <span className="w-2 h-2 bg-[#059669] rounded-full"></span>
                 <span>High Traffic</span>
              </div>
              <div className="flex items-center gap-1">
                 <span className="w-2 h-2 bg-[#6ee7b7] rounded-full"></span>
                 <span>Low Traffic</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
