import FunnelChart from "../components/FunnelChart";

export default function FunnelPage({ siteId }) {
  return (
    <div className="h-[calc(100vh-8rem)]">
      <FunnelChart siteId={siteId} />
    </div>
  );
}
