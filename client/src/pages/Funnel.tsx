import FunnelChart from "../components/FunnelChart";

type FunnelPageProps = {
  siteId: string;
};

export default function Funnel({ siteId }: FunnelPageProps): JSX.Element {
  return (
    <div className="space-y-6">
      <FunnelChart siteId={siteId} />
    </div>
  );
}
