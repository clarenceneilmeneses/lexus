import { useRef, useState } from "react";
import type { Catalog, ServiceItem } from "../../lib/types";
import { deleteSiteImages, saveSettings, uploadSiteImage } from "../../lib/api";
import { imgUrl } from "../../lib/utils";
import { StatCard, StatRow } from "../../components/StatCard";

const serviceImages = (items: ServiceItem[]) =>
  items.map((it) => it.image).filter((p): p is string => !!p);

export default function ContentPanel({ catalog, reload, canWrite }: { catalog: Catalog; reload: () => void; canWrite: boolean }) {
  const s = catalog.settings;
  const [hero, setHero] = useState(s.hero);
  const [about, setAbout] = useState(s.about);
  const [contact, setContact] = useState(s.contact);
  const [services, setServices] = useState(s.services);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [imgBusy, setImgBusy] = useState<number | null>(null);

  // Image paths currently persisted in the DB, and every path uploaded this
  // session — used at save time to delete whatever ends up unreferenced.
  const persistedImages = useRef<Set<string>>(new Set(serviceImages(s.services.items)));
  const uploadedImages = useRef<Set<string>>(new Set());

  const setItem = (i: number, k: "title" | "body", v: string) =>
    setServices((sv) => ({ ...sv, items: sv.items.map((it, j) => (j === i ? { ...it, [k]: v } : it)) }));
  const setImage = (i: number, path: string | null) =>
    setServices((sv) => ({ ...sv, items: sv.items.map((it, j) => (j === i ? { ...it, image: path } : it)) }));
  const addItem = () =>
    setServices((sv) => ({ ...sv, items: [...sv.items, { title: "", body: "" }] }));
  const removeItem = (i: number) =>
    setServices((sv) => ({ ...sv, items: sv.items.filter((_, j) => j !== i) }));

  async function uploadImage(i: number, file: File | undefined) {
    if (!file) return;
    setErr(""); setImgBusy(i);
    try {
      const path = await uploadSiteImage(file, "services");
      uploadedImages.current.add(path);
      setImage(i, path);
    } catch (e: any) {
      setErr(e?.message ?? "Image upload failed.");
    } finally { setImgBusy(null); }
  }

  async function save() {
    setBusy(true); setErr("");
    try {
      const items = services.items.filter((it) => it.title.trim() || it.body.trim());
      await saveSettings([
        { key: "hero", value: hero },
        { key: "about", value: about },
        { key: "contact", value: contact },
        { key: "services", value: { ...services, items } },
      ]);

      // Reconcile storage: delete any previously-persisted or this-session-uploaded
      // image that the saved content no longer references.
      const kept = new Set(serviceImages(items));
      const orphans = [...persistedImages.current, ...uploadedImages.current].filter((p) => !kept.has(p));
      if (orphans.length) await deleteSiteImages([...new Set(orphans)]).catch(() => { /* best effort */ });
      persistedImages.current = kept;
      uploadedImages.current = new Set();

      setMsg("Saved."); reload(); setTimeout(() => setMsg(""), 2500);
    } finally { setBusy(false); }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[22px]">Website content</h2>
        {canWrite && <button className="btn btn-primary btn-sm" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>}
      </div>

      <StatRow>
        <StatCard label="Services listed" value={services.items.length} />
        <StatCard label="About highlights" value={about.stats.length} tone="steel" />
        <StatCard label="Contact email" value={contact.email?.trim() ? "Set" : "—"} tone={contact.email?.trim() ? "green" : "orange"} />
      </StatRow>

      {!canWrite && <div className="bg-line-2 text-steel px-3.5 py-3 rounded text-[13.5px] mb-3.5">Read-only — your role can't edit content.</div>}
      {msg && <div className="bg-[#E8F7EF] border border-[#B6E6CB] text-[#137A43] px-3.5 py-3 rounded text-[13.5px] mb-3.5">{msg}</div>}
      {err && <div className="bg-[#FDECEA] border border-[#F5C2BA] text-[#B23120] px-3.5 py-3 rounded text-[13.5px] mb-3.5">{err}</div>}
      <p className="text-steel text-[13px] mb-4">Edit the text shown across the public site, then <b>Save changes</b>. Sections below: Hero · About · Services · Contact.</p>

      <div className="panel mb-4.5">
        <h3 className="text-base mb-3">Homepage hero</h3>
        <div className="mb-3.5"><label className="field-label">Eyebrow</label><input className="input" value={hero.eyebrow} onChange={(e) => setHero({ ...hero, eyebrow: e.target.value })} /></div>
        <div className="mb-3.5"><label className="field-label">Headline</label><input className="input" value={hero.title} onChange={(e) => setHero({ ...hero, title: e.target.value })} /></div>
        <div><label className="field-label">Subtitle</label><textarea className="input min-h-[90px]" value={hero.subtitle} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} /></div>
      </div>

      <div className="panel mb-4.5">
        <h3 className="text-base mb-3">About</h3>
        <div className="mb-3.5"><label className="field-label">Title</label><input className="input" value={about.title} onChange={(e) => setAbout({ ...about, title: e.target.value })} /></div>
        <div><label className="field-label">Body</label><textarea className="input min-h-[110px]" value={about.body} onChange={(e) => setAbout({ ...about, body: e.target.value })} /></div>
      </div>

      <div className="panel mb-4.5">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base">Services</h3>
          {canWrite && <button className="btn btn-ghost btn-sm" onClick={addItem}>+ Add service</button>}
        </div>
        <div className="mb-4"><label className="field-label">Section title</label><input className="input" value={services.title} onChange={(e) => setServices({ ...services, title: e.target.value })} /></div>
        <div className="space-y-4">
          {services.items.map((it, i) => (
            <div key={i} className="grid sm:grid-cols-[140px_1fr] gap-3.5 pb-4 border-b border-line-2 last:border-0 last:pb-0">
              {/* Image control */}
              <div>
                <label className="field-label">Card image</label>
                <div className="aspect-[4/3] rounded-lg overflow-hidden border border-line-2 bg-line-2/50 grid place-items-center">
                  {it.image ? (
                    <img src={imgUrl(it.image)!} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-mono text-[10.5px] uppercase tracking-wide text-steel text-center px-2">Default photo</span>
                  )}
                </div>
                {canWrite && (
                  <div className="flex gap-2 mt-1.5">
                    <label className="btn btn-ghost btn-sm cursor-pointer">
                      {imgBusy === i ? "Uploading…" : it.image ? "Replace" : "Upload"}
                      <input type="file" accept="image/*" className="hidden" disabled={imgBusy === i}
                        onChange={(e) => { uploadImage(i, e.target.files?.[0]); e.target.value = ""; }} />
                    </label>
                    {it.image && <button className="btn btn-ghost btn-sm" onClick={() => setImage(i, null)}>Reset</button>}
                  </div>
                )}
              </div>
              {/* Text fields */}
              <div className="grid gap-3 content-start">
                <div><label className="field-label">Title</label><input className="input" value={it.title} onChange={(e) => setItem(i, "title", e.target.value)} /></div>
                <div><label className="field-label">Description</label><textarea className="input min-h-[64px]" value={it.body} onChange={(e) => setItem(i, "body", e.target.value)} /></div>
                {canWrite && <div><button className="btn btn-sm bg-[#FCE9E9] text-[#B23030]" onClick={() => removeItem(i)}>Remove service</button></div>}
              </div>
            </div>
          ))}
          {!services.items.length && <p className="text-steel text-[13.5px]">No services yet. Add one above.</p>}
        </div>
        <p className="text-steel text-[12px] mt-3">The first 4 show on the homepage; all appear on the Services page. Leave the image as “Default photo” to use the built-in artwork.</p>
      </div>

      <div className="panel">
        <h3 className="text-base mb-3">Contact details</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><label className="field-label">Email</label><input className="input" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} /></div>
          <div><label className="field-label">Phone</label><input className="input" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} /></div>
          <div><label className="field-label">Address</label><input className="input" value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} /></div>
          <div><label className="field-label">Hours</label><input className="input" value={contact.hours} onChange={(e) => setContact({ ...contact, hours: e.target.value })} /></div>
        </div>
      </div>
    </div>
  );
}
