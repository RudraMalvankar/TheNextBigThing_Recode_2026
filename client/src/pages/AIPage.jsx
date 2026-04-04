import { Brain } from "lucide-react";
import AIInsights from "../components/AIInsights";

export default function AIPage() {
  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
          <Brain className="text-purple-500" /> AI Insights
        </h1>
        <p className="text-gray-500 mt-2 font-medium">
          Powered by Gemini • Real intelligence from your visitor data
        </p>
      </header>
      
      <AIInsights />
    </div>
  );
}
