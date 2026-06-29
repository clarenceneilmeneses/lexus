import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Brand } from "../../components/layout/Header";

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    const { error } = await signIn(email, password);
    if (error) setErr(error);
    setBusy(false);
  }

  return (
    <div className="admin-ui min-h-screen lg:grid lg:grid-cols-2">
      {/* ---- Brand panel (desktop only) ---- */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-brand via-brand to-brand-d text-white p-12 xl:p-16">
        {/* soft periwinkle glow + flag-red spark, kept subtle */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-accent-glow/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 w-[320px] h-[320px] rounded-full bg-flag/10 blur-3xl" />

        <Brand tone="light" className="h-11 relative" />

        <div className="relative max-w-md">
          <span className="inline-flex items-center gap-2.5 font-mono text-[11px] tracking-[0.2em] uppercase text-accent-glow font-bold">
            <span className="w-6 h-[3px] rounded-full bg-flag" />
            Admin Console
          </span>
          <h2 className="text-[34px] xl:text-[40px] leading-[1.1] tracking-[-0.02em] mt-5">
            Everything you need to run the storefront, in one place.
          </h2>
          <p className="text-white/70 text-[15px] leading-relaxed mt-4">
            Manage your product catalog, edit homepage content, and respond to
            customer inquiries from a single dashboard.
          </p>
        </div>

        <p className="relative font-mono text-[11px] tracking-[0.14em] uppercase text-white/45">
          Lexus Industrial · Since 1995
        </p>
      </aside>

      {/* ---- Sign-in form ---- */}
      <main className="grid place-items-center bg-paper px-4 py-10">
        <div className="w-full max-w-[400px]">
          {/* mobile brand (the panel above is hidden on small screens) */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Brand tone="dark" className="h-11" />
          </div>

          <div className="mb-7 text-center lg:text-left">
            <h1 className="text-[26px] text-ink">Welcome back</h1>
            <p className="text-steel text-[14.5px] mt-1.5">Sign in to manage your catalog and inquiries.</p>
          </div>

          {/* Card */}
          <div className="bg-white border border-line rounded-2xl shadow-card p-7">
            {err && (
              <div className="bg-[#FDECEA] border border-[#F5C2BA] text-[#B23120] px-3.5 py-3 rounded-lg text-[13.5px] mb-4">{err}</div>
            )}
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="field-label">Email</label>
                <input
                  type="email" required autoFocus autoComplete="email"
                  className="input" placeholder="you@company.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="field-label">Password</label>
                <div className="relative">
                  <input
                    type={show ? "text" : "password"} required autoComplete="current-password"
                    className="input pr-16" placeholder="••••••••"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[11px] uppercase tracking-wide text-steel hover:text-brand"
                  >
                    {show ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <button className="btn btn-primary w-full justify-center" disabled={busy}>
                {busy ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </div>

          <Link to="/" className="block text-center mt-6 text-[13px] text-steel hover:text-brand transition-colors">
            ← Back to website
          </Link>
        </div>
      </main>
    </div>
  );
}
