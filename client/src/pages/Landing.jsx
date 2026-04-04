import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Activity, PlaySquare, Filter, Globe, Sparkles, Code, CheckCircle, ChevronRight, Quote, Target, ArrowRightCircle } from "lucide-react";

export default function Landing() {
  const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* SECTION 1 — NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-bold text-xl flex items-center gap-2">
            ⚡ InsightOS
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
            <a href="#features" className="hover:text-black transition">Features</a>
            <a href="#how-it-works" className="hover:text-black transition">How it works</a>
            <a href="#pricing" className="hover:text-black transition">Pricing</a>
            <a href="#" className="hover:text-black transition">Docs</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium hover:text-black transition">Log in</Link>
            <Link to="/register" className="text-sm font-medium bg-black text-white px-5 py-2 rounded-full hover:bg-gray-800 transition">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* SECTION 2 — HERO */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center overflow-hidden">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-3xl z-10">
          <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 text-xs font-medium text-gray-500 mb-8 bg-gray-50">
            <Sparkles size={14} className="text-gray-400" />
            ✦ Privacy-first analytics engine
          </motion.div>
          <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            Understand your users.<br />Fix what's broken.<br />Grow faster.
          </motion.h1>
          <motion.p variants={fadeIn} className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
            InsightOS gives you heatmaps, session replays, funnel analytics, and real-time visitor tracking — without cookies, without complexity.
          </motion.p>
          <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition flex items-center justify-center gap-2">
              Start for free <ChevronRight size={18} />
            </Link>
            <a href="#setup" className="w-full sm:w-auto px-8 py-4 bg-white text-black border border-gray-200 rounded-full font-medium hover:bg-gray-50 transition">
              See live demo
            </a>
          </motion.div>
          <motion.p variants={fadeIn} className="text-sm text-gray-400">
            No credit card required · Privacy-first · &lt;5KB script
          </motion.p>
        </motion.div>

        {/* Dashboard Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
          className="mt-20 w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
        >
          <div className="h-12 bg-gray-50 flex items-center px-6 gap-2 border-b border-gray-100">
            <div className="w-3 h-3 rounded-full bg-gray-200"></div>
            <div className="w-3 h-3 rounded-full bg-gray-200"></div>
            <div className="w-3 h-3 rounded-full bg-gray-200"></div>
          </div>
          <div className="p-10 grid grid-cols-3 gap-8 h-[450px]">
             <div className="col-span-2 bg-gray-50 rounded-2xl border border-gray-100 p-8 flex flex-col justify-end relative overflow-hidden shadow-inner">
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
                <div className="h-40 flex items-end gap-3 px-4 z-10 w-full">
                  {[40, 70, 45, 90, 65, 120, 80, 150, 110, 85].map((h, i) => (
                    <motion.div 
                      key={i} 
                      className="flex-1 bg-black rounded-t-lg" 
                      initial={{ height: 0 }} 
                      animate={{ height: `${h}px` }} 
                      transition={{ delay: 0.8 + i * 0.05, duration: 0.5 }}
                    />
                  ))}
                </div>
             </div>
             <div className="col-span-1 flex flex-col gap-8">
                <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-8 flex items-center justify-center flex-col shadow-sm">
                  <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-3">Active Users</span>
                  <span className="text-5xl text-black font-extrabold flex items-center gap-3 tracking-tighter">
                    <span className="w-4 h-4 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse"></span> 1,204
                  </span>
                </div>
                <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-8 flex items-center flex-col justify-center shadow-sm">
                  <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-3">Rage Clicks</span>
                  <span className="text-4xl text-red-500 font-extrabold tracking-tight">12</span>
                </div>
             </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 3 — STATS BAR */}
      <section className="bg-gray-50 border-y border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-black mb-2">10,000+</div>
            <div className="text-sm font-medium text-gray-500">Events/sec processed</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-black mb-2">&lt;5KB</div>
            <div className="text-sm font-medium text-gray-500">Tracker size</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-black mb-2">Real-time</div>
            <div className="text-sm font-medium text-gray-500">Live dashboard</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-black mb-2">100%</div>
            <div className="text-sm font-medium text-gray-500">Privacy-first</div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — FEATURES GRID */}
      <section id="features" className="py-24 bg-white max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-4 block">Features</span>
          <h2 className="text-3xl md:text-4xl font-bold text-black">Everything you need to understand users</h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Activity, title: "Heatmaps", desc: "See exactly where users click with beautiful canvas heatmaps", color: "text-orange-500" },
            { icon: PlaySquare, title: "Session Replay", desc: "Watch real recordings of user sessions frame by frame", color: "text-blue-500" },
            { icon: Filter, title: "Funnel Analytics", desc: "Track every step of your conversion funnel and fix drop-offs", color: "text-purple-500" },
            { icon: Globe, title: "Live Global Map", desc: "See where your visitors are coming from in real time", color: "text-emerald-500" },
            { icon: Target, title: "UTM Tracking", desc: "Professional source attribution (Source, Medium, Campaign)", color: "text-blue-600" },
            { icon: ArrowRightCircle, title: "Sequential Funnels", desc: "Define custom paths and identify exactly where users drop off", color: "text-purple-600" },
            { icon: Sparkles, title: "AI UX Suggestions", desc: "Get automatic recommendations based on session behavior", color: "text-yellow-500" },
          ].map((feat, i) => (
            <motion.div 
              key={i} 
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              className="p-8 rounded-2xl bg-white border border-gray-200 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <feat.icon className={feat.color} size={24} />
              </div>
              <h3 className="text-lg font-bold mb-3">{feat.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 5 — HOW IT WORKS */}
      <section id="how-it-works" className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Set up in 3 minutes</h2>
          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-[28px] left-[15%] right-[15%] h-[2px] bg-gray-200 z-0"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center text-xl font-bold mb-6 border-4 border-gray-50 shadow-sm">1</div>
              <h3 className="text-lg font-bold mb-4">Add one line of code</h3>
              <div className="bg-[#111] p-4 rounded-xl w-full text-left overflow-hidden border border-gray-800">
                <code className="text-xs text-green-400 font-mono break-all">
                  &lt;script src="https://api.js" data-site="id" async&gt;&lt;/script&gt;
                </code>
              </div>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center text-xl font-bold mb-6 border-4 border-gray-50 shadow-sm">2</div>
              <h3 className="text-lg font-bold mb-4">Data flows automatically</h3>
              <p className="text-gray-500 text-sm">Pageviews, clicks, scrolls and sessions are tracked instantly without configuration.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center text-xl font-bold mb-6 border-4 border-gray-50 shadow-sm">3</div>
              <h3 className="text-lg font-bold mb-4">Get insights immediately</h3>
              <p className="text-gray-500 text-sm">Open your dashboard and see heatmaps, funnels, and live users immediately.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 — SOCIAL PROOF */}
      <section className="py-24 bg-white max-w-7xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Built for teams that care about users</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { quote: "InsightOS helped us find a broken CTA that was costing us 40% of conversions. The rage click detection is insane.", name: "Priya K.", title: "Product Manager" },
            { quote: "Session replay showed us exactly why users were dropping off. Fixed it in an hour. Conversion up 28%.", name: "Arjun M.", title: "Founder" },
            { quote: "Finally an analytics tool that doesn't need a PhD to use. The heatmap alone is worth it.", name: "Sneha R.", title: "UX Designer" }
          ].map((t, i) => (
            <div key={i} className="p-8 border border-gray-200 rounded-2xl bg-white shadow-sm flex flex-col justify-between">
              <div>
                <Quote className="text-gray-300 mb-4" size={32} />
                <p className="text-gray-700 leading-relaxed mb-8">"{t.quote}"</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-sm text-gray-500">{t.name[0]}</div>
                <div>
                  <div className="font-bold text-sm">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.title}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 7 — PRICING */}
      <section id="pricing" className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Simple, transparent pricing</h2>
            <p className="text-gray-500">Start free. Upgrade when you're ready.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free */}
            <div className="p-8 bg-white border border-gray-200 rounded-3xl shadow-sm">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <div className="text-4xl font-bold mb-8">$0<span className="text-lg text-gray-400 font-normal">/mo</span></div>
              <ul className="space-y-4 mb-8">
                {["1 site", "10,000 events/mo", "Heatmaps", "Funnel analytics", "7-day data retention"].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700"><CheckCircle size={18} className="text-black" /> {f}</li>
                ))}
                {["Session replay", "Global map"].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-400"><CheckCircle size={18} className="text-gray-200" /> {f}</li>
                ))}
              </ul>
              <Link to="/register" className="block w-full py-4 text-center border border-gray-300 rounded-full font-bold hover:bg-gray-50 transition">Get started free</Link>
            </div>
            {/* Pro */}
            <div className="p-8 bg-black text-white rounded-3xl shadow-xl relative overflow-hidden">
              <div className="absolute top-6 right-6 bg-white/10 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">Most popular</div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <div className="text-4xl font-bold mb-8">$19<span className="text-lg text-gray-400 font-normal">/mo</span></div>
              <ul className="space-y-4 mb-8">
                {["Unlimited sites", "1M events/mo", "Everything in Free", "Session replay", "Live global map", "Anomaly alerts", "CSV export", "90-day retention"].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-white"><CheckCircle size={18} className="text-emerald-400" /> {f}</li>
                ))}
              </ul>
              <Link to="/register" className="block w-full py-4 text-center bg-white text-black rounded-full font-bold hover:bg-gray-100 transition mt-auto">Start Pro trial</Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8 — CTA */}
      <section className="py-32 bg-[#0f0f0f] text-white text-center px-6">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to understand your users?</h2>
        <p className="text-gray-400 text-lg mb-10">Join teams already using InsightOS to build better products.</p>
        <Link to="/register" className="inline-block px-10 py-5 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-100 transition">Get started free →</Link>
        <p className="mt-6 text-sm text-gray-500">Takes 2 minutes to set up</p>
      </section>

      {/* SECTION 9 — FOOTER */}
      <footer className="bg-white border-t border-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="font-bold text-lg mb-1 flex items-center gap-2">⚡ InsightOS</div>
            <div className="text-sm text-gray-500">Privacy-first analytics</div>
          </div>
          <div className="flex gap-6 text-sm font-medium text-gray-500">
            <a href="#" className="hover:text-black">Features</a>
            <a href="#" className="hover:text-black">Pricing</a>
            <a href="#" className="hover:text-black">Docs</a>
            <a href="#" className="hover:text-black">GitHub</a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 text-xs text-gray-400 border-t border-gray-100 pt-8 flexjustify-between">
          <span>© 2026 InsightOS. Built for Convergence Hackathon.</span>
        </div>
      </footer>
    </div>
  );
}
