import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register } = useAuth();
  const navigate = useNavigate();

  const getPasswordStrength = () => {
    if (!password) return { label: "", color: "bg-gray-200", width: "w-0" };
    if (password.length < 6) return { label: "Weak", color: "bg-red-500", width: "w-1/3" };
    const hasNum = /\d/.test(password);
    const hasSpec = /[!@#$%^&*]/.test(password);
    if (hasNum && hasSpec && password.length >= 8) return { label: "Strong", color: "bg-emerald-500", width: "w-full" };
    if (hasNum || password.length >= 8) return { label: "Medium", color: "bg-yellow-400", width: "w-2/3" };
    return { label: "Weak", color: "bg-red-500", width: "w-1/3" };
  };

  const str = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      return setError("Passwords do not match");
    }
    
    setLoading(true);
    setError("");
    try {
      const data = await register(name, email, password);
      localStorage.setItem("token", data.token);
      toast.success("Account created! Welcome to InsightOS 🎉");
      navigate("/onboarding");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
      toast.error("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-white text-gray-900">
      {/* Left Half - Form */}
      <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col relative overflow-y-auto">
        <Link to="/" className="absolute top-8 left-8 font-bold text-xl flex items-center gap-2">
          ⚡ InsightOS
        </Link>
        
        <div className="m-auto w-full max-w-sm mt-24 lg:mt-auto">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Create your account</h2>
          <p className="text-gray-500 mb-8">Start tracking in under 2 minutes</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-start gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
              <input 
                type="text" required value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input 
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative mb-2">
                <input 
                  type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition pr-12"
                  placeholder="Create a strong password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {password && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${str.color} ${str.width} transition-all duration-300`}></div>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 w-12 text-right">{str.label}</span>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
              <input 
                type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition ${confirm && password !== confirm ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-black'}`}
                placeholder="Repeat your password"
              />
            </div>

            <button disabled={loading} type="submit" className="w-full bg-black text-white py-3 rounded-full font-medium hover:bg-gray-800 transition flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Creating account...</> : "Create account"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            By signing up you agree to our Terms of Service
          </div>

          <div className="mt-8 text-center">
            <span className="text-gray-500">Already have an account? </span>
            <Link to="/login" className="font-semibold text-black hover:underline">Sign in →</Link>
          </div>
        </div>
      </div>

      {/* Right Half - Deco */}
      <div className="hidden lg:flex w-1/2 bg-[#0f0f12] relative items-center justify-center overflow-hidden border-l border-gray-800 text-white flex-col">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>
        
        <div className="relative z-10 max-w-md w-full px-8">
           <div className="text-[120px] font-bold leading-none mb-4 bg-gradient-to-br from-white to-gray-600 bg-clip-text text-transparent">3</div>
           <div className="text-2xl font-bold mb-12">minutes to set up</div>

           <div className="space-y-6">
             {[
               "Free forever plan",
               "No credit card required",
               "Privacy-first — no cookies",
               "<5KB tracker script"
             ].map((text, i) => (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.2 + i * 0.1 }}
                 className="flex items-center gap-4 text-gray-300 font-medium text-lg"
               >
                 <CheckCircle2 className="text-emerald-400" /> {text}
               </motion.div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
