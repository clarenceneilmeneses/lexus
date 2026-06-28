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
    <div className="admin-ui min-h-screen bg-paper grid place-items-center px-4 py-10">
      <div className="w-full max-w-[384px]">
        {/* Brand + welcome */}
        <div className="flex flex-col items-center text-center mb-7">
          <Brand tone="dark" className="h-12 mb-6" />
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
    </div>
  );
}
