import { useEffect, useState } from "react";
import type { Catalog, Inquiry } from "../../lib/types";
import { fetchInquiries } from "../../lib/api";
import { cn } from "../../lib/utils";

type Nav = "products" | "categories" | "inquiries" | "content";

function Stat({ label, value, tone = "navy" }: { label: string; value: number | string; tone?: "navy" | "orange" | "green" | "steel" }) {
  const tones = {
    navy: "text-corp-navy",
    orange: "text-corp-orange",
    green: "text-[#137A43]",
    steel: "text-steel",
  } as const;
  return (
    <div className="panel">
      <div className={cn("font-display font-black text-[34px] leading-none", tones[tone])}>{value}</div>
      <div className="font-mono text-[11px] tracking-[0.1em] uppercase text-steel mt-2">{label}</div>
    </div>
  );
}

export default function Dashboard({ catalog, go }: { catalog: Catalog; go: (tab: Nav) => void }) {
  const [inquiries, setInquiries] = useState<Inquiry[] | null>(null);

  useEffect(() => { fetchInquiries().then(setInquiries).catch(() => setInquiries([])); }, []);

  const live = catalog.products.filter((p) => p.is_published).length;
  const featured = catalog.products.filter((p) => p.is_featured).length;
  const newInq = (inquiries ?? []).filter((i) => i.status === "new").length;

  return (
    <div>
      <h2 className="text-[22px] mb-4">Dashboard</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Stat label="Products" value={catalog.products.length} />
        <Stat label="Live products" value={live} tone="green" />
        <Stat label="Categories" value={catalog.categories.length} tone="steel" />
        <Stat label="New inquiries" value={inquiries === null ? "…" : newInq} tone="orange" />
      </div>

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
              <div className="font-display font-bold text-corp-navy">{featured} products on the homepage</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
