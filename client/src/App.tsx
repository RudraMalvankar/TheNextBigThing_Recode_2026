import { useMemo, useState } from "react";
import { Navigate, NavLink, Outlet, Route, Routes, useOutletContext } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Heatmap from "./pages/Heatmap";
import Funnel from "./pages/Funnel";
import Sessions from "./pages/Sessions";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import { DateRangeValue } from "./api";
import { useAuth } from "./auth/AuthContext";
import { Select } from "./components/ui/select";
import { cn } from "./lib/utils";

const defaultSite = import.meta.env.VITE_SITE_ID?.trim() || "default";

function navClass(active: boolean): string {
  return cn(
    "rounded-xl px-4 py-2 text-sm font-medium transition",
    active
      ? "border border-cyan-300/45 bg-cyan-400/15 text-cyan-100 shadow-[0_0_0_1px_rgba(34,211,238,0.15)]"
      : "border border-transparent text-slate-300 hover:border-white/15 hover:bg-white/5 hover:text-white",
  );
}

type DashboardOutletData = {
  siteId: string;
  range: DateRangeValue;
};

function ProtectedRoute({ children }: { children: JSX.Element }): JSX.Element {
  const { user, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07131a] text-slate-300">
        Checking session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function GuestRoute({ children }: { children: JSX.Element }): JSX.Element {
  const { user, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07131a] text-slate-300">
        Loading...
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function DashboardOverviewRoute(): JSX.Element {
  const { siteId, range } = useOutletContext<DashboardOutletData>();
  return <Dashboard siteId={siteId} range={range} />;
}

function DashboardHeatmapRoute(): JSX.Element {
  const { siteId, range } = useOutletContext<DashboardOutletData>();
  return <Heatmap siteId={siteId} range={range} />;
}

function DashboardFunnelRoute(): JSX.Element {
  const { siteId } = useOutletContext<DashboardOutletData>();
  return <Funnel siteId={siteId} />;
}

function DashboardSessionsRoute(): JSX.Element {
  const { siteId } = useOutletContext<DashboardOutletData>();
  return <Sessions siteId={siteId} />;
}

function DashboardShell(): JSX.Element {
  const { user, logout } = useAuth();
  const [siteId, setSiteId] = useState(defaultSite);
  const [range, setRange] = useState<DateRangeValue>("24h");

  const siteOptions = useMemo(() => {
    const unique = Array.from(new Set([defaultSite, "default", siteId]));
    return unique.map((value) => ({ label: value, value }));
  }, [siteId]);

  const rangeOptions = useMemo(
    () => [
      { label: "24h", value: "24h" },
      { label: "7d", value: "7d" },
      { label: "30d", value: "30d" },
    ],
    [],
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_5%,rgba(16,185,129,0.16),transparent_26%),radial-gradient(circle_at_95%_0%,rgba(56,189,248,0.14),transparent_28%),linear-gradient(180deg,#040b12_0%,#07131a_50%,#040911_100%)] text-white">
      <header className="sticky top-0 z-20 border-b border-cyan-500/15 bg-[#030912]/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1320px] flex-wrap items-center gap-3 px-4 py-4 sm:gap-4 lg:px-6">
          <div className="min-w-[170px] text-xl font-bold tracking-tight text-white">
            <span className="text-cyan-300">InsightOS</span>
          </div>

          <div className="w-full max-w-[280px]">
            <Select value={siteId} onChange={setSiteId} options={siteOptions} />
          </div>

          <div className="w-[120px]">
            <Select value={range} onChange={(value) => setRange(value as DateRangeValue)} options={rangeOptions} />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden rounded-xl border border-cyan-400/25 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-100 sm:block">
              {user?.name}
            </div>
            <button
              onClick={logout}
              className="rounded-xl border border-white/15 px-3 py-2 text-xs text-slate-200 transition hover:border-cyan-300/50 hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1320px] space-y-5 px-4 py-6 lg:px-6">
        <nav className="panel rounded-2xl p-2">
          <div className="flex flex-wrap gap-2">
            <NavLink to="/dashboard" end className={({ isActive }) => navClass(isActive)}>
              Dashboard
            </NavLink>
            <NavLink to="/dashboard/heatmap" className={({ isActive }) => navClass(isActive)}>
              Heatmap
            </NavLink>
            <NavLink to="/dashboard/funnel" className={({ isActive }) => navClass(isActive)}>
              Funnel
            </NavLink>
            <NavLink to="/dashboard/sessions" className={({ isActive }) => navClass(isActive)}>
              Sessions
            </NavLink>
          </div>
        </nav>

        <main>
          <Outlet context={{ siteId, range } satisfies DashboardOutletData} />
        </main>
      </div>
    </div>
  );
}

export default function App(): JSX.Element {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <GuestRoute>
            <Landing />
          </GuestRoute>
        }
      />
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardOverviewRoute />} />
        <Route path="heatmap" element={<DashboardHeatmapRoute />} />
        <Route path="funnel" element={<DashboardFunnelRoute />} />
        <Route path="sessions" element={<DashboardSessionsRoute />} />
      </Route>

      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} replace />} />
    </Routes>
  );
}
