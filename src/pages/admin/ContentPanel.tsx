import { useRef, useState } from "react";
import type { Catalog, CredentialsSettings, InteriorsSettings, ServicesSettings } from "../../lib/types";
import { deleteSiteImages, saveSettings, uploadSiteImage } from "../../lib/api";
import { imgUrl } from "../../lib/utils";
import { StatCard, StatRow } from "../../components/StatCard";

// Every site-image path referenced across the editable content blocks — used to
// reconcile storage at save time and delete whatever ends up unreferenced.
const contentImages = (services: ServicesSettings, interiors: InteriorsSettings, credentials: CredentialsSettings) =>
  [
    ...services.items.map((it) => it.image),
    ...interiors.items.map((it) => it.image),
    credentials.image,
  ].filter((p): p is string => !!p);

export default function ContentPanel({ catalog, reload, canWrite }: { catalog: Catalog; reload: () => void; canWrite: boolean }) {
  const s = catalog.settings;
  const [hero, setHero] = useState(s.hero);
  const [about, setAbout] = useState(s.about);
  const [contact, setContact] = useState(s.contact);
  const [services, setServices] = useState(s.services);
  const [interiors, setInteriors] = useState(s.interiors);
  const [credentials, setCredentials] = useState(s.credentials);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [imgBusy, setImgBusy] = useState<number | null>(null);
  const [intImgBusy, setIntImgBusy] = useState<number | null>(null);
  const [credImgBusy, setCredImgBusy] = useState(false);

  // Image paths currently persisted in the DB, and every path uploaded this
  // session — used at save time to delete whatever ends up unreferenced.
  const persistedImages = useRef<Set<string>>(new Set(contentImages(s.services, s.interiors, s.credentials)));
  const uploadedImages = useRef<Set<string>>(new Set());

  const setItem = (i: number, k: "title" | "body", v: string) =>
    setServices((sv) => ({ ...sv, items: sv.items.map((it, j) => (j === i ? { ...it, [k]: v } : it)) }));
  const setImage = (i: number, path: string | null) =>
    setServices((sv) => ({ ...sv, items: sv.items.map((it, j) => (j === i ? { ...it, image: path } : it)) }));
  const addItem = () =>
    setServices((sv) => ({ ...sv, items: [...sv.items, { title: "", body: "" }] }));
  const removeItem = (i: number) =>
    setServices((sv) => ({ ...sv, items: sv.items.filter((_, j) => j !== i) }));

  // ---- About stats (also power the hero stats strip) ----
  const setStat = (i: number, k: "value" | "label", v: string) =>
    setAbout((a) => ({ ...a, stats: a.stats.map((st, j) => (j === i ? { ...st, [k]: v } : st)) }));
  const addStat = () => setAbout((a) => ({ ...a, stats: [...a.stats, { label: "", value: "" }] }));
  const removeStat = (i: number) => setAbout((a) => ({ ...a, stats: a.stats.filter((_, j) => j !== i) }));

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

  // ---- Interiors ("Finished with Lexus") ----
  const setIntItem = (i: number, k: "eyebrow" | "title", v: string) =>
    setInteriors((iv) => ({ ...iv, items: iv.items.map((it, j) => (j === i ? { ...it, [k]: v } : it)) }));
  const setIntImage = (i: number, path: string | null) =>
    setInteriors((iv) => ({ ...iv, items: iv.items.map((it, j) => (j === i ? { ...it, image: path } : it)) }));
  const addIntItem = () =>
    setInteriors((iv) => ({ ...iv, items: [...iv.items, { eyebrow: "", title: "", image: null }] }));
  const removeIntItem = (i: number) =>
    setInteriors((iv) => ({ ...iv, items: iv.items.filter((_, j) => j !== i) }));

  async function uploadIntImage(i: number, file: File | undefined) {
    if (!file) return;
    setErr(""); setIntImgBusy(i);
    try {
      const path = await uploadSiteImage(file, "interiors");
      uploadedImages.current.add(path);
      setIntImage(i, path);
    } catch (e: any) {
      setErr(e?.message ?? "Image upload failed.");
    } finally { setIntImgBusy(null); }
  }

  // ---- Credentials (WORLDBEX band) ----
  const setCredStat = (i: number, k: "value" | "label", v: string) =>
    setCredentials((cv) => ({ ...cv, stats: cv.stats.map((st, j) => (j === i ? { ...st, [k]: v } : st)) }));
  const addCredStat = () =>
    setCredentials((cv) => ({ ...cv, stats: [...cv.stats, { value: "", label: "" }] }));
  const removeCredStat = (i: number) =>
    setCredentials((cv) => ({ ...cv, stats: cv.stats.filter((_, j) => j !== i) }));

  async function uploadCredImage(file: File | undefined) {
    if (!file) return;
    setErr(""); setCredImgBusy(true);
    try {
      const path = await uploadSiteImage(file, "credentials");
      uploadedImages.current.add(path);
      setCredentials((cv) => ({ ...cv, image: path }));
    } catch (e: any) {
      setErr(e?.message ?? "Image upload failed.");
    } finally { setCredImgBusy(false); }
  }

  async function save() {
    setBusy(true); setErr("");
    try {
      const items = services.items.filter((it) => it.title.trim() || it.body.trim());
      const intItems = interiors.items.filter((it) => it.title.trim() || it.eyebrow.trim() || it.image);
      const credStats = credentials.stats.filter((st) => st.value.trim() || st.label.trim());
      const aboutStats = about.stats.filter((st) => st.value.trim() || st.label.trim());
      const savedAbout = { ...about, stats: aboutStats };
      const savedServices = { ...services, items };
      const savedInteriors = { ...interiors, items: intItems };
      const savedCredentials = { ...credentials, stats: credStats };
      await saveSettings([
        { key: "hero", value: hero },
        { key: "about", value: savedAbout },
        { key: "contact", value: contact },
        { key: "services", value: savedServices },
        { key: "interiors", value: savedInteriors },
        { key: "credentials", value: savedCredentials },
      ]);

      // Reconcile storage: delete any previously-persisted or this-session-uploaded
      // image that the saved content no longer references.
      const kept = new Set(contentImages(savedServices, savedInteriors, savedCredentials));
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
      <p className="text-steel text-[13px] mb-4">Edit the text shown across the public site, then <b>Save changes</b>. Sections below: Hero · About · Services · Interiors · Credentials · Contact.</p>

      <div className="panel mb-4.5">
        <h3 className="text-base mb-3">Homepage hero</h3>
        <div className="mb-3.5"><label className="field-label">Eyebrow</label><input className="input" value={hero.eyebrow} onChange={(e) => setHero({ ...hero, eyebrow: e.target.value })} /></div>
        <div className="mb-3.5"><label className="field-label">Headline</label><input className="input" value={hero.title} onChange={(e) => setHero({ ...hero, title: e.target.value })} /></div>
        <div className="mb-3.5"><label className="field-label">Subtitle</label><textarea className="input min-h-[90px]" value={hero.subtitle} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} /></div>
        <div>
          <label className="field-label">Video URL</label>
          <input className="input" placeholder="https://… .mp4 — leave blank to use the built-in video" value={hero.video_url ?? ""} onChange={(e) => setHero({ ...hero, video_url: e.target.value })} />
          <p className="text-steel text-[12px] mt-1.5">Direct link to an .mp4 file (e.g. a Supabase Storage or CDN URL). Leave blank to keep the default Lexus video.</p>
        </div>
      </div>

      <div className="panel mb-4.5">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base">About</h3>
          {canWrite && <button className="btn btn-ghost btn-sm" onClick={addStat}>+ Add stat</button>}
        </div>
        <div className="mb-3.5"><label className="field-label">Title</label><input className="input" value={about.title} onChange={(e) => setAbout({ ...about, title: e.target.value })} /></div>
        <div className="mb-4"><label className="field-label">Body</label><textarea className="input min-h-[110px]" value={about.body} onChange={(e) => setAbout({ ...about, body: e.target.value })} /></div>
        <label className="field-label">Stats (first 3 show on the homepage hero strip)</label>
        <div className="space-y-2">
          {about.stats.map((st, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input className="input max-w-[140px]" placeholder="Value (e.g. 1995)" value={st.value} onChange={(e) => setStat(i, "value", e.target.value)} />
              <input className="input flex-1" placeholder="Label (e.g. Established)" value={st.label} onChange={(e) => setStat(i, "label", e.target.value)} />
              {canWrite && <button className="btn btn-sm bg-[#FCE9E9] text-[#B23030] shrink-0" onClick={() => removeStat(i)}>Remove</button>}
            </div>
          ))}
          {!about.stats.length && <p className="text-steel text-[13.5px]">No stats yet. Add one above.</p>}
        </div>
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

      {/* Interiors — "Finished with Lexus" */}
      <div className="panel mb-4.5">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base">Interiors — “Finished with Lexus”</h3>
          {canWrite && <button className="btn btn-ghost btn-sm" onClick={addIntItem}>+ Add tile</button>}
        </div>
        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          <div><label className="field-label">Eyebrow</label><input className="input" value={interiors.eyebrow} onChange={(e) => setInteriors({ ...interiors, eyebrow: e.target.value })} /></div>
          <div><label className="field-label">Heading</label><input className="input" value={interiors.title} onChange={(e) => setInteriors({ ...interiors, title: e.target.value })} /></div>
          <div><label className="field-label">Subtitle</label><input className="input" value={interiors.subtitle} onChange={(e) => setInteriors({ ...interiors, subtitle: e.target.value })} /></div>
        </div>
        <div className="space-y-4">
          {interiors.items.map((it, i) => (
            <div key={i} className="grid sm:grid-cols-[140px_1fr] gap-3.5 pb-4 border-b border-line-2 last:border-0 last:pb-0">
              <div>
                <label className="field-label">Tile image</label>
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
                      {intImgBusy === i ? "Uploading…" : it.image ? "Replace" : "Upload"}
                      <input type="file" accept="image/*" className="hidden" disabled={intImgBusy === i}
                        onChange={(e) => { uploadIntImage(i, e.target.files?.[0]); e.target.value = ""; }} />
                    </label>
                    {it.image && <button className="btn btn-ghost btn-sm" onClick={() => setIntImage(i, null)}>Reset</button>}
                  </div>
                )}
              </div>
              <div className="grid gap-3 content-start">
                <div><label className="field-label">Tag</label><input className="input" placeholder="e.g. Residential" value={it.eyebrow} onChange={(e) => setIntItem(i, "eyebrow", e.target.value)} /></div>
                <div><label className="field-label">Title</label><input className="input" placeholder="e.g. Kitchens & cabinetry" value={it.title} onChange={(e) => setIntItem(i, "title", e.target.value)} /></div>
                {canWrite && <div><button className="btn btn-sm bg-[#FCE9E9] text-[#B23030]" onClick={() => removeIntItem(i)}>Remove tile</button></div>}
              </div>
            </div>
          ))}
          {!interiors.items.length && <p className="text-steel text-[13.5px]">No tiles yet. Add one above.</p>}
        </div>
        <p className="text-steel text-[12px] mt-3">The first tile shows large; the rest stack beside it. Leave an image as “Default photo” to use the built-in artwork.</p>
      </div>

      {/* Credentials — WORLDBEX band */}
      <div className="panel mb-4.5">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base">Credentials — “Recognized in the industry”</h3>
          {canWrite && <button className="btn btn-ghost btn-sm" onClick={addCredStat}>+ Add stat</button>}
        </div>
        <div className="grid sm:grid-cols-[160px_1fr] gap-3.5">
          <div>
            <label className="field-label">Image</label>
            <div className="aspect-square rounded-lg overflow-hidden border border-line-2 bg-line-2/50 grid place-items-center">
              {credentials.image ? (
                <img src={imgUrl(credentials.image)!} alt="" className="w-full h-full object-contain" />
              ) : (
                <span className="font-mono text-[10.5px] uppercase tracking-wide text-steel text-center px-2">Default poster</span>
              )}
            </div>
            {canWrite && (
              <div className="flex gap-2 mt-1.5">
                <label className="btn btn-ghost btn-sm cursor-pointer">
                  {credImgBusy ? "Uploading…" : credentials.image ? "Replace" : "Upload"}
                  <input type="file" accept="image/*" className="hidden" disabled={credImgBusy}
                    onChange={(e) => { uploadCredImage(e.target.files?.[0]); e.target.value = ""; }} />
                </label>
                {credentials.image && <button className="btn btn-ghost btn-sm" onClick={() => setCredentials({ ...credentials, image: null })}>Reset</button>}
              </div>
            )}
          </div>
          <div className="grid gap-3 content-start">
            <div className="grid sm:grid-cols-2 gap-3">
              <div><label className="field-label">Eyebrow</label><input className="input" value={credentials.eyebrow} onChange={(e) => setCredentials({ ...credentials, eyebrow: e.target.value })} /></div>
              <div><label className="field-label">Heading</label><input className="input" value={credentials.title} onChange={(e) => setCredentials({ ...credentials, title: e.target.value })} /></div>
            </div>
            <div><label className="field-label">Body</label><textarea className="input min-h-[64px]" value={credentials.body} onChange={(e) => setCredentials({ ...credentials, body: e.target.value })} /></div>
            <div><label className="field-label">Caption</label><input className="input" value={credentials.caption} onChange={(e) => setCredentials({ ...credentials, caption: e.target.value })} /></div>
          </div>
        </div>
        <div className="mt-4">
          <label className="field-label">Stats (shown below the body)</label>
          <div className="space-y-2">
            {credentials.stats.map((st, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input className="input max-w-[120px]" placeholder="Value" value={st.value} onChange={(e) => setCredStat(i, "value", e.target.value)} />
                <input className="input flex-1" placeholder="Label" value={st.label} onChange={(e) => setCredStat(i, "label", e.target.value)} />
                {canWrite && <button className="btn btn-sm bg-[#FCE9E9] text-[#B23030] shrink-0" onClick={() => removeCredStat(i)}>Remove</button>}
              </div>
            ))}
            {!credentials.stats.length && <p className="text-steel text-[13.5px]">No stats yet. Add one above.</p>}
          </div>
          <p className="text-steel text-[12px] mt-3">The first 3 stats show on the homepage. Leave the image as “Default poster” to use the built-in WORLDBEX artwork.</p>
        </div>
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
