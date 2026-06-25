import { useMemo, useState } from "react";
import type { Catalog, Product } from "../../lib/types";
import { deleteProduct } from "../../lib/api";
import { cn, primaryImage } from "../../lib/utils";
import ProductForm from "./ProductForm";

type SortKey = "order" | "name" | "newest";

export default function ProductsPanel({ catalog, reload, canWrite }: { catalog: Catalog; reload: () => void; canWrite: boolean }) {
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("order");
  const [busyId, setBusyId] = useState<string | null>(null);

  const catName = (id: string | null) => catalog.categories.find((c) => c.id === id)?.name ?? "Uncategorized";

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    let rows = catalog.products.filter(
      (p) => !t || p.name.toLowerCase().includes(t) || (p.model ?? "").toLowerCase().includes(t) || catName(p.category_id).toLowerCase().includes(t)
    );
    rows = [...rows].sort((a, b) =>
      sort === "name" ? a.name.localeCompare(b.name)
      : sort === "newest" ? b.id.localeCompare(a.id)
      : a.sort_order - b.sort_order
    );
    return rows;
  }, [catalog.products, catalog.categories, q, sort]);

  if (editing) {
    return (
      <ProductForm
        catalog={catalog}
        product={editing === "new" ? null : editing}
        onDone={() => { setEditing(null); reload(); }}
        onCancel={() => setEditing(null)}
      />
    );
  }

  async function del(p: Product) {
    if (!confirm(`Delete ${p.name}?`)) return;
    setBusyId(p.id);
    try { await deleteProduct(p.id); reload(); } finally { setBusyId(null); }
  }

  return (
    <div>
      <div className="flex justify-between items-center gap-3 flex-wrap mb-4">
        <h2 className="text-[22px]">Products <span className="text-steel text-[15px]">({list.length})</span></h2>
        {canWrite && <button className="btn btn-primary btn-sm" onClick={() => setEditing("new")}>+ New product</button>}
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        <input className="input max-w-[280px]" placeholder="Search name, model, category…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input max-w-[160px]" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
          <option value="order">Sort: manual order</option>
          <option value="name">Sort: name (A–Z)</option>
          <option value="newest">Sort: newest</option>
        </select>
      </div>

      <div className="panel">
        {list.map((p) => (
          <div key={p.id} className="flex items-center gap-3.5 py-3 border-b border-line-2 last:border-0">
            <img className="w-[54px] h-[42px] rounded-sm object-cover flex-none" src={primaryImage(p)} alt="" />
            <div className="flex-1 min-w-0">
              <b>{p.name}</b>
              <div className="font-mono text-[12px] text-steel">{p.model || "—"} · {catName(p.category_id)}</div>
            </div>
            <span className={cn("font-mono text-[10.5px] uppercase tracking-wide px-2 py-0.5 rounded-full", p.is_published ? "bg-[#E8F7EF] text-[#137A43]" : "bg-[#FCE9E9] text-[#B23030]")}>
              {p.is_published ? "Live" : "Hidden"}
            </span>
            {p.is_featured && <span className="font-mono text-[10.5px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-accent-soft text-accent-d">Featured</span>}
            {canWrite ? (
              <>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(p)}>Edit</button>
                <button className="btn btn-sm bg-[#FCE9E9] text-[#B23030]" disabled={busyId === p.id} onClick={() => del(p)}>Delete</button>
              </>
            ) : (
              <span className="font-mono text-[11px] text-steel">read-only</span>
            )}
          </div>
        ))}
        {!list.length && <p className="text-steel">{q ? "No products match your search." : "No products yet."}</p>}
      </div>
    </div>
  );
}
