import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await login(email, password);
      localStorage.setItem("token", data.token);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Check your credentials.");
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-white text-gray-900">
      {/* Left Half - Form */}
      <div className="w-full lg:w-1/2 p-8 md:p-16 flex flex-col relative overflow-y-auto">
        <Link to="/" className="absolute top-8 left-8 font-bold text-xl flex items-center gap-2">
          ⚡ InsightOS
        </Link>
        
        <div className="m-auto w-full max-w-sm">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Welcome back</h2>
          <p className="text-gray-500 mb-8">Sign in to your analytics dashboard</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-start gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <a href="#" className="text-sm text-gray-500 hover:text-black transition">Forgot password?</a>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition pr-12"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-full font-medium hover:bg-gray-800 transition flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Signing in...</> : "Sign in"}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-4 text-gray-400 text-sm">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span>or</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <div className="mt-8 text-center">
            <span className="text-gray-500">Don't have an account? </span>
            <Link to="/register" className="font-semibold text-black hover:underline">Start for free →</Link>
          </div>
        </div>
      </div>

      {/* Right Half - Deco */}
      <div className="hidden lg:flex w-1/2 bg-[#0f0f12] relative items-center justify-center overflow-hidden border-l border-gray-800">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)", backgroundSize: "30px 30px" }}></div>
        
        <div className="relative z-10 flex flex-col gap-6">
          <motion.div 
            animate={{ y: [0, -10, 0] }} 
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl flex items-center gap-4 w-72"
          >
            <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center text-2xl">📊</div>
            <div>
              <div className="text-white font-bold text-lg">320k</div>
              <div className="text-gray-400 text-sm">Visitors tracked</div>
            </div>
          </motion.div>
          
          <motion.div 
            animate={{ y: [0, 10, 0] }} 
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl flex items-center gap-4 w-72 ml-12"
          >
            <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-xl flex items-center justify-center text-2xl">🔥</div>
            <div>
              <div className="text-white font-bold text-lg">38</div>
              <div className="text-gray-400 text-sm">Rage clicks detected</div>
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, -8, 0] }} 
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl flex items-center gap-4 w-72"
          >
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center text-2xl">🌍</div>
            <div>
              <div className="text-white font-bold text-lg">12</div>
              <div className="text-gray-400 text-sm">Countries online</div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
