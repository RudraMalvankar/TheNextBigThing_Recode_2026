import TrafficChart from "../components/TrafficChart";
import TopPages from "../components/TopPages";
import LivePulse from "../components/LivePulse";
import UXSuggestions from "../components/UXSuggestions";
import InsightScore from "../components/InsightScore";
import ScoreCard from "../components/ScoreCard";
import DailyAnalysis from "../components/DailyAnalysis";
import ActivityFeed from "../components/ActivityFeed";
import AIInsights from "../components/AIInsights";
import AcquisitionChart from "../components/AcquisitionChart";
import DeviceChart from "../components/DeviceChart";

export default function Dashboard({ siteId }) {
  return (
    <div className="space-y-6 pb-12 w-full">
      {/* 1. TOP STATS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <InsightScore siteId={siteId} />
        <DailyAnalysis siteId={siteId} />
        <ScoreCard siteId={siteId} />
      </div>

      {/* 2. TRAFFIC CHART + LIVE PULSE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TrafficChart siteId={siteId} />
        </div>
        <div>
          <LivePulse siteId={siteId} />
        </div>
      </div>
      
      {/* 3. ACTIVITY FEED */}
      <div>
        <ActivityFeed />
      </div>

      {/* 4. AI INSIGHTS PREVIEW */}
      <div>
        <AIInsights />
      </div>

      {/* 5. TOP PAGES + ACQUISITION CHART */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TopPages siteId={siteId} />
        <AcquisitionChart />
      </div>

      {/* 6. DEVICE CHART */}
      <div>
        <DeviceChart />
      </div>

      {/* 7. SCORECARDS + ANOMALY FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[400px]">
          <UXSuggestions siteId={siteId} />
        </div>
      </div>
    </div>
  );
}
