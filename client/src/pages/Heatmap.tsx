import { useEffect, useMemo, useState } from "react";
import HeatmapOverlay from "../components/HeatmapOverlay";
import { DateRangeValue, getTopPages } from "../api";
import { Select } from "../components/ui/select";

type HeatmapPageProps = {
  siteId: string;
  range: DateRangeValue;
};

export default function Heatmap({ siteId, range }: HeatmapPageProps): JSX.Element {
  const [pages, setPages] = useState<string[]>([]);
  const [selectedPage, setSelectedPage] = useState("/");

  useEffect(() => {
    let mounted = true;

    async function loadPages(): Promise<void> {
      try {
        const metrics = await getTopPages(siteId, range);
        const options = metrics.map((item) => item.page);

        if (mounted) {
          const next = options.length > 0 ? options : ["/"];
          setPages(next);
          if (!next.includes(selectedPage)) {
            setSelectedPage(next[0]);
          }
        }
      } catch (_error) {
        if (mounted) {
          setPages(["/"]);
          setSelectedPage("/");
        }
      }
    }

    void loadPages();

    return () => {
      mounted = false;
    };
  }, [siteId, range, selectedPage]);

  const options = useMemo(() => pages.map((page) => ({ label: page, value: page })), [pages]);

  return (
    <div className="space-y-4">
      <div className="max-w-sm">
        <Select value={selectedPage} onChange={setSelectedPage} options={options} />
      </div>
      <HeatmapOverlay siteId={siteId} page={selectedPage} />
    </div>
  );
}
