import { useState } from "react";
import type { Catalog, Product, ProductImage, Spec } from "../../lib/types";
import { deleteProductImage, saveProduct, setPrimaryImage, uploadProductImage } from "../../lib/api";
import { cn, imgUrl, slugify } from "../../lib/utils";

interface Props {
  catalog: Catalog;
  product: Product | null;
  onDone: () => void;
  onCancel: () => void;
}

export default function ProductForm({ catalog, product, onDone, onCancel }: Props) {
  const [f, setF] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    category_id: (product?.category_id ?? catalog.categories[0]?.id ?? null) as string | null,
    brand: product?.brand ?? "Lexus",
    model: product?.model ?? "",
    short_description: product?.short_description ?? "",
    description: product?.description ?? "",
    price_text: product?.price_text ?? "Request a quote",
    is_featured: product?.is_featured ?? false,
    is_published: product?.is_published ?? true,
    specs: (product?.specs ?? []) as Spec[],
  });
  const [images, setImages] = useState<ProductImage[]>(product?.images ?? []);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const up = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((s) => ({ ...s, [k]: v }));
  const setSpec = (i: number, k: keyof Spec, v: string) =>
    setF((s) => { const specs = [...s.specs]; specs[i] = { ...specs[i], [k]: v }; return { ...s, specs }; });

  async function save() {
    setErr("");
    if (!f.name) { setErr("Name is required."); return; }
    setBusy(true);
    try {
      await saveProduct(
        {
          name: f.name,
          slug: f.slug || slugify(f.name),
          category_id: f.category_id,
          brand: f.brand,
          model: f.model,
          short_description: f.short_description,
          description: f.description,
          specs: f.specs.filter((s) => s.label || s.value),
          price_text: f.price_text,
          is_featured: f.is_featured,
          is_published: f.is_published,
        },
        product?.id
      );
      onDone();
    } catch (e: any) {
      setErr(e?.message ?? "Could not save."); setBusy(false);
    }
  }

  async function addImages(files: File[]) {
    if (!product) { setErr("Save the product first, then add images."); return; }
    setErr("");
    for (const file of files) {
      try {
        const row = await uploadProductImage(product.id, file, images.length === 0);
        setImages((im) => [...im, row]);
      } catch (e: any) { setErr(e?.message ?? "Upload failed."); }
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[22px]">{product ? "Edit product" : "New product"}</h2>
        <button className="btn btn-ghost btn-sm" onClick={onCancel}>← Back to list</button>
      </div>
      {err && <div className="bg-[#FDECEA] border border-[#F5C2BA] text-[#B23120] px-3.5 py-3 rounded text-[13.5px] mb-3.5">{err}</div>}

      <div className="panel space-y-3.5">
        <div className="grid sm:grid-cols-2 gap-3">
          <div><label className="field-label">Product name *</label>
            <input className="input" value={f.name} onChange={(e) => up("name", e.target.value)} onBlur={() => { if (!f.slug) up("slug", slugify(f.name)); }} /></div>
          <div><label className="field-label">URL slug</label>
            <input className="input" value={f.slug} placeholder={slugify(f.name)} onChange={(e) => up("slug", e.target.value)} /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><label className="field-label">Category</label>
            <select className="input" value={f.category_id ?? ""} onChange={(e) => up("category_id", e.target.value || null)}>
              <option value="">— none —</option>
              {catalog.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select></div>
          <div><label className="field-label">Price text</label>
            <input className="input" value={f.price_text} onChange={(e) => up("price_text", e.target.value)} /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><label className="field-label">Brand</label><input className="input" value={f.brand} onChange={(e) => up("brand", e.target.value)} /></div>
          <div><label className="field-label">Model / part no.</label><input className="input" value={f.model} onChange={(e) => up("model", e.target.value)} /></div>
        </div>
        <div><label className="field-label">Short description</label><input className="input" value={f.short_description} onChange={(e) => up("short_description", e.target.value)} /></div>
        <div><label className="field-label">Full description</label><textarea className="input min-h-[110px]" value={f.description} onChange={(e) => up("description", e.target.value)} /></div>

        <div>
          <label className="field-label">Specifications</label>
          {f.specs.map((s, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-2">
              <input className="input" placeholder="Label (e.g. Power)" value={s.label} onChange={(e) => setSpec(i, "label", e.target.value)} />
              <input className="input" placeholder="Value (e.g. 720 W)" value={s.value} onChange={(e) => setSpec(i, "value", e.target.value)} />
              <button className="btn btn-sm bg-[#FCE9E9] text-[#B23030]" onClick={() => up("specs", f.specs.filter((_, j) => j !== i))}>✕</button>
            </div>
          ))}
          <button className="btn btn-ghost btn-sm" onClick={() => up("specs", [...f.specs, { label: "", value: "" }])}>+ Add spec</button>
        </div>

        <div>
          <label className="field-label">Images</label>
          <div className="flex gap-2.5 flex-wrap mb-2.5">
            {images.map((im) => (
              <div key={im.id} className="relative w-[90px] h-[72px] border border-line rounded-sm overflow-hidden">
                <img src={imgUrl(im.storage_path)!} alt="" className="w-full h-full object-cover" />
                <button className="absolute top-0.5 right-0.5 bg-black/60 text-white w-5 h-5 rounded-sm text-[13px] leading-none"
                  title="Remove" onClick={async () => { await deleteProductImage(im); setImages((l) => l.filter((x) => x.id !== im.id)); }}>✕</button>
                <button className={cn("absolute bottom-0.5 left-0.5 text-white rounded-sm text-[10px] px-1.5 py-0.5 font-mono", im.is_primary ? "bg-brand" : "bg-black/55")}
                  onClick={async () => { await setPrimaryImage(im); setImages((l) => l.map((x) => ({ ...x, is_primary: x.id === im.id }))); }}>
                  {im.is_primary ? "★ main" : "set main"}
                </button>
              </div>
            ))}
          </div>
          {product ? (
            <label className="btn btn-ghost btn-sm cursor-pointer">
              + Upload images
              <input type="file" accept="image/*" multiple className="hidden"
                onChange={(e) => addImages(Array.from(e.target.files ?? []))} />
            </label>
          ) : (
            <p className="text-steel text-[13px]">Save the product first to upload images.</p>
          )}
        </div>

        <div className="flex gap-6 items-center pt-1">
          <label className="flex gap-2 items-center text-sm"><input type="checkbox" checked={f.is_published} onChange={(e) => up("is_published", e.target.checked)} /> Published (visible on site)</label>
          <label className="flex gap-2 items-center text-sm"><input type="checkbox" checked={f.is_featured} onChange={(e) => up("is_featured", e.target.checked)} /> Featured on home</label>
        </div>

        <div className="flex gap-2.5 pt-1">
          <button className="btn btn-primary" onClick={save} disabled={busy}>{busy ? "Saving…" : product ? "Save changes" : "Create product"}</button>
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
