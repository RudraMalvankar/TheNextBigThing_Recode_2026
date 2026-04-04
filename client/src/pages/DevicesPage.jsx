import DeviceChart from "../components/DeviceChart";
import GeographyTable from "../components/GeographyTable";
import GeographyGlobe from "../components/GeographyGlobe";
import AcquisitionChart from "../components/AcquisitionChart";

export default function DevicesPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Audience Analytics</h1>
        <p className="text-gray-500 mt-2">
          Deep dive into where your users are coming from and how they access your site.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        <DeviceChart />
        <AcquisitionChart />
        
        {/* Geography Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <GeographyGlobe />
          <GeographyTable />
        </div>
      </div>
    </div>
  );
}
