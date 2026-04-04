import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, MousePointerClick, Filter, Activity, Settings as SettingsIcon, LogOut,
  Brain, MonitorSmartphone, Globe2, Zap, Bell, ShieldAlert
} from "lucide-react";
import { SiteProvider, useSite } from "./context/SiteContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";

// Pages
import Dashboard from "./pages/Dashboard";
import HeatmapPage from "./pages/HeatmapPage";
import FunnelPage from "./pages/FunnelPage";
import SessionsPage from "./pages/SessionsPage";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/ProtectedRoute";

import AIPage from "./pages/AIPage";
import LiveFeedPage from "./pages/LiveFeedPage";
import DevicesPage from "./pages/DevicesPage";
import CustomEventsPage from "./pages/CustomEventsPage";
import AlertsPage from "./pages/AlertsPage";
import GeographyTable from "./components/GeographyTable";
import GeographyMap from "./components/GeographyMap";
import DemoMode from "./components/DemoMode";

function Sidebar() {
  const { sites, activeSite, setActiveSite } = useSite();
  const { user, logout } = useAuth();
  const location = useLocation();

  const links = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Heatmaps", path: "/heatmap", icon: MousePointerClick },
    { name: "Sessions", path: "/sessions", icon: Activity },
    { name: "Funnels", path: "/funnel", icon: Filter },
    { name: "AI Insights", path: "/ai", icon: Brain },
    { name: "Live Feed", path: "/live-feed", icon: ShieldAlert },
    { name: "Devices", path: "/devices", icon: MonitorSmartphone },
    { name: "Geography", path: "/geography", icon: Globe2 },
    { name: "Custom Events", path: "/events", icon: Zap },
    { name: "Alerts", path: "/alerts", icon: Bell },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen fixed pt-6">
      <Link to="/" className="px-6 mb-8 flex items-center gap-2 text-xl font-bold tracking-tight text-black">
        <span className="text-black">⚡</span> InsightOS
      </Link>

      {sites && sites.length > 0 && (
        <div className="px-6 mb-6">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">Project</label>
          <div className="flex gap-2">
            <select 
              value={activeSite?.siteId || ""} 
              onChange={(e) => setActiveSite(sites.find(s => s.siteId === e.target.value))}
              className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all font-medium"
            >
              {sites.map(s => <option key={s.siteId} value={s.siteId}>{s.name || s.siteId}</option>)}
            </select>
          </div>
        </div>
      )}

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto pb-4">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-3">Menu</div>
        {links.map((link) => {
          const active = location.pathname === link.path;
          return (
            <Link 
              key={link.name} 
              to={link.path} 
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                active 
                  ? "bg-black text-white shadow-lg shadow-black/10" 
                  : "text-gray-500 hover:text-black hover:bg-gray-50"
              }`}
            >
              <link.icon size={16} /> {link.name}
            </Link>
          );
        })}
      </nav>

      {/* User Actions */}
      <div className="mt-auto border-t border-gray-100 p-4 flex flex-col gap-1">
        <Link to="/settings" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-black hover:bg-gray-50 transition-all">
           <SettingsIcon size={16} /> Settings
        </Link>
        <button onClick={logout} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all w-full text-left">
           <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
}

function DashboardLayout({ children }) {
  const { activeSite } = useSite();
  return (
    <div className="min-h-screen bg-[#f9fafb] text-gray-900 font-sans">
      <Sidebar />
      <main className="flex-1 ml-64 flex flex-col min-h-screen relative z-0">
        <div className="flex-1 w-full mx-auto p-8 md:p-12 pb-24 max-w-[1600px]">
          {children}
        </div>
        {activeSite && <DemoMode siteId={activeSite.siteId} />}
      </main>
    </div>
  );
}

export default function App() {
  const { activeSite } = useSite();
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* PROTECTED APP */}
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        
        {/* CORE ANALYTICS */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><Dashboard siteId={activeSite?.siteId || activeSite} /></DashboardLayout></ProtectedRoute>} />
        <Route path="/heatmap" element={<ProtectedRoute><DashboardLayout><HeatmapPage siteId={activeSite?.siteId || activeSite} /></DashboardLayout></ProtectedRoute>} />
        <Route path="/funnel" element={<ProtectedRoute><DashboardLayout><FunnelPage siteId={activeSite?.siteId || activeSite} /></DashboardLayout></ProtectedRoute>} />
        <Route path="/sessions" element={<ProtectedRoute><DashboardLayout><SessionsPage siteId={activeSite?.siteId || activeSite} /></DashboardLayout></ProtectedRoute>} />
        
        {/* ADVANCED MODULES */}
        <Route path="/ai" element={<ProtectedRoute><DashboardLayout><AIPage siteId={activeSite?.siteId || activeSite} /></DashboardLayout></ProtectedRoute>} />
        <Route path="/live-feed" element={<ProtectedRoute><DashboardLayout><LiveFeedPage siteId={activeSite?.siteId || activeSite} /></DashboardLayout></ProtectedRoute>} />
        <Route path="/devices" element={<ProtectedRoute><DashboardLayout><DevicesPage siteId={activeSite?.siteId || activeSite} /></DashboardLayout></ProtectedRoute>} />
        
        <Route path="/geography" element={
          <ProtectedRoute>
            <DashboardLayout>
              <div className="space-y-8 pb-20">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Geography</h1>
                    <p className="text-gray-500 font-medium max-w-xl text-lg">
                      Visualizing your global reach in real-time. Where are your users right now?
                    </p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-2.5 flex items-center gap-3">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                     <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Global Sync Active</span>
                  </div>
                </header>

                <div className="grid grid-cols-1 gap-8">
                   <GeographyMap siteId={activeSite?.siteId || activeSite} />
                   <GeographyTable siteId={activeSite?.siteId || activeSite} />
                </div>
              </div>
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/events" element={<ProtectedRoute><DashboardLayout><CustomEventsPage siteId={activeSite?.siteId || activeSite} /></DashboardLayout></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute><DashboardLayout><AlertsPage siteId={activeSite?.siteId || activeSite} /></DashboardLayout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><DashboardLayout><Settings siteId={activeSite?.siteId || activeSite} /></DashboardLayout></ProtectedRoute>} />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
