import { useState, useEffect } from "react";
import { useSite } from "../context/SiteContext";
import api from "../api";
import { Brain, Target, Star, AlertTriangle, CheckCircle, Info, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function AIInsights() {
  const { activeSite } = useSite();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInsights = async () => {
    if (!activeSite?.siteId) return;
    setLoading(true);
    try {
      const res = await api.get("/ai/insights", { params: { siteId: activeSite?.siteId || activeSite } });
      setData(res.data);
    } catch (error) {
      console.error("AI Insights Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [activeSite?.siteId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="relative">
          <Brain size={48} className="text-emerald-500 animate-pulse" />
          <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-30 animate-pulse"></div>
        </div>
        <p className="text-gray-500 font-medium animate-pulse">🧠 Gemini is analyzing your site data...</p>
      </div>
    );
  }

  if (!data || !data.insights) {
    return (
      <div className="text-center py-10 text-gray-500">
        No insights available. Ensure traffic is flowing and tracking is active.
      </div>
    );
  }

  const getIconForType = (type) => {
    switch (type) {
      case "critical": return <AlertTriangle className="text-red-500" />;
      case "warning": return <AlertTriangle className="text-amber-500" />;
      case "success": return <CheckCircle className="text-emerald-500" />;
      case "tip": return <Info className="text-blue-500" />;
      default: return <Zap className="text-purple-500" />;
    }
  };

  const getBorderForType = (type) => {
    switch (type) {
      case "critical": return "border-l-4 border-l-red-500";
      case "warning": return "border-l-4 border-l-amber-500";
      case "success": return "border-l-4 border-l-emerald-500";
      case "tip": return "border-l-4 border-l-blue-500";
      default: return "border-l-4 border-l-purple-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center items-center">
          <p className="text-sm text-gray-500 font-medium mb-2 uppercase tracking-widest">Overall Score</p>
          <div className="relative flex items-center justify-center w-24 h-24">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
              <circle
                cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent"
                strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * (data.overallScore || 0)) / 100}
                className="text-emerald-500"
              />
            </svg>
            <span className="absolute text-2xl font-bold">{data.overallScore || 0}</span>
          </div>
        </div>

        <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-6 flex items-start gap-4">
          <div className="p-3 bg-white rounded-xl shadow-sm">
            <Target className="text-emerald-600" />
          </div>
          <div>
            <p className="text-emerald-800 text-sm font-semibold uppercase tracking-widest mb-1">Top Win</p>
            <h4 className="text-lg font-bold text-emerald-950 leading-tight">{data.topWin}</h4>
          </div>
        </div>

        <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6 flex items-start gap-4">
          <div className="p-3 bg-white rounded-xl shadow-sm">
            <Star className="text-blue-600" />
          </div>
          <div>
            <p className="text-blue-800 text-sm font-semibold uppercase tracking-widest mb-1">Top Strength</p>
            <h4 className="text-lg font-bold text-blue-950 leading-tight">{data.topStrength}</h4>
          </div>
        </div>
      </div>

      {/* Main Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${getBorderForType(insight.type)}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                {getIconForType(insight.type)}
                <h3 className="font-bold text-gray-900">{insight.title}</h3>
              </div>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full border border-gray-200">
                {insight.metric}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mb-5 leading-relaxed">{insight.description}</p>
            
            <div className="mt-auto">
              <p className="text-sm font-semibold text-gray-900 group flex items-center cursor-pointer">
                <span className="mr-2 transition-transform group-hover:translate-x-1">→</span>
                {insight.action}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Executive Summary */}
      <div className="bg-gray-900 rounded-2xl shadow-sm border border-gray-800 p-8 text-gray-200 mt-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Brain size={120} />
        </div>
        <div className="relative z-10">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            📋 Executive Summary
          </h3>
          <p className="text-gray-300 leading-relaxed max-w-3xl">
            {data.summary}
          </p>
          <div className="mt-8 flex justify-between items-center">
            <p className="text-xs text-gray-500">Live data analysis generated by Gemini 1.5 Flash</p>
            <button
              onClick={fetchInsights}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-semibold transition"
            >
              Refresh Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
