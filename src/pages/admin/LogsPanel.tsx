import { useEffect, useMemo, useState } from "react";
import type { AuditEntry } from "../../lib/types";
import { fetchAuditLog } from "../../lib/api";
import { cn } from "../../lib/utils";
import { ACTION_PILL, ACTION_VERB, entityLabel, relativeTime } from "../../lib/audit";
import Pagination from "../../components/Pagination";
import { usePagination } from "../../hooks/usePagination";
import { StatCard, StatRow } from "../../components/StatCard";

// Keys not worth showing in a snapshot (ids/derived/empty noise).
const HIDDEN_KEYS = new Set(["id", "search_tsv", "updated_at", "created_at"]);

function formatVal(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "boolean") return v ? "yes" : "no";
  if (typeof v === "string") return v.length > 140 ? v.slice(0, 140) + "…" : v;
  const s = JSON.stringify(v);
  return s.length > 200 ? s.slice(0, 200) + "…" : s;
}

const isDiff = (v: any) => v && typeof v === "object" && ("from" in v || "to" in v);

/** Renders either an update diff ({field:{from,to}}) or an insert/delete snapshot. */
function Changes({ changes }: { changes: Record<string, any> | null }) {
  if (!changes) return <p className="text-steel text-[12.5px]">No field details recorded.</p>;
  const entries = Object.entries(changes).filter(([k]) => !HIDDEN_KEYS.has(k));
  if (!entries.length) return <p className="text-steel text-[12.5px]">No field details recorded.</p>;
  return (
    <div className="mt-2 grid gap-1.5">
      {entries.map(([k, v]) => (
        <div key={k} className="grid grid-cols-[120px_1fr] gap-2 text-[12.5px]">
          <span className="font-mono text-steel break-all">{k}</span>
          {isDiff(v) ? (
            <span className="break-words">
              <span className="line-through text-steel">{formatVal(v.from)}</span>
              <span className="mx-1.5 text-steel">→</span>
              <span className="text-corp-navy font-medium">{formatVal(v.to)}</span>
            </span>
          ) : (
            <span className="break-words text-corp-navy">{formatVal(v)}</span>
          )}
        </div>
      ))}
    </div>
  );
}

type ActionFilter = "all" | AuditEntry["action"];

export default function LogsPanel() {
  const [rows, setRows] = useState<AuditEntry[] | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [entity, setEntity] = useState<string>("all");
  const [action, setAction] = useState<ActionFilter>("all");
  const [open, setOpen] = useState<Set<number>>(new Set());

  async function load() {
    setErr(""); setLoading(true);
    try { setRows(await fetchAuditLog(500)); }
    catch (e: any) { setErr(e.message ?? "Failed to load activity log."); setRows([]); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const all = rows ?? [];
  const created = all.filter((r) => r.action === "insert").length;
  const updated = all.filter((r) => r.action === "update").length;
  const deleted = all.filter((r) => r.action === "delete").length;

  const entityOptions = useMemo(() => {
    const set = new Map<string, number>();
    for (const r of all) set.set(r.entity, (set.get(r.entity) ?? 0) + 1);
    return [...set.entries()].map(([value, count]) => ({ value, count }));
  }, [all]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return all.filter((r) => {
      if (entity !== "all" && r.entity !== entity) return false;
      if (action !== "all" && r.action !== action) return false;
      if (!t) return true;
      return (
        (r.label ?? "").toLowerCase().includes(t) ||
        (r.actor_email ?? "").toLowerCase().includes(t) ||
        entityLabel(r.entity).toLowerCase().includes(t)
      );
    });
  }, [all, q, entity, action]);

  const { page, setPage, totalPages, pageItems, total, from, to } = usePagination(filtered, 20, `${q}|${entity}|${action}`);

  function toggle(id: number) {
    setOpen((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div>
      <div className="flex justify-between items-center gap-3 flex-wrap mb-4">
        <h2 className="text-[22px]">Activity log <span className="text-steel text-[15px]">({all.length})</span></h2>
        <button className="btn btn-ghost btn-sm" onClick={load} disabled={loading}>{loading ? "Refreshing…" : "↻ Refresh"}</button>
      </div>

      <StatRow>
        <StatCard label="Total events" value={rows === null ? "…" : all.length} />
        <StatCard label="Created" value={created} tone="green" />
        <StatCard label="Updated" value={updated} tone="navy" />
        <StatCard label="Deleted" value={deleted} tone="orange" />
      </StatRow>

      <div className="panel bg-corp-soft/30 border-corp-soft mb-4">
        <p className="text-[13.5px] text-corp-navy">
          A read-only history of every change to products, categories, content, settings and user roles —
          captured at the database level, so it can't be edited or bypassed. Showing the most recent 500 events.
        </p>
      </div>

      {err && <div className="bg-[#FDECEA] border border-[#F5C2BA] text-[#B23120] px-3.5 py-3 rounded text-[13.5px] mb-4">{err}</div>}

      <div className="flex gap-2 flex-wrap mb-4">
        <input className="input max-w-[280px]" placeholder="Search record or person…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input max-w-[200px]" value={entity} onChange={(e) => setEntity(e.target.value)}>
          <option value="all">All types ({all.length})</option>
          {entityOptions.map((o) => (
            <option key={o.value} value={o.value}>{entityLabel(o.value)} ({o.count})</option>
          ))}
        </select>
        <select className="input max-w-[160px]" value={action} onChange={(e) => setAction(e.target.value as ActionFilter)}>
          <option value="all">All actions</option>
          <option value="insert">Created</option>
          <option value="update">Updated</option>
          <option value="delete">Deleted</option>
        </select>
        {(q || entity !== "all" || action !== "all") && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setQ(""); setEntity("all"); setAction("all"); }}>Clear filters</button>
        )}
      </div>

      <div className="panel">
        {rows === null ? (
          <p className="font-mono text-steel">Loading activity…</p>
        ) : filtered.length === 0 ? (
          <p className="text-steel">{all.length ? "No events match your filters." : "No activity recorded yet."}</p>
        ) : (
          pageItems.map((r) => {
            const isOpen = open.has(r.id);
            return (
              <div key={r.id} className="py-3 border-b border-line-2 last:border-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={cn("font-mono text-[10.5px] uppercase tracking-wide px-2 py-0.5 rounded-full flex-none", ACTION_PILL[r.action])}>
                    {ACTION_VERB[r.action]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <b className="break-words">{entityLabel(r.entity)}: {r.label || "—"}</b>
                    <div className="font-mono text-[12px] text-steel">
                      {r.actor_email || "system"} · {relativeTime(r.created_at)}
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-sm flex-none" onClick={() => toggle(r.id)} title={new Date(r.created_at).toLocaleString()}>
                    {isOpen ? "Hide" : "Details"}
                  </button>
                </div>
                {isOpen && (
                  <div className="mt-1.5 pl-1 border-l-2 border-line-2 ml-1">
                    <div className="pl-3">
                      <div className="font-mono text-[11px] text-steel mb-1">{new Date(r.created_at).toLocaleString()}</div>
                      <Changes changes={r.changes} />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPage={setPage} from={from} to={to} total={total} />
    </div>
  );
}
