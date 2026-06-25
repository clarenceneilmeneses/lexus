import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Brand } from "../../components/layout/Header";

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="min-h-screen bg-paper grid">
      <div className="w-full max-w-sm mx-auto my-[9vh] bg-white border border-line rounded-lg overflow-hidden shadow-card">
        <div className="bg-ink px-8 py-6"><Brand className="h-9" /></div>
        <div className="p-8">
        <h2 className="text-[22px] font-bold mb-1">Staff sign in</h2>
        <p className="text-steel text-sm mb-5">Manage products, categories, and inquiries.</p>
        {err && <div className="bg-[#FDECEA] border border-[#F5C2BA] text-[#B23120] px-3.5 py-3 rounded text-[13.5px] mb-3.5">{err}</div>}
        <form onSubmit={onSubmit}>
          <div className="mb-3.5"><label className="field-label">Email</label><input type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="mb-3.5"><label className="field-label">Password</label><input type="password" required className="input" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <button className="btn btn-primary w-full justify-center" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
        </form>
        <Link to="/" className="block text-center mt-4 font-mono text-[12px] text-steel hover:text-brand">← Back to website</Link>
        </div>
      </div>
    </div>
  );
}
