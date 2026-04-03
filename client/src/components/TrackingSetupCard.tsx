import { useMemo, useState } from "react";
import { Card } from "./ui/card";

type TrackingSetupCardProps = {
  siteId: string;
};

function cleanBaseUrl(value: string): string {
  return value.trim().replace(/\/$/, "");
}

async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "true");
  area.style.position = "absolute";
  area.style.left = "-9999px";
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  document.body.removeChild(area);
}

export default function TrackingSetupCard({ siteId }: TrackingSetupCardProps): JSX.Element {
  const [copied, setCopied] = useState<"url" | "script" | null>(null);

  const apiBase = useMemo(() => {
    const raw = import.meta.env.VITE_API_URL?.trim();
    return cleanBaseUrl(raw || window.location.origin);
  }, []);

  const trackerBase = useMemo(() => {
    const raw = import.meta.env.VITE_TRACKER_URL?.trim();
    return cleanBaseUrl(raw || apiBase);
  }, [apiBase]);

  const trackerUrl = `${trackerBase}/tracker.js`;
  const scriptTag = `<script defer src="${trackerUrl}" data-site="${siteId}" data-api="${apiBase}"></script>`;

  async function handleCopy(type: "url" | "script", value: string): Promise<void> {
    try {
      await copyText(value);
      setCopied(type);
      window.setTimeout(() => setCopied((current) => (current === type ? null : current)), 1200);
    } catch {
      setCopied(null);
    }
  }

  return (
    <Card className="space-y-4 border-cyan-400/25 bg-gradient-to-br from-[#09222b] to-[#101a2d]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="mono text-xs uppercase tracking-[0.18em] text-cyan-200">Tracking setup</p>
          <h3 className="mt-1 text-xl font-semibold text-white">Collector script for your website</h3>
        </div>
        <span className="rounded-full border border-cyan-300/40 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100">
          site: {siteId}
        </span>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-300">Tracking URL</p>
          <p className="mono break-all text-sm text-cyan-100">{trackerUrl}</p>
          <button
            type="button"
            onClick={() => handleCopy("url", trackerUrl)}
            className="rounded-lg border border-cyan-300/40 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-400/10"
          >
            {copied === "url" ? "Copied" : "Copy URL"}
          </button>
        </div>

        <div className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-300">Embed snippet</p>
          <p className="mono break-all text-sm leading-6 text-cyan-100">{scriptTag}</p>
          <button
            type="button"
            onClick={() => handleCopy("script", scriptTag)}
            className="rounded-lg border border-cyan-300/40 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-400/10"
          >
            {copied === "script" ? "Copied" : "Copy Script Tag"}
          </button>
        </div>
      </div>
    </Card>
  );
}
