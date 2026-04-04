import AlertsManager from "../components/AlertsManager";

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Notification Alerts</h1>
        <p className="text-gray-500 mt-2">
          Monitor your application automatically and receive instant notifications.
        </p>
      </header>

      <AlertsManager />
    </div>
  );
}
