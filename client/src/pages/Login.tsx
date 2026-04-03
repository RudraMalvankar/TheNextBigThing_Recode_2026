import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login(): JSX.Element {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please fill email and password");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch {
      setError("Invalid credentials. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#070a12] px-6 py-10 text-white">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#0d111b] shadow-2xl shadow-black/30 lg:grid-cols-2">
        <section className="relative p-8 sm:p-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-500/20 blur-2xl" />
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Secure Access</p>
          <h1 className="mt-3 text-3xl font-black leading-tight">Welcome back to InsightOS</h1>
          <p className="mt-3 text-sm text-zinc-300">
            Log in to open your private dashboard with traffic analytics, heatmaps, sessions, and funnel performance.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="block space-y-1">
              <span className="text-xs uppercase tracking-[0.18em] text-zinc-400">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-white/15 bg-[#0a0f1a] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300"
                placeholder="you@company.com"
                autoComplete="email"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs uppercase tracking-[0.18em] text-zinc-400">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-white/15 bg-[#0a0f1a] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300"
                placeholder="Your password"
                autoComplete="current-password"
              />
            </label>

            {error ? <p className="text-sm text-red-300">{error}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 text-sm font-bold text-[#07101e] transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <Link to="/" className="mt-6 inline-block text-sm text-cyan-300 hover:text-cyan-200">
            Back to landing page
          </Link>
        </section>

        <aside className="hidden bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-600/20 p-10 lg:block">
          <h2 className="text-xl font-semibold">Everything under one dashboard</h2>
          <ul className="mt-5 space-y-3 text-sm text-zinc-300">
            <li>Traffic overview and top pages</li>
            <li>Live pulse + active pages</li>
            <li>Heatmap and rage-click insights</li>
            <li>Funnel drop-off analysis</li>
            <li>Session timeline with persona tags</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}