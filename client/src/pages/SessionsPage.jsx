import { useState } from "react";
import { Video } from "lucide-react";
import SessionList from "../components/SessionList";
import SessionReplay from "../components/SessionReplay";

export default function SessionsPage({ siteId }) {
  const [replayId, setReplayId] = useState(null);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6 overflow-hidden">
      <div className={`transition-all duration-500 ease-in-out ${replayId ? "lg:w-[400px] shrink-0" : "w-full"}`}>
        <SessionList siteId={siteId} onWatch={setReplayId} activeId={replayId} />
      </div>
      
      {replayId ? (
        <div className="flex-1 h-full animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col bg-gray-50/50 p-4 rounded-3xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between mb-4 px-2">
            <div>
              <h3 className="font-bold flex items-center gap-2 text-xl text-black">🎬 Session Replay</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">ID: {replayId}</p>
            </div>
            <button 
              onClick={() => setReplayId(null)} 
              className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-500 hover:text-black rounded-2xl text-xs font-bold transition-all border border-gray-200 shadow-sm"
            >
              Close Viewer
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <SessionReplay sessionId={replayId} siteId={siteId} />
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Video className="text-gray-300" size={32} />
            </div>
            <p className="text-gray-400 font-medium">Select a session to watch replay</p>
          </div>
        </div>
      )}
    </div>
  );
}
