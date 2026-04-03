import TrafficChart from "../components/TrafficChart";
import TopPages from "../components/TopPages";
import LivePulse from "../components/LivePulse";
import FunnelChart from "../components/FunnelChart";
import TrackingSetupCard from "../components/TrackingSetupCard";
import UXSuggestions from "../components/UXSuggestions";
import { DateRangeValue } from "../api";

type DashboardProps = {
  siteId: string;
  range: DateRangeValue;
};

export default function Dashboard({ siteId, range }: DashboardProps): JSX.Element {
  return (
    <div className="space-y-6">
      <TrackingSetupCard siteId={siteId} />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TrafficChart siteId={siteId} range={range} />
        </div>
        <div>
          <LivePulse siteId={siteId} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <TopPages siteId={siteId} range={range} />
        <FunnelChart siteId={siteId} />
      </div>

      <UXSuggestions siteId={siteId} />
    </div>
  );
}
