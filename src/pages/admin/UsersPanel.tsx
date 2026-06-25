import { useEffect, useMemo, useState } from "react";
import type { Profile, Role } from "../../lib/types";
import { fetchProfiles, setUserRole } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "../../lib/utils";

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
  const [savingId, setSavingId] = useState<string | null>(null);

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

  async function changeRole(p: Profile, role: Role) {
    setSavingId(p.id); setErr("");
    try {
      await setUserRole(p.id, role);
      setRows((rs) => (rs ?? []).map((r) => (r.id === p.id ? { ...r, role } : r)));
    } catch (e: any) {
      setErr(e.message ?? "Failed to update role.");
    } finally { setSavingId(null); }
  }

  return (
    <div>
      <div className="flex justify-between items-center gap-3 flex-wrap mb-4">
        <h2 className="text-[22px]">Users &amp; roles <span className="text-steel text-[15px]">({rows?.length ?? 0})</span></h2>
        <input className="input max-w-[260px]" placeholder="Search email or role…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="panel bg-corp-soft/30 border-corp-soft mb-4">
        <p className="text-[13.5px] text-corp-navy">
          <b>Note:</b> new accounts are created in <span className="font-mono">Supabase → Authentication → Users</span> and
          start as <b>viewer</b>. Promote them here. Roles: <b>admin</b> (full access incl. users &amp; settings),
          <b> editor</b> (manage products, categories, inquiries, content), <b>viewer</b> (read-only).
        </p>
      </div>

      {err && <div className="bg-[#FDECEA] border border-[#F5C2BA] text-[#B23120] px-3.5 py-3 rounded text-[13.5px] mb-4">{err}</div>}

      <div className="panel">
        {rows === null ? (
          <p className="font-mono text-steel">Loading users…</p>
        ) : filtered.length === 0 ? (
          <p className="text-steel">No users match.</p>
        ) : (
          filtered.map((p) => {
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
                  className="input max-w-[140px] py-2"
                  value={p.role}
                  disabled={savingId === p.id || isSelf}
                  title={isSelf ? "You can't change your own role" : undefined}
                  onChange={(e) => changeRole(p, e.target.value as Role)}
                >
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
