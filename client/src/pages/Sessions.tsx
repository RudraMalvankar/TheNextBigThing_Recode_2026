import SessionList from "../components/SessionList";

type SessionsPageProps = {
  siteId: string;
};

export default function Sessions({ siteId }: SessionsPageProps): JSX.Element {
  return (
    <div className="space-y-6">
      <SessionList siteId={siteId} />
    </div>
  );
}
