import { useState } from "react";
import HeatmapCanvas from "../components/HeatmapCanvas";
import ScrollDepthChart from "../components/ScrollDepthChart";

export default function HeatmapPage({ siteId }) {
  const [activeTab, setActiveTab] = useState("click");

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div className="flex bg-gray-100 p-1 rounded-xl w-max">
        <button 
          onClick={() => setActiveTab("click")} 
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${activeTab === "click" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
        >
          Click Map
        </button>
        <button 
          onClick={() => setActiveTab("scroll")} 
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${activeTab === "scroll" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
        >
          Scroll Map
        </button>
      </div>

      <div className="flex-1">
        {activeTab === "click" ? (
          <HeatmapCanvas siteId={siteId} />
        ) : (
          <ScrollDepthChart />
        )}
      </div>
    </div>
  );
}
