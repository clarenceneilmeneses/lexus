import { useMemo, useState } from "react";
import type { Catalog } from "../../lib/types";
import { deleteCategory, saveCategory } from "../../lib/api";
import { slugify } from "../../lib/utils";

export default function CategoriesPanel({ catalog, reload, canWrite }: { catalog: Catalog; reload: () => void; canWrite: boolean }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return catalog.categories.filter((c) => !t || c.name.toLowerCase().includes(t) || c.slug.includes(t));
  }, [catalog.categories, q]);

  async function add() {
    if (!name) return;
    setBusy(true);
    try {
      await saveCategory({ name, slug: slugify(name), description: desc, sort_order: catalog.categories.length + 1 });
      setName(""); setDesc(""); reload();
    } finally { setBusy(false); }
  }

  return (
    <div>
      <div className="flex justify-between items-center gap-3 flex-wrap mb-4">
        <h2 className="text-[22px]">Categories <span className="text-steel text-[15px]">({list.length})</span></h2>
        <input className="input max-w-[260px]" placeholder="Search categories…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="panel mb-4.5">
        {list.map((c) => (
          <div key={c.id} className="flex items-center gap-3.5 py-3 border-b border-line-2 last:border-0">
            <div className="flex-1">
              <b>{c.name}</b>
              <div className="font-mono text-[12px] text-steel">/{c.slug} · {catalog.products.filter((p) => p.category_id === c.id).length} products</div>
            </div>
            {canWrite ? (
              <button className="btn btn-sm bg-[#FCE9E9] text-[#B23030]"
                onClick={async () => { if (confirm(`Delete category "${c.name}"? Products keep existing but lose this category.`)) { await deleteCategory(c.id); reload(); } }}>
                Delete
              </button>
            ) : (
              <span className="font-mono text-[11px] text-steel">read-only</span>
            )}
          </div>
        ))}
        {!list.length && <p className="text-steel">{q ? "No categories match." : "No categories yet."}</p>}
      </div>

      {canWrite && (
        <div className="panel">
          <h3 className="text-base mb-3">Add category</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="field-label">Name</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><label className="field-label">Description</label><input className="input" value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
          </div>
          <button className="btn btn-primary btn-sm mt-3.5" onClick={add} disabled={busy}>+ Add category</button>
        </div>
      )}
    </div>
  );
}
