import { Link } from "react-router-dom";

const highlights = [
  {
    title: "Live behavior pulse",
    description: "Watch active visitors, hottest pages, and live movement without waiting for batch reports.",
  },
  {
    title: "Rage-click and dead-zone intel",
    description: "Instantly spot where people fight your UI and where important CTAs are getting ignored.",
  },
  {
    title: "Funnel + persona insight",
    description: "See where drop-offs happen and which visitor type needs a different UX treatment.",
  },
];

export default function Landing(): JSX.Element {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#080a10] text-white">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />

      <header className="relative z-10 border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="text-lg font-bold tracking-wide">
            <span className="text-cyan-300">InsightOS</span> Analytics Suite
          </div>
          <Link
            to="/login"
            className="rounded-xl border border-white/25 px-4 py-2 text-sm font-medium text-white transition hover:border-cyan-300 hover:text-cyan-200"
          >
            Log in
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid max-w-6xl gap-10 px-6 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="space-y-7">
          <span className="inline-flex rounded-full border border-cyan-300/40 bg-cyan-500/10 px-4 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">
            Personal analytics cockpit
          </span>

          <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Build better UX
            <br />
            from real user behavior.
          </h1>

          <p className="max-w-2xl text-base text-zinc-300 sm:text-lg">
            Your private dashboard for traffic trends, heatmaps, funnels, and session intelligence. One login, one
            command center, full control.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/login"
              className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-semibold text-[#071018] shadow-lg shadow-cyan-900/40 transition hover:translate-y-[-1px]"
            >
              Open Dashboard
            </Link>
            <a
              href="#features"
              className="rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:border-white/40 hover:text-white"
            >
              Explore Features
            </a>
          </div>
        </section>

        <section className="panel rounded-3xl border border-cyan-400/20 p-6">
          <p className="mono text-xs uppercase tracking-[0.2em] text-cyan-200">Live sample</p>
          <div className="mt-4 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-zinc-400">Active users</p>
              <p className="mt-1 text-3xl font-bold text-emerald-300">63</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-zinc-400">Top intent signal</p>
              <p className="mt-1 text-base font-semibold">Checkout CTA ignored by 38% sessions</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-zinc-400">Funnel drop</p>
              <p className="mt-1 text-base font-semibold">Product view → Cart: -18%</p>
            </div>
          </div>
        </section>
      </main>

      <section id="features" className="relative z-10 mx-auto grid max-w-6xl gap-4 px-6 pb-16 sm:grid-cols-2 lg:grid-cols-3">
        {highlights.map((item) => (
          <article key={item.title} className="panel rounded-2xl border border-white/10 p-5">
            <h3 className="text-lg font-semibold text-cyan-100">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">{item.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}