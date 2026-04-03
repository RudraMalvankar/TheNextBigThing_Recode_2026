import { useEffect, useState } from "react";
import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FunnelRow, getFunnel } from "../api";
import { Card } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

type FunnelChartProps = {
  siteId: string;
};

export default function FunnelChart({ siteId }: FunnelChartProps): JSX.Element {
  const [rows, setRows] = useState<FunnelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load(): Promise<void> {
      setLoading(true);
      setError(null);
      try {
        const data = await getFunnel(siteId);
        if (mounted) {
          setRows(data);
        }
      } catch (_err) {
        if (mounted) {
          setError("Unable to load funnel");
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
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Conversion Funnel</h3>
      </div>

      {loading ? (
        <Skeleton className="h-72 w-full" />
      ) : error ? (
        <div className="rounded-xl border border-red-500/40 bg-red-900/10 p-4 text-sm text-red-300">{error}</div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 p-4 text-sm text-zinc-400">No funnel steps configured</div>
      ) : (
        <div className="space-y-4 animated-enter">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} layout="vertical" margin={{ left: 30, right: 20 }}>
                <XAxis type="number" stroke="#71717a" />
                <YAxis dataKey="step" type="category" stroke="#71717a" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#11111a",
                    border: "1px solid #3f3f46",
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="users" fill="#7c3aed" radius={[8, 8, 8, 8]}>
                  <LabelList dataKey="users" position="insideRight" fill="#ffffff" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {rows.map((row) => (
              <div key={row.step} className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>{row.step}</span>
                  <span className="mono text-zinc-300">{row.users}</span>
                </div>
                <div className="mt-1 text-xs text-red-300">
                  Drop-off: {row.dropoff === null ? "-" : `${row.dropoff}%`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
