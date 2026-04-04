import { AlertOctagon } from "lucide-react";

export default function RageClickBadge({ count }) {
  if (!count || count <= 0) return null;

  return (
    <div className="bg-danger/20 border border-danger/30 text-danger px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium animate-pulse">
      <AlertOctagon size={16} />
      <span>{count} Rage Clicks Detected</span>
    </div>
  );
}
