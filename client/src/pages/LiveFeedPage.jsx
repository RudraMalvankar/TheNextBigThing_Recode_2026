import { Activity } from "lucide-react";
import ActivityFeed from "../components/ActivityFeed";

export default function LiveFeedPage() {
  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
          <Activity className="text-emerald-500" /> Live Activity Feed
        </h1>
        <p className="text-gray-500 mt-2">
          Watch every user action as it happens in real-time.
        </p>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <ActivityFeed />
      </div>
    </div>
  );
}
