import { useEffect, useState, useRef } from "react";
import api from "../api";
import { Award, Lock } from "lucide-react";

export default function InsightScore({ siteId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animScore, setAnimScore] = useState(0);

  useEffect(() => {
    const fetchScore = async () => {
      try {
        const res = await api.get("/score", { params: { siteId } });
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (siteId) fetchScore();
    
    const interval = setInterval(fetchScore, 30000);
    return () => clearInterval(interval);
  }, [siteId]);

  useEffect(() => {
    if (data?.score !== undefined) {
      // Animate score from 0
      let start = 0;
      const target = data.score;
      const stepTime = Math.max(20, Math.floor(1000 / target)); // 1s total animation
      
      const timer = setInterval(() => {
        start += 1;
        setAnimScore(start);
        if (start >= target) clearInterval(timer);
      }, stepTime);
      return () => clearInterval(timer);
    }
  }, [data?.score]);

  if (loading && !data) return <div className="card h-full flex items-center justify-center"><div className="skeleton w-32 h-32 rounded-full" /></div>;
  if (!data) return null;

  const getScoreColor = (score) => {
    if (score >= 80) return "#10b981"; // emerald
    if (score >= 60) return "#facc15"; // yellow
    if (score >= 40) return "#f97316"; // orange
    return "#ef4444"; // red
  };

  const getScoreShadow = (score) => {
    const hex = getScoreColor(score);
    return `drop-shadow(0 0 12px ${hex}40)`;
  };

  const color = getScoreColor(animScore);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animScore / 100) * circumference;

  return (
    <div className="card h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h2 className="card-header border-none pl-0 mb-0 leading-none">Insight Score</h2>
        <span className="text-[10px] text-gray-500 uppercase flex items-center gap-1"><Award size={12}/> Gamified Analytics</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-4 relative">
        <svg fill="none" width="160" height="160" viewBox="0 0 120 120" style={{ filter: getScoreShadow(animScore) }}>
          {/* Background circle */}
          <circle cx="60" cy="60" r={radius} stroke="#f1f5f9" strokeWidth="8" />
          {/* Animated progress circle */}
          <circle 
            cx="60" 
            cy="60" 
            r={radius} 
            stroke={color} 
            strokeWidth="8" 
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-300 ease-out origin-center -rotate-90"
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center mt-2">
          <div className="text-4xl font-extrabold tracking-tighter" style={{ color }}>{animScore}</div>
          <div className="text-xs font-semibold" style={{ color }}>Grade {data.grade}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-2">
        {data.achievements?.map((ach, i) => (
          <div 
            key={i} 
            title={ach.name}
            className={`p-2 rounded-xl flex flex-col items-center text-center justify-center border relative transition-all ${
              ach.unlocked 
                ? "bg-gray-50 border-gray-100 opacity-100 hover:scale-105 shadow-sm" 
                : "bg-white border-dashed border-gray-200 opacity-30 grayscale"
            }`}
          >
            <div className="text-xl mb-1">{ach.icon}</div>
            <div className="text-[9px] font-medium leading-tight truncate w-full">{ach.name}</div>
            {!ach.unlocked && <Lock size={10} className="absolute top-1 right-1 text-gray-500" />}
          </div>
        ))}
      </div>
    </div>
  );
}
