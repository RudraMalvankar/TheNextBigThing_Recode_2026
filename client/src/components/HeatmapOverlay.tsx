import { useEffect, useMemo, useRef, useState } from "react";
import { getHeatmap, HeatmapPoint } from "../api";
import DeadZoneOverlay from "./DeadZoneOverlay";
import RageClickBadge from "./RageClickBadge";
import { Card } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

type DeadZone = {
  x: number;
  y: number;
  w: number;
  h: number;
};

type HeatmapOverlayProps = {
  siteId: string;
  page: string;
};

const WIDTH = 800;
const HEIGHT = 500;

function getDeadZones(clicks: HeatmapPoint[]): DeadZone[] {
  const cols = 10;
  const rows = 10;
  const cellW = WIDTH / cols;
  const cellH = HEIGHT / rows;
  const density = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0));

  for (const click of clicks) {
    if (typeof click.x !== "number" || typeof click.y !== "number") {
      continue;
    }

    const x = Math.min(cols - 1, Math.max(0, Math.floor(click.x * cols)));
    const y = Math.min(rows - 1, Math.max(0, Math.floor(click.y * rows)));
    density[y][x] += 1;
  }

  const zones: DeadZone[] = [];

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      if (density[y][x] === 0) {
        zones.push({ x: x * cellW, y: y * cellH, w: cellW, h: cellH });
      }
    }
  }

  return zones;
}

export default function HeatmapOverlay({ siteId, page }: HeatmapOverlayProps): JSX.Element {
  const [clicks, setClicks] = useState<HeatmapPoint[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const response = await getHeatmap(siteId, page);
        if (mounted) {
          setClicks(response.clicks);
          setTotal(response.total);
        }
      } catch (_err) {
        if (mounted) {
          setError("Failed to load heatmap data");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (page) {
      void load();
    }

    return () => {
      mounted = false;
    };
  }, [siteId, page]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#1b1b27";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.globalCompositeOperation = "lighter";

    for (const click of clicks) {
      if (typeof click.x !== "number" || typeof click.y !== "number") {
        continue;
      }

      const actualX = click.x * WIDTH;
      const actualY = click.y * HEIGHT;
      const gradient = ctx.createRadialGradient(actualX, actualY, 0, actualX, actualY, 30);

      gradient.addColorStop(0, "rgba(255,50,50,0.35)");
      gradient.addColorStop(1, "rgba(255,50,50,0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(actualX, actualY, 30, 0, Math.PI * 2);
      ctx.fill();
    }

    const image = ctx.getImageData(0, 0, WIDTH, HEIGHT);
    const pixels = image.data;

    for (let i = 0; i < pixels.length; i += 4) {
      const intensity = pixels[i];

      if (intensity > 200) {
        pixels[i] = 255;
        pixels[i + 1] = 40;
        pixels[i + 2] = 40;
      } else if (intensity > 100) {
        pixels[i] = 245;
        pixels[i + 1] = 194;
        pixels[i + 2] = 67;
      } else if (intensity > 50) {
        pixels[i] = 64;
        pixels[i + 1] = 213;
        pixels[i + 2] = 132;
      } else if (intensity > 0) {
        pixels[i] = 56;
        pixels[i + 1] = 189;
        pixels[i + 2] = 248;
      }
    }

    ctx.putImageData(image, 0, 0);

    for (const click of clicks.filter((point) => point.isRageClick)) {
      if (typeof click.x !== "number" || typeof click.y !== "number") {
        continue;
      }

      const x = click.x * WIDTH;
      const y = click.y * HEIGHT;
      ctx.strokeStyle = "#ff3b3b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 6, y - 6);
      ctx.lineTo(x + 6, y + 6);
      ctx.moveTo(x + 6, y - 6);
      ctx.lineTo(x - 6, y + 6);
      ctx.stroke();
    }
  }, [clicks]);

  const rageCount = useMemo(() => clicks.filter((click) => click.isRageClick).length, [clicks]);
  const deadZones = useMemo(() => getDeadZones(clicks), [clicks]);

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Heatmap Overlay</h3>
        <RageClickBadge count={rageCount} />
      </div>

      {loading ? (
        <Skeleton className="h-[500px] w-full" />
      ) : error ? (
        <div className="rounded-xl border border-red-500/40 bg-red-900/10 p-4 text-sm text-red-300">{error}</div>
      ) : clicks.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 p-6 text-sm text-zinc-400">No clicks captured for this page yet</div>
      ) : (
        <div className="space-y-3 animated-enter">
          <div className="relative mx-auto w-fit overflow-hidden rounded-xl border border-zinc-800">
            <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="block max-w-full" />
            <DeadZoneOverlay zones={deadZones} />
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-zinc-300">
            <span className="rounded-md border border-zinc-700 bg-zinc-900/70 px-3 py-1">Total clicks: {total}</span>
            <span className="rounded-md border border-blue-400/30 bg-blue-500/10 px-3 py-1">Dead zones: {deadZones.length}</span>
          </div>
        </div>
      )}
    </Card>
  );
}
