import React, { useState, useEffect, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Sphere,
  Graticule
} from "react-simple-maps";
import api from "../api";

// URL for world map topojson - using a very stable CDN version
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function GeographyGlobe({ siteId }) {
  const [markers, setMarkers] = useState([]);
  const [rotation, setRotation] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    // Faux loader for smoother entry
    const timer = setTimeout(() => {
      if (isMounted) setIsLoaded(true);
    }, 1000);

    const fetchMarkers = async () => {
      try {
        const { data } = await api.get(`/live?siteId=${siteId}`);
        if (isMounted && data.markers) {
          setMarkers(data.markers);
        }
      } catch (err) {
        console.error("Marker fetch failed:", err);
      }
    };

    fetchMarkers();
    const interval = setInterval(fetchMarkers, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [siteId]);

  // Handle auto-rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(r => (r + 0.4) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const displayMarkers = useMemo(() => {
    if (markers.length > 0) return markers;
    return [
      { lat: 28.6139, lng: 77.2090, city: "Delhi" },
      { lat: 40.7128, lng: -74.0060, city: "New York" },
      { lat: 19.0760, lng: 72.8777, city: "Mumbai" },
      { lat: 51.5074, lng: -0.1278, city: "London" }
    ];
  }, [markers]);

  return (
    <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8 flex flex-col items-center justify-center relative overflow-hidden h-[520px]">
      <div className="absolute top-8 left-8 z-10 pointer-events-none">
        <div className="flex items-center gap-2 mb-2">
           <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></div>
           <h3 className="font-black text-gray-900 tracking-tight text-xl italic uppercase">Global Radar</h3>
        </div>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Real-time traffic propagation</p>
      </div>

      {!isLoaded && (
        <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm flex items-center justify-center">
           <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Initalizing Radar...</p>
           </div>
        </div>
      )}

      <div className="w-full h-full max-w-[460px] flex items-center justify-center scale-110">
        <ComposableMap
          projection="geoOrthographic"
          projectionConfig={{ scale: 220, rotate: [-rotation, -10, 0] }}
          style={{ width: "100%", height: "100%" }}
        >
          {/* Ocean Blue Sphere */}
          <Sphere stroke="#3b82f6" strokeWidth={0.5} fill="#1d4ed8" />
          <Graticule stroke="#60a5fa" strokeWidth={0.2} />
          
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#15803d"
                  stroke="#052e16"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#166534", outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {displayMarkers.map((m, i) => (
            <Marker key={i} coordinates={[m.lng, m.lat]}>
              <g className="filter drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
                <circle r={6} fill="#f43f5e" opacity={0.4} className="animate-ping" />
                <circle r={3} fill="#ffffff" stroke="#f43f5e" strokeWidth={1} />
              </g>
            </Marker>
          ))}
        </ComposableMap>
      </div>
      
      <div className="absolute bottom-8 right-8 text-right bg-gray-50/50 backdrop-blur px-4 py-2 rounded-2xl border border-gray-100">
         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
         <p className="text-[11px] font-bold text-gray-900 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            Synchronized
         </p>
      </div>
    </div>
  );
}
