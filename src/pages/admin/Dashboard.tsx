import { useEffect, useState } from "react";
import type { AuditEntry, Catalog, Inquiry } from "../../lib/types";
import { fetchAuditLog, fetchInquiries } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "../../lib/utils";
import { ACTION_PILL, ACTION_VERB, entityLabel, relativeTime } from "../../lib/audit";
import { StatCard, StatRow } from "../../components/StatCard";

type Nav = "products" | "categories" | "inquiries" | "content" | "logs";

export default function Dashboard({ catalog, go }: { catalog: Catalog; go: (tab: Nav) => void }) {
  const { isAdmin } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[] | null>(null);
  const [activity, setActivity] = useState<AuditEntry[] | null>(null);

  useEffect(() => { fetchInquiries().then(setInquiries).catch(() => setInquiries([])); }, []);
  useEffect(() => {
    if (!isAdmin) return;
    fetchAuditLog(5).then(setActivity).catch(() => setActivity([]));
  }, [isAdmin]);

  const live = catalog.products.filter((p) => p.is_published).length;
  const featured = catalog.products.filter((p) => p.is_featured).length;
  const newInq = (inquiries ?? []).filter((i) => i.status === "new").length;

  return (
    <div>
      <h2 className="text-[22px] mb-4">Dashboard</h2>

      <StatRow>
        <StatCard label="Products" value={catalog.products.length} />
        <StatCard label="Live products" value={live} tone="green" />
        <StatCard label="Categories" value={catalog.categories.length} tone="steel" />
        <StatCard label="New inquiries" value={inquiries === null ? "…" : newInq} tone="orange" />
      </StatRow>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* Recent inquiries */}
        <div className="panel">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base">Recent inquiries</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => go("inquiries")}>View all →</button>
          </div>
          {inquiries === null ? (
            <p className="font-mono text-steel text-sm">Loading…</p>
          ) : inquiries.length === 0 ? (
            <p className="text-steel text-sm">No inquiries yet.</p>
          ) : (
            <div className="divide-y divide-line-2">
              {inquiries.slice(0, 5).map((r) => (
                <div key={r.id} className="py-2.5 flex items-center gap-3">
                  <span className={cn("w-2 h-2 rounded-full flex-none", r.status === "new" ? "bg-corp-orange" : "bg-line")} />
                  <div className="min-w-0 flex-1">
                    <b className="text-[14px]">{r.name}</b>
                    <div className="font-mono text-[12px] text-steel truncate">{r.subject || r.message}</div>
                  </div>
                  <span className="font-mono text-[11px] text-steel whitespace-nowrap">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="panel">
          <h3 className="text-base mb-3">Quick actions</h3>
          <div className="flex flex-col gap-2.5">
            <button className="btn btn-primary btn-sm justify-start" onClick={() => go("products")}>+ New product</button>
            <button className="btn btn-ghost btn-sm justify-start" onClick={() => go("categories")}>Manage categories</button>
            <button className="btn btn-ghost btn-sm justify-start" onClick={() => go("content")}>Edit homepage content</button>
            <div className="mt-2 pt-3 border-t border-line-2">
              <span className="font-mono text-[11px] uppercase tracking-wide text-steel">Featured</span>
              {/* The homepage shows featured products, capped at 10, and falls
                  back to the first 10 products when nothing is featured. */}
              <div className="font-display font-bold text-corp-navy">
                {featured === 0
                  ? "None picked yet"
                  : `${Math.min(featured, 10)} product${Math.min(featured, 10) === 1 ? "" : "s"} on the homepage`}
              </div>
              {featured === 0 && <p className="text-steel text-[12px] mt-0.5">The homepage is showing your first 10 products instead.</p>}
              {featured > 10 && <p className="text-steel text-[12px] mt-0.5">{featured} are marked featured — only the first 10 fit.</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity — admins only (audit log is admin-gated) */}
      {isAdmin && (
        <div className="panel mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base">Recent activity</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => go("logs")}>View all →</button>
          </div>
          {activity === null ? (
            <p className="font-mono text-steel text-sm">Loading…</p>
          ) : activity.length === 0 ? (
            <p className="text-steel text-sm">No changes recorded yet.</p>
          ) : (
            <div className="divide-y divide-line-2">
              {activity.map((r) => (
                <div key={r.id} className="py-2.5 flex items-center gap-3">
                  <span className={cn("font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full flex-none", ACTION_PILL[r.action])}>
                    {ACTION_VERB[r.action]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <b className="text-[14px] break-words">{entityLabel(r.entity)}: {r.label || "—"}</b>
                    <div className="font-mono text-[12px] text-steel truncate">{r.actor_email || "system"}</div>
                  </div>
                  <span className="font-mono text-[11px] text-steel whitespace-nowrap">{relativeTime(r.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
