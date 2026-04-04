import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ClipboardCopy, Loader2, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [siteName, setSiteName] = useState("");
  const [domain, setDomain] = useState("");
  const [siteId, setSiteId] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCreateSite = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/sites", { name: siteName, domain });
      setSiteId(res.data.siteId);
      setStep(2);
      toast.success("Site created successfully!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create site");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    const code = `<script src="${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/tracker.js" data-site="${siteId}" async></script>`;
    navigator.clipboard.writeText(code);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-xl">
          {/* Progress Header */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-extrabold mb-3 tracking-tighter">Welcome, {user?.name?.split(" ")[0]}!</h1>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 font-medium">
              <span className={step === 1 ? "text-black" : ""}>Step 1</span>
              <span className="w-8 h-px bg-gray-300"></span>
              <span className={step === 2 ? "text-black" : ""}>Step 2</span>
            </div>
          </div>

          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-200">
            {step === 1 && (
              <form onSubmit={handleCreateSite}>
                <h2 className="text-xl font-bold mb-1">Name your first site</h2>
                <p className="text-sm text-gray-500 mb-8">Where will you install the tracker?</p>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Site Name</label>
                    <input 
                      type="text" required value={siteName} onChange={(e) => setSiteName(e.target.value)}
                      placeholder="e.g. My Portfolio"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Domain</label>
                    <input 
                      type="text" required value={domain} onChange={(e) => setDomain(e.target.value)}
                      placeholder="e.g. mysite.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                <div className="mt-10 flex justify-end">
                  <button type="submit" disabled={loading} className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition flex items-center justify-center gap-2 disabled:opacity-70">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <>Continue <ArrowRight size={18} /></>}
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-xl font-bold mb-1">Add the tracker</h2>
                <p className="text-sm text-gray-500 mb-8">Paste this snippet before the closing &lt;/head&gt; tag of your website.</p>
                
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 relative group shadow-inner">
                  <pre className="text-xs text-black font-mono break-all whitespace-pre-wrap leading-relaxed">
                    &lt;script src="{import.meta.env.VITE_API_URL || 'http://localhost:4000'}/tracker.js" data-site="{siteId}" async&gt;&lt;/script&gt;
                  </pre>
                  <button onClick={copyToClipboard} className="absolute top-4 right-4 p-2.5 bg-white border border-gray-200 text-gray-500 hover:text-black rounded-xl transition shadow-sm opacity-0 group-hover:opacity-100">
                    <ClipboardCopy size={18} />
                  </button>
                </div>

                <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-end">
                  <button onClick={() => navigate("/dashboard")} className="text-sm font-medium text-gray-500 hover:text-black transition">
                    Do this later
                  </button>
                  <button onClick={() => navigate("/dashboard")} className="w-full sm:w-auto bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition flex items-center justify-center gap-2">
                    I've added it <Check size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
