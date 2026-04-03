import { useEffect, useState } from "react";
import { getSuggestions } from "../api";
import { Card } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

type UXSuggestionsProps = {
  siteId: string;
};

function styleForSuggestion(suggestion: string): string {
  if (suggestion.startsWith("⚠️")) {
    return "border-yellow-400/40 bg-yellow-500/10 text-yellow-200";
  }
  if (suggestion.startsWith("📉")) {
    return "border-orange-400/40 bg-orange-500/10 text-orange-200";
  }
  if (suggestion.startsWith("🚨")) {
    return "border-red-400/40 bg-red-500/10 text-red-200";
  }
  if (suggestion.startsWith("🧊")) {
    return "border-blue-400/40 bg-blue-500/10 text-blue-200";
  }
  if (suggestion.startsWith("📜")) {
    return "border-purple-400/40 bg-purple-500/10 text-purple-200";
  }
  return "border-zinc-600 bg-zinc-800/50 text-zinc-200";
}

export default function UXSuggestions({ siteId }: UXSuggestionsProps): JSX.Element {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const data = await getSuggestions(siteId);
        if (mounted) {
          setSuggestions(data);
        }
      } catch (_err) {
        if (mounted) {
          setError("Unable to generate UX suggestions");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [siteId]);

  return (
    <Card>
      <h3 className="mb-4 text-lg font-semibold">UX Suggestions</h3>

      {loading ? (
        <Skeleton className="h-44 w-full" />
      ) : error ? (
        <div className="rounded-xl border border-red-500/40 bg-red-900/10 p-4 text-sm text-red-300">{error}</div>
      ) : suggestions.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 p-4 text-sm text-zinc-400">No major UX issues detected</div>
      ) : (
        <div className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion}-${index}`}
              className={`rounded-xl border p-3 text-sm opacity-0 ${styleForSuggestion(suggestion)}`}
              style={{ animation: `fade-up 0.45s ease ${index * 0.08}s forwards` }}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
