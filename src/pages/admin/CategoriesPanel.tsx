import { useMemo, useRef, useState } from "react";
import type { Catalog, Category } from "../../lib/types";
import { deleteCategory, saveCategory, uploadSiteImage } from "../../lib/api";
import { imgUrl, slugify } from "../../lib/utils";
import Pagination from "../../components/Pagination";
import { usePagination } from "../../hooks/usePagination";
import { StatCard, StatRow } from "../../components/StatCard";

type Draft = { name: string; slug: string; description: string; image_path: string | null };
const emptyDraft: Draft = { name: "", slug: "", description: "", image_path: null };

export default function CategoriesPanel({ catalog, reload, canWrite }: { catalog: Catalog; reload: () => void; canWrite: boolean }) {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null); // inline row edit
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;
    setUploading(true); setErr("");
    try {
      const path = await uploadSiteImage(file, "categories");
      setDraft((d) => ({ ...d, image_path: path }));
    } catch (e: any) {
      setErr(e?.message ?? "Could not upload image.");
    } finally { setUploading(false); }
  }

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return catalog.categories.filter((c) => !t || c.name.toLowerCase().includes(t) || c.slug.includes(t));
  }, [catalog.categories, q]);

  const { page, setPage, totalPages, pageItems, total, from, to } = usePagination(list, 10, q);

  const catIds = new Set(catalog.categories.map((c) => c.id));
  const uncategorized = catalog.products.filter((p) => !p.category_id || !catIds.has(p.category_id)).length;
  const categorized = catalog.products.length - uncategorized;

  function startAdd() { setEditing(null); setAdding(true); setDraft(emptyDraft); setErr(""); }
  function startEdit(c: Category) {
    setAdding(false);
    setEditing(c);
    setDraft({ name: c.name, slug: c.slug, description: c.description ?? "", image_path: c.image_path ?? null });
    setErr("");
  }
  function cancel() { setEditing(null); setAdding(false); setDraft(emptyDraft); setErr(""); }

  async function save() {
    const name = draft.name.trim();
    if (!name) { setErr("Name is required."); return; }
    setBusy(true); setErr("");
    try {
      await saveCategory(
        {
          name,
          slug: (draft.slug.trim() || slugify(name)),
          description: draft.description.trim(),
          image_path: draft.image_path,
          sort_order: editing ? editing.sort_order : catalog.categories.length + 1,
        },
        editing?.id
      );
      cancel();
      reload();
    } catch (e: any) {
      setErr(e?.message ?? "Could not save category.");
    } finally { setBusy(false); }
  }

  async function del(c: Category) {
    if (!confirm(`Delete category "${c.name}"? Products keep existing but lose this category.`)) return;
    setBusy(true); setErr("");
    try { await deleteCategory(c.id); if (editing?.id === c.id) cancel(); reload(); }
    catch (e: any) { setErr(e?.message ?? "Could not delete category."); }
    finally { setBusy(false); }
  }

  const imageField = (
    <div className="sm:col-span-2">
      <label className="field-label">Tile image</label>
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-corp-soft border border-line grid place-items-center shrink-0">
          {draft.image_path
            ? <img src={imgUrl(draft.image_path)!} alt="" className="w-full h-full object-cover" />
            : <span className="font-mono text-[10px] text-steel">none</span>}
        </div>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickImage} />
        <button type="button" className="btn btn-ghost btn-sm" disabled={uploading} onClick={() => fileRef.current?.click()}>
          {uploading ? "Uploading…" : draft.image_path ? "Replace" : "Upload image"}
        </button>
        {draft.image_path && (
          <button type="button" className="btn btn-sm bg-[#FCE9E9] text-[#B23030]" disabled={uploading} onClick={() => setDraft((d) => ({ ...d, image_path: null }))}>
            Remove
          </button>
        )}
      </div>
      <p className="font-mono text-[11px] text-steel mt-1.5">Shown on the home “Shop by category” mosaic. Square images work best.</p>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center gap-3 flex-wrap mb-4">
        <h2 className="text-[22px]">Categories <span className="text-steel text-[15px]">({list.length})</span></h2>
        {canWrite && (
          <button className="btn btn-primary btn-sm" onClick={() => (adding ? cancel() : startAdd())}>
            {adding ? "Close" : "+ New category"}
          </button>
        )}
      </div>

      <StatRow>
        <StatCard label="Categories" value={catalog.categories.length} />
        <StatCard label="Categorized products" value={categorized} tone="green" />
        <StatCard label="Uncategorized" value={uncategorized} tone={uncategorized ? "orange" : "steel"} />
      </StatRow>

      {err && <div className="bg-[#FDECEA] border border-[#F5C2BA] text-[#B23120] px-3.5 py-3 rounded text-[13.5px] mb-4">{err}</div>}

      {/* Add form — appears at the top, right where the New button is */}
      {canWrite && adding && (
        <div className="panel mb-4.5 border-corp-soft">
          <h3 className="text-base mb-3">New category</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="field-label">Name</label><input className="input" autoFocus value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
            <div><label className="field-label">Slug</label><input className="input" value={draft.slug} placeholder={slugify(draft.name)} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="field-label">Description</label><input className="input" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></div>
            {imageField}
          </div>
          <div className="flex gap-2 mt-3.5">
            <button className="btn btn-primary btn-sm" onClick={save} disabled={busy}>{busy ? "Adding…" : "+ Add category"}</button>
            <button className="btn btn-ghost btn-sm" onClick={cancel} disabled={busy}>Cancel</button>
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap mb-4">
        <input className="input max-w-[280px]" placeholder="Search categories…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="panel mb-4.5">
        {pageItems.map((c) => (
          <div key={c.id} className="py-3 border-b border-line-2 last:border-0">
            {editing?.id === c.id ? (
              <div className="grid sm:grid-cols-2 gap-3">
                <div><label className="field-label">Name</label><input className="input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
                <div><label className="field-label">Slug</label><input className="input" value={draft.slug} placeholder={slugify(draft.name)} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} /></div>
                <div className="sm:col-span-2"><label className="field-label">Description</label><input className="input" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></div>
                {imageField}
                <div className="sm:col-span-2 flex gap-2">
                  <button className="btn btn-primary btn-sm" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
                  <button className="btn btn-ghost btn-sm" onClick={cancel} disabled={busy}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-lg overflow-hidden bg-corp-soft border border-line grid place-items-center shrink-0">
                  {c.image_path
                    ? <img src={imgUrl(c.image_path)!} alt="" className="w-full h-full object-cover" />
                    : <span className="font-mono text-[9px] text-steel">no img</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <b>{c.name}</b>
                  <div className="font-mono text-[12px] text-steel">/{c.slug} · {catalog.products.filter((p) => p.category_id === c.id).length} products</div>
                </div>
                {canWrite ? (
                  <>
                    <button className="btn btn-ghost btn-sm" onClick={() => startEdit(c)}>Edit</button>
                    <button className="btn btn-sm bg-[#FCE9E9] text-[#B23030]" disabled={busy} onClick={() => del(c)}>Delete</button>
                  </>
                ) : (
                  <span className="font-mono text-[11px] text-steel">read-only</span>
                )}
              </div>
            )}
          </div>
        ))}
        {!list.length && <p className="text-steel">{q ? "No categories match." : "No categories yet — add your first with “+ New category”."}</p>}
        <Pagination page={page} totalPages={totalPages} onPage={setPage} from={from} to={to} total={total} />
      </div>
    </div>
  );
}
