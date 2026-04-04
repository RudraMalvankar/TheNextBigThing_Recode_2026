import { useState, useEffect } from "react";
import { Settings as SettingsIcon, User, Globe, Code, Plus, Trash2, ClipboardCopy, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSite } from "../context/SiteContext";
import api from "../api";
import { toast } from "react-hot-toast";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const { user } = useAuth();
  const { sites, fetchSites, activeSite } = useSite();

  // Profile State
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileEmail, setProfileEmail] = useState(user?.email || "");

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Sites State
  const [newSiteName, setNewSiteName] = useState("");
  const [newSiteDomain, setNewSiteDomain] = useState("");

  useEffect(() => {
    setProfileName(user?.name || "");
    setProfileEmail(user?.email || "");
  }, [user]);

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    // Implementation placeholder for backend support
    toast.success("Profile updated! (Visual only)");
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match");
    }
    toast.success("Password updated! (Visual only)");
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
  };

  const handleAddSite = async (e) => {
    e.preventDefault();
    try {
      await api.post("/sites", { name: newSiteName, domain: newSiteDomain });
      toast.success("Site added");
      setNewSiteName("");
      setNewSiteDomain("");
      fetchSites();
    } catch (err) {
      toast.error("Failed to add site");
    }
  };

  const handleDeleteSite = async (id) => {
    if (!window.confirm("Are you sure? This deletes all data for this site.")) return;
    try {
      await api.delete(`/sites/${id}`);
      toast.success("Site deleted");
      fetchSites();
    } catch (err) {
      toast.error("Failed to delete site");
    }
  };

  const copyTracker = (id) => {
    const code = `<script src="${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/tracker.js" data-site="${id}" async></script>`;
    navigator.clipboard.writeText(code);
    toast.success("Code copied");
  };

  const testConnection = async (id) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId: id, events: [{ type: "test", page: "/test" }] })
      });
      toast.success("✅ Connected successfully!");
    } catch (e) {
      toast.error("❌ Not receiving data");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 font-sans text-gray-900">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center shadow-md">
          <SettingsIcon size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-black">Settings</h1>
          <p className="text-gray-500 text-sm">Manage your profile, domains, and tracking code</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        {/* TABS SIDEBAR */}
        <div className="w-full md:w-64 flex flex-col gap-2">
          <button onClick={() => setActiveTab("profile")} className={`px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium transition ${activeTab === 'profile' ? 'bg-black text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
            <User size={18} /> Profile
          </button>
          <button onClick={() => setActiveTab("sites")} className={`px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium transition ${activeTab === 'sites' ? 'bg-black text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Globe size={18} /> Sites
          </button>
          <button onClick={() => setActiveTab("tracker")} className={`px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium transition ${activeTab === 'tracker' ? 'bg-black text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Code size={18} /> Tracker
          </button>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8">
          
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="space-y-12">
              <div>
                <h3 className="text-lg font-bold mb-6">Personal Information</h3>
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 bg-purple-100 text-purple-600 text-2xl font-bold rounded-full flex items-center justify-center">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <button className="px-4 py-2 border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50">Change photo</button>
                  </div>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-5 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
                    <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                    <input type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black outline-none" />
                  </div>
                  <button className="bg-black text-white px-6 py-3 rounded-full text-sm font-medium mt-2">Save Profile</button>
                </form>
              </div>

              <div className="pt-8 border-t border-gray-100">
                <h3 className="text-lg font-bold mb-6">Change Password</h3>
                <form onSubmit={handlePasswordUpdate} className="space-y-5 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Current password</label>
                    <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">New password</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm new password</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black outline-none" />
                  </div>
                  <button className="bg-white border border-gray-300 text-black px-6 py-3 rounded-full text-sm font-medium mt-2 hover:bg-gray-50">Update Password</button>
                </form>
              </div>
            </div>
          )}

          {/* SITES TAB */}
          {activeTab === "sites" && (
            <div>
              <h3 className="text-lg font-bold mb-6">Manage Sites</h3>
              
              <div className="space-y-4 mb-10">
                {sites.map(site => (
                  <div key={site.siteId} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition gap-4">
                    <div>
                      <div className="font-bold text-sm">{site.name}</div>
                      <div className="text-xs text-gray-500 font-mono mt-1">{site.domain}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => { navigator.clipboard.writeText(site.siteId); toast.success("ID Copied"); }} className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded flex items-center gap-2 hover:bg-gray-200">
                        {site.siteId} <ClipboardCopy size={12}/>
                      </button>
                      <button onClick={() => handleDeleteSite(site._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h4 className="font-bold text-sm mb-4">Add new site</h4>
                <form onSubmit={handleAddSite} className="flex flex-col sm:flex-row gap-4">
                  <input type="text" placeholder="Site Name" required value={newSiteName} onChange={e=>setNewSiteName(e.target.value)} className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm" />
                  <input type="text" placeholder="Domain" required value={newSiteDomain} onChange={e=>setNewSiteDomain(e.target.value)} className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm" />
                  <button type="submit" className="bg-black text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-800 flex items-center justify-center gap-2">
                    <Plus size={16}/> Add
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TRACKER TAB */}
          {activeTab === "tracker" && (
            <div>
              <h3 className="text-lg font-bold mb-6">Tracker Installation</h3>
              <p className="text-sm text-gray-500 mb-6">Select a site to view its installation snippet.</p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Site</label>
                <select className="w-full max-w-sm px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none bg-white">
                  {sites.map(s => <option key={s.siteId} value={s.siteId}>{s.name}</option>)}
                </select>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 relative group mb-8 shadow-inner">
                <pre className="text-xs text-black font-mono break-all whitespace-pre-wrap leading-relaxed">
                  &lt;script src="{import.meta.env.VITE_API_URL || 'http://localhost:4000'}/tracker.js" data-site="{activeSite?.siteId || 'default'}" async&gt;&lt;/script&gt;
                </pre>
                <button onClick={() => copyTracker(activeSite?.siteId)} className="absolute top-4 right-4 p-2.5 bg-white border border-gray-200 text-gray-500 hover:text-black rounded-xl transition shadow-sm opacity-0 group-hover:opacity-100">
                  <ClipboardCopy size={18} />
                </button>
              </div>

              <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                <button onClick={() => testConnection(activeSite?.siteId)} className="bg-white border border-gray-300 text-black px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                  Test connection <CheckCircle size={16} />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
