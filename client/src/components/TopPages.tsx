import { useEffect, useMemo, useState } from "react";
import { DateRangeValue, PageMetric, getTopPages } from "../api";
import { Card } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Table, TBody, THead } from "./ui/table";

type TopPagesProps = {
  siteId: string;
  range: DateRangeValue;
};

export default function TopPages({ siteId, range }: TopPagesProps): JSX.Element {
  const [data, setData] = useState<PageMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const rows = await getTopPages(siteId, range);
        if (active) {
          setData(rows);
        }
      } catch (_err) {
        if (active) {
          setError("Failed to load page performance");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [siteId, range]);

  const sorted = useMemo(() => [...data].sort((a, b) => b.views - a.views), [data]);

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Top Pages</h3>
        <span className="mono text-xs text-zinc-400">{sorted.length} pages</span>
      </div>

      {loading ? (
        <Skeleton className="h-52 w-full" />
      ) : error ? (
        <div className="rounded-xl border border-red-500/40 bg-red-900/10 p-4 text-sm text-red-300">{error}</div>
      ) : sorted.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 p-4 text-sm text-zinc-400">No pageviews in selected range</div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <THead>
              <tr>
                <th className="py-2 pr-3">#</th>
                <th className="py-2 pr-3">Page</th>
                <th className="py-2 pr-3">Views</th>
                <th className="py-2 pr-3">Sessions</th>
                <th className="py-2">Engagement</th>
              </tr>
            </THead>
            <TBody>
              {sorted.map((row, index) => {
                const engagement = row.views > 0 ? `${Math.round((row.sessions / row.views) * 100)}%` : "0%";
                return (
                  <tr
                    key={row.page}
                    className={index === 0 ? "border-l-2 border-l-accent bg-accent/10" : undefined}
                  >
                    <td className="py-2 pr-3">{index + 1}</td>
                    <td className="mono py-2 pr-3 text-zinc-200">{row.page}</td>
                    <td className="py-2 pr-3">{row.views}</td>
                    <td className="py-2 pr-3">{row.sessions}</td>
                    <td className="py-2">{engagement}</td>
                  </tr>
                );
              })}
            </TBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
