import { useState } from 'react';
import { Play, Zap, Info } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

export default function DemoMode({ siteId }) {
  const [loading, setLoading] = useState(false);

  const startDemo = async () => {
    setLoading(true);
    const tId = toast.loading("🚀 Injecting demo traffic...");
    try {
      await api.post('/api/demo/inject', { siteId });
      toast.success("Demo active! Check Live Activity feed.", { id: tId });
    } catch (err) {
      toast.error("Demo injection failed.", { id: tId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Floating Action Button */}
      <button
        onClick={startDemo}
        disabled={loading}
        className="group flex items-center gap-3 px-6 py-3 bg-gray-900 text-white rounded-full shadow-2xl hover:bg-gray-800 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
        ) : (
          <Play size={18} fill="currentColor" />
        )}
        <span className="font-bold text-sm tracking-tight">Start Live Demo</span>
        
        {/* Tooltip on Hover */}
        <div className="absolute bottom-full right-0 mb-4 scale-0 group-hover:scale-100 transition-all origin-bottom-right">
          <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-xl w-64">
            <div className="flex items-center gap-2 mb-2 text-emerald-500">
              <Zap size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Judges Magic</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              Injects 10+ realistic events into the pipeline. Perfect for showing off the Live Activity Feed and AI suggestions during a presentation.
            </p>
          </div>
        </div>
      </button>
      
      {/* Small "Pulse" Indicator */}
      <div className="flex bg-white/80 backdrop-blur-md px-3 py-1 rounded-full border border-gray-100 shadow-sm items-center gap-2">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Demo Mode</span>
      </div>
    </div>
  );
}
