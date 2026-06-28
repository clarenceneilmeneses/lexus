import { useEffect, useMemo, useState } from "react";
import type { Profile, Role } from "../../lib/types";
import { adminCreateUser, adminDeleteUser, fetchProfiles, setUserRole } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "../../lib/utils";
import Pagination from "../../components/Pagination";
import { usePagination } from "../../hooks/usePagination";
import { StatCard, StatRow } from "../../components/StatCard";

const ROLES: Role[] = ["viewer", "editor", "admin"];
const ROLE_PILL: Record<Role, string> = {
  admin: "bg-corp-soft text-corp-navy",
  editor: "bg-[#E8F7EF] text-[#137A43]",
  viewer: "bg-line-2 text-steel",
};

export default function UsersPanel() {
  const { session } = useAuth();
  const [rows, setRows] = useState<Profile[] | null>(null);
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  // ---- New-account form ----
  const [showNew, setShowNew] = useState(false);
  const [nEmail, setNEmail] = useState("");
  const [nPassword, setNPassword] = useState("");
  const [nRole, setNRole] = useState<Role>("viewer");
  const [creating, setCreating] = useState(false);

  async function load() {
    setErr("");
    try { setRows(await fetchProfiles()); }
    catch (e: any) { setErr(e.message ?? "Failed to load users."); setRows([]); }
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (rows ?? []).filter((r) => !t || (r.email ?? "").toLowerCase().includes(t) || r.role.includes(t));
  }, [rows, q]);

  const { page, setPage, totalPages, pageItems, total, from, to } = usePagination(filtered, 10, q);

  async function changeRole(p: Profile, role: Role) {
    setSavingId(p.id); setErr(""); setMsg("");
    try {
      await setUserRole(p.id, role);
      setRows((rs) => (rs ?? []).map((r) => (r.id === p.id ? { ...r, role } : r)));
    } catch (e: any) {
      setErr(e.message ?? "Failed to update role.");
    } finally { setSavingId(null); }
  }

  async function createAccount() {
    setErr(""); setMsg("");
    const email = nEmail.trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) { setErr("Enter a valid email address."); return; }
    if (nPassword.length < 8) { setErr("Password must be at least 8 characters."); return; }
    setCreating(true);
    try {
      await adminCreateUser({ email, password: nPassword, role: nRole });
      setMsg(`Account created for ${email} (${nRole}).`);
      setNEmail(""); setNPassword(""); setNRole("viewer"); setShowNew(false);
      await load();
      setTimeout(() => setMsg(""), 4000);
    } catch (e: any) {
      setErr(e.message ?? "Failed to create account.");
    } finally { setCreating(false); }
  }

  async function removeUser(p: Profile) {
    if (!confirm(`Permanently delete ${p.email || "this user"}? They will lose all access. This cannot be undone.`)) return;
    setSavingId(p.id); setErr(""); setMsg("");
    try {
      await adminDeleteUser(p.id);
      setRows((rs) => (rs ?? []).filter((r) => r.id !== p.id));
      setMsg("User deleted.");
      setTimeout(() => setMsg(""), 3000);
    } catch (e: any) {
      setErr(e.message ?? "Failed to delete user.");
    } finally { setSavingId(null); }
  }

  return (
    <div>
      <div className="flex justify-between items-center gap-3 flex-wrap mb-4">
        <h2 className="text-[22px]">Users &amp; roles <span className="text-steel text-[15px]">({rows?.length ?? 0})</span></h2>
        <div className="flex gap-2 flex-wrap">
          <input className="input max-w-[240px]" placeholder="Search email or role…" value={q} onChange={(e) => setQ(e.target.value)} />
          <button className="btn btn-primary btn-sm" onClick={() => { setShowNew((v) => !v); setErr(""); }}>
            {showNew ? "Close" : "+ New account"}
          </button>
        </div>
      </div>

      <StatRow>
        <StatCard label="Total users" value={rows?.length ?? "…"} />
        <StatCard label="Admins" value={(rows ?? []).filter((r) => r.role === "admin").length} tone="navy" />
        <StatCard label="Editors" value={(rows ?? []).filter((r) => r.role === "editor").length} tone="green" />
        <StatCard label="Viewers" value={(rows ?? []).filter((r) => r.role === "viewer").length} tone="steel" />
      </StatRow>

      {showNew && (
        <div className="panel mb-4">
          <h3 className="text-base mb-3">Create a new account</h3>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1"><label className="field-label">Email</label>
              <input className="input" type="email" autoComplete="off" value={nEmail} onChange={(e) => setNEmail(e.target.value)} placeholder="name@company.com" /></div>
            <div className="sm:col-span-1"><label className="field-label">Temporary password</label>
              <input className="input" type="text" autoComplete="new-password" value={nPassword} onChange={(e) => setNPassword(e.target.value)} placeholder="At least 8 characters" /></div>
            <div className="sm:col-span-1"><label className="field-label">Role</label>
              <select className="input" value={nRole} onChange={(e) => setNRole(e.target.value as Role)}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select></div>
          </div>
          <div className="flex gap-2 mt-3.5">
            <button className="btn btn-primary btn-sm" onClick={createAccount} disabled={creating}>{creating ? "Creating…" : "Create account"}</button>
            <button className="btn btn-ghost btn-sm" onClick={() => { setShowNew(false); setErr(""); }} disabled={creating}>Cancel</button>
          </div>
          <p className="text-steel text-[12px] mt-3">
            The account is confirmed immediately and can sign in with this password right away. Share it securely and ask them to change it.
          </p>
        </div>
      )}

      <div className="panel bg-corp-soft/30 border-corp-soft mb-4">
        <p className="text-[13.5px] text-corp-navy">
          <b>Roles:</b> <b>admin</b> (full access incl. users &amp; settings), <b>editor</b> (manage products,
          categories, inquiries, content), <b>viewer</b> (read-only). You can't change or delete your own account here.
        </p>
      </div>

      {err && <div className="bg-[#FDECEA] border border-[#F5C2BA] text-[#B23120] px-3.5 py-3 rounded text-[13.5px] mb-4">{err}</div>}
      {msg && <div className="bg-[#E8F7EF] border border-[#B6E6CB] text-[#137A43] px-3.5 py-3 rounded text-[13.5px] mb-4">{msg}</div>}

      <div className="panel">
        {rows === null ? (
          <p className="font-mono text-steel">Loading users…</p>
        ) : filtered.length === 0 ? (
          <p className="text-steel">No users match.</p>
        ) : (
          pageItems.map((p) => {
            const isSelf = p.id === session?.user.id;
            return (
              <div key={p.id} className="flex items-center gap-3.5 py-3 border-b border-line-2 last:border-0">
                <div className="flex-1 min-w-0">
                  <b className="break-all">{p.email || "—"}</b>
                  {isSelf && <span className="ml-2 font-mono text-[10.5px] uppercase tracking-wide text-steel">(you)</span>}
                  <div className="font-mono text-[12px] text-steel">Joined {new Date(p.created_at).toLocaleDateString()}</div>
                </div>
                <span className={cn("font-mono text-[10.5px] uppercase tracking-wide px-2 py-0.5 rounded-full", ROLE_PILL[p.role])}>{p.role}</span>
                <select
                  className="input max-w-[130px] py-2"
                  value={p.role}
                  disabled={savingId === p.id || isSelf}
                  title={isSelf ? "You can't change your own role" : undefined}
                  onChange={(e) => changeRole(p, e.target.value as Role)}
                >
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <button
                  className="btn btn-sm bg-[#FCE9E9] text-[#B23030] disabled:opacity-40"
                  disabled={savingId === p.id || isSelf}
                  title={isSelf ? "You can't delete your own account" : "Delete user"}
                  onClick={() => removeUser(p)}
                >
                  Delete
                </button>
              </div>
            );
          })
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPage={setPage} from={from} to={to} total={total} />
    </div>
  );
}
