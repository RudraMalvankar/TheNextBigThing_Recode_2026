import { useEffect, useRef, useState } from "react";
import api from "../api";
import { Play, Pause, RotateCcw, Monitor, MousePointer, Image as ImageIcon } from "lucide-react";

export default function SessionReplay({ sessionId, siteId }) {
  const [events, setEvents] = useState([]);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [screenshot, setScreenshot] = useState(null);
  
  const cursorRef = useRef(null);
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const startTimeRef = useRef(0);

  useEffect(() => {
    let isMounted = true;
    const fetchReplay = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/replay/${sessionId}`);
        if (isMounted) {
          setEvents(data.events || []);
          setDuration(data.duration || 0);
          
          if (data.events?.length > 0) {
            const page = data.events[0].page;
             api.get(`/screenshot/${siteId}/${encodeURIComponent(page)}`)
              .then(res => setScreenshot(res.data.image))
              .catch(() => setScreenshot(null));
          }
        }
      } catch (err) {
        console.error("Replay fetch error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    if (sessionId) fetchReplay();
    return () => { isMounted = false; };
  }, [sessionId, siteId]);

  const toggle = () => {
    if (playing) {
      setPlaying(false);
    } else {
      if (progress >= 100) setProgress(0);
      setPlaying(true);
      startTimeRef.current = performance.now() - (progress / 100) * duration;
    }
  };

  useEffect(() => {
    if (!playing || !events.length || !duration) return;

    const animate = (time) => {
      const elapsed = time - startTimeRef.current;
      const currentProgress = (elapsed / duration) * 100;
      
      if (currentProgress >= 100) {
        setProgress(100);
        setPlaying(false);
        return;
      }

      setProgress(currentProgress);
      
      const currentTime = events[0].ts + elapsed;
      const act = events.find((e, idx) => {
        const next = events[idx + 1];
        return e.ts <= currentTime && (!next || next.ts > currentTime);
      });
      
      if (act && act.x !== null && act.y !== null && cursorRef.current && containerRef.current) {
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        cursorRef.current.style.transform = `translate(${act.x * w}px, ${act.y * h}px)`;
        
        if (act.type === "click") {
          cursorRef.current.classList.add("click-ping");
          setTimeout(() => cursorRef.current?.classList.remove("click-ping"), 300);
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [playing, events, duration]);

  if (loading) return <div className="h-full flex items-center justify-center bg-gray-50 rounded-3xl border border-gray-100 animate-pulse text-gray-400 font-bold uppercase tracking-widest text-[10px]">📽 Fetching playback data...</div>;
  if (!events.length) return <div className="h-full flex items-center justify-center bg-white rounded-3xl border border-gray-100 shadow-sm text-gray-400 font-medium">No session data found.</div>;

  return (
    <div className="h-full flex flex-col bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden relative">
      {!playing && progress === 0 && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-md transition-all">
          <button onClick={toggle} className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform ring-8 ring-white/10">
            <Play size={48} className="ml-2" />
          </button>
        </div>
      )}

      {/* Viewport */}
      <div 
        ref={containerRef} 
        className="flex-1 bg-gray-100 relative overflow-hidden cursor-crosshair border-b border-gray-100 flex items-center justify-center"
      >
        {screenshot ? (
          <img 
            src={`data:image/png;base64,${screenshot}`} 
            className="absolute inset-0 w-full h-full object-contain pointer-events-none z-0" 
            alt="Page View"
          />
        ) : (
          <div className="text-center opacity-20">
             <ImageIcon size={64} className="mx-auto mb-4" />
             <p className="font-bold text-xs uppercase tracking-widest">No screenshot for this page</p>
          </div>
        )}

        <div className="absolute inset-0 z-10 bg-black/5 pointer-events-none"></div>
        
        {/* Virtual Cursor */}
        <div 
          ref={cursorRef} 
          className="absolute top-0 left-0 w-12 h-12 pointer-events-none z-50 flex items-center justify-center will-change-transform"
          style={{ transform: "translate(-100px, -100px)" }}
        >
          <div className="relative">
            <MousePointer size={32} className="text-white fill-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
            <div className="absolute -inset-4 bg-emerald-400/30 rounded-full blur-2xl animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 bg-white space-y-6">
        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden cursor-pointer group shadow-inner" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const p = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
          setProgress(p);
          startTimeRef.current = performance.now() - (p / 100) * duration;
          if (!playing) setPlaying(true);
        }}>
          <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-75 relative" style={{ width: `${progress}%` }}>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-4 border-emerald-500 rounded-full shadow-lg"></div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={toggle} 
              className="w-14 h-14 bg-black hover:bg-gray-800 text-white rounded-full flex items-center justify-center transition-all shadow-xl active:scale-95"
            >
              {playing ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
            </button>
            <button 
              onClick={() => { setProgress(0); setPlaying(false); }} 
              className="p-3 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-gray-50"
            >
              <RotateCcw size={24} />
            </button>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Events Captured</span>
                <span className="text-sm font-black text-black">{events.length}</span>
             </div>
             <div className="w-px h-8 bg-gray-100 mx-2"></div>
             <div className="flex flex-col items-start min-w-[60px]">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Duration</span>
                <span className="text-sm font-black text-black">{Math.round(duration / 1000)}s</span>
             </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ping { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(5); opacity: 0; } }
        .click-ping::after { content: ''; position: absolute; width: 40px; height: 40px; border: 4px solid #10b981; border-radius: 50%; left: 50%; top: 50%; margin: -20px 0 0 -20px; animation: ping 0.6s ease-out; }
      `}</style>
    </div>
  );
}
