import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DateRangeValue, EventPoint, getEventsByHour } from "../api";
import { Card } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

type TrafficChartProps = {
  siteId: string;
  range: DateRangeValue;
};

export default function TrafficChart({ siteId, range }: TrafficChartProps): JSX.Element {
  const [data, setData] = useState<EventPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const points = await getEventsByHour(siteId, range);
        if (isMounted) {
          setData(points);
        }
      } catch (err) {
        if (isMounted) {
          setError("Unable to load traffic trend");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, [siteId, range]);

  const chartData = useMemo(
    () =>
      data.map((item) => ({
        ...item,
        label: item.hour.slice(11, 16),
      })),
    [data],
  );

  return (
    <Card className="h-[360px]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Traffic Over Time</h3>
        <span className="mono text-xs text-zinc-400">{range}</span>
      </div>

      {loading ? (
        <Skeleton className="h-[280px] w-full" />
      ) : error ? (
        <div className="flex h-[280px] items-center justify-center rounded-xl border border-red-500/40 bg-red-900/10 text-sm text-red-300">
          {error}
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex h-[280px] items-center justify-center rounded-xl border border-zinc-800 text-sm text-zinc-400">
          No traffic data available
        </div>
      ) : (
        <div className="h-[280px] w-full animated-enter">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="label" stroke="#71717a" />
              <YAxis stroke="#71717a" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#11111a",
                  border: "1px solid #3f3f46",
                  borderRadius: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#7c3aed"
                strokeWidth={2}
                fill="url(#trafficGradient)"
                animationDuration={700}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
