import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Catalog, CredentialsSettings, InteriorsSettings, PartnersSettings, ServicesSettings } from "../../lib/types";
import { deleteSiteImages, saveSettings, uploadSiteImage } from "../../lib/api";
import { imgUrl } from "../../lib/utils";

// Every site-image path referenced across the editable content blocks — used to
// reconcile storage at save time and delete whatever ends up unreferenced.
const contentImages = (
  services: ServicesSettings,
  interiors: InteriorsSettings,
  credentials: CredentialsSettings,
  partners: PartnersSettings,
) =>
  [
    ...services.items.map((it) => it.image),
    ...interiors.items.map((it) => it.image),
    credentials.image,
    ...partners.items.map((it) => it.image),
  ].filter((p): p is string => !!p);

// Move an array element from one index to another (used by the reorder arrows).
// Out-of-range targets are a no-op so the first/last items can't move further.
function move<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const next = arr.slice();
  const [x] = next.splice(from, 1);
  next.splice(to, 0, x);
  return next;
}

// Friendly, plain-English section list — drives the "jump to" bar and the order.
const SECTIONS = [
  { id: "hero", title: "Homepage banner", where: "Home page" },
  { id: "about", title: "About the company", where: "Home + About" },
  { id: "services", title: "Services", where: "Home + Services" },
  { id: "interiors", title: "Project gallery", where: "Home page" },
  { id: "credentials", title: "Awards & recognition", where: "Home page" },
  { id: "testimonials", title: "Customer quotes", where: "Home page" },
  { id: "partners", title: "Partner logos", where: "Home page" },
  { id: "contact", title: "Contact details", where: "Footer + Contact" },
] as const;

export default function ContentPanel({ catalog, reload, canWrite }: { catalog: Catalog; reload: () => void; canWrite: boolean }) {
  const s = catalog.settings;
  const [hero, setHero] = useState(s.hero);
  const [about, setAbout] = useState(s.about);
  const [contact, setContact] = useState(s.contact);
  const [services, setServices] = useState(s.services);
  const [interiors, setInteriors] = useState(s.interiors);
  const [credentials, setCredentials] = useState(s.credentials);
  const [testimonials, setTestimonials] = useState(s.testimonials);
  const [partners, setPartners] = useState(s.partners);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [imgBusy, setImgBusy] = useState<number | null>(null);
  const [intImgBusy, setIntImgBusy] = useState<number | null>(null);
  const [credImgBusy, setCredImgBusy] = useState(false);
  const [partImgBusy, setPartImgBusy] = useState<number | null>(null);

  // Accordion: which sections are expanded. Start with just the banner open so
  // the page looks like a tidy checklist rather than a wall of fields.
  const [open, setOpen] = useState<Set<string>>(() => new Set(["hero"]));
  const toggle = (id: string) =>
    setOpen((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allOpen = open.size === SECTIONS.length;
  const toggleAll = () => setOpen(allOpen ? new Set() : new Set(SECTIONS.map((x) => x.id)));
  const goTo = (id: string) => {
    setOpen((p) => new Set(p).add(id));
    setTimeout(() => document.getElementById(`sec-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };

  // Image paths currently persisted in the DB, and every path uploaded this
  // session — used at save time to delete whatever ends up unreferenced.
  const persistedImages = useRef<Set<string>>(new Set(contentImages(s.services, s.interiors, s.credentials, s.partners)));
  const uploadedImages = useRef<Set<string>>(new Set());

  // Unsaved-changes tracking: snapshot of the last-saved state vs. current.
  const snap = () => JSON.stringify({ hero, about, contact, services, interiors, credentials, testimonials, partners });
  const savedSnap = useRef<string>(snap());
  const dirty = snap() !== savedSnap.current;

  // Warn before leaving the tab/window with unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

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

  // ---- Testimonials (quote band) ----
  const setTestItem = (i: number, k: "quote" | "author" | "role", v: string) =>
    setTestimonials((tv) => ({ ...tv, items: tv.items.map((it, j) => (j === i ? { ...it, [k]: v } : it)) }));
  const addTestItem = () =>
    setTestimonials((tv) => ({ ...tv, items: [...tv.items, { quote: "", author: "", role: "" }] }));
  const removeTestItem = (i: number) =>
    setTestimonials((tv) => ({ ...tv, items: tv.items.filter((_, j) => j !== i) }));

  // ---- Partners (logo wall) ----
  const setPartName = (i: number, v: string) =>
    setPartners((pv) => ({ ...pv, items: pv.items.map((it, j) => (j === i ? { ...it, name: v } : it)) }));
  const setPartImage = (i: number, path: string | null) =>
    setPartners((pv) => ({ ...pv, items: pv.items.map((it, j) => (j === i ? { ...it, image: path } : it)) }));
  const addPartItem = () =>
    setPartners((pv) => ({ ...pv, items: [...pv.items, { name: "", image: null }] }));
  const removePartItem = (i: number) =>
    setPartners((pv) => ({ ...pv, items: pv.items.filter((_, j) => j !== i) }));

  async function uploadPartImage(i: number, file: File | undefined) {
    if (!file) return;
    setErr(""); setPartImgBusy(i);
    try {
      const path = await uploadSiteImage(file, "partners");
      uploadedImages.current.add(path);
      setPartImage(i, path);
    } catch (e: any) {
      setErr(e?.message ?? "Image upload failed.");
    } finally { setPartImgBusy(null); }
  }

  // ---- Reorder helpers (dir = -1 up, +1 down) ----
  const moveSvc = (i: number, dir: number) => setServices((sv) => ({ ...sv, items: move(sv.items, i, i + dir) }));
  const moveInt = (i: number, dir: number) => setInteriors((iv) => ({ ...iv, items: move(iv.items, i, i + dir) }));
  const moveTest = (i: number, dir: number) => setTestimonials((tv) => ({ ...tv, items: move(tv.items, i, i + dir) }));
  const movePart = (i: number, dir: number) => setPartners((pv) => ({ ...pv, items: move(pv.items, i, i + dir) }));

  async function save() {
    setBusy(true); setErr("");
    try {
      const items = services.items.filter((it) => it.title.trim() || it.body.trim());
      const intItems = interiors.items.filter((it) => it.title.trim() || it.eyebrow.trim() || it.image);
      const credStats = credentials.stats.filter((st) => st.value.trim() || st.label.trim());
      const aboutStats = about.stats.filter((st) => st.value.trim() || st.label.trim());
      const testItems = testimonials.items.filter((it) => it.quote.trim() || it.author.trim());
      const partItems = partners.items.filter((it) => it.name.trim() || it.image);
      const savedAbout = { ...about, stats: aboutStats };
      const savedServices = { ...services, items };
      const savedInteriors = { ...interiors, items: intItems };
      const savedCredentials = { ...credentials, stats: credStats };
      const savedTestimonials = { ...testimonials, items: testItems };
      const savedPartners = { ...partners, items: partItems };
      await saveSettings([
        { key: "hero", value: hero },
        { key: "about", value: savedAbout },
        { key: "contact", value: contact },
        { key: "services", value: savedServices },
        { key: "interiors", value: savedInteriors },
        { key: "credentials", value: savedCredentials },
        { key: "testimonials", value: savedTestimonials },
        { key: "partners", value: savedPartners },
      ]);

      // Reconcile storage: delete any previously-persisted or this-session-uploaded
      // image that the saved content no longer references.
      const kept = new Set(contentImages(savedServices, savedInteriors, savedCredentials, savedPartners));
      const orphans = [...persistedImages.current, ...uploadedImages.current].filter((p) => !kept.has(p));
      if (orphans.length) await deleteSiteImages([...new Set(orphans)]).catch(() => { /* best effort */ });
      persistedImages.current = kept;
      uploadedImages.current = new Set();

      // Adopt the cleaned (blank rows removed) values so the form matches what's
      // live, and mark everything as saved.
      setAbout(savedAbout); setServices(savedServices); setInteriors(savedInteriors);
      setCredentials(savedCredentials); setTestimonials(savedTestimonials); setPartners(savedPartners);
      savedSnap.current = JSON.stringify({
        hero, about: savedAbout, contact, services: savedServices, interiors: savedInteriors,
        credentials: savedCredentials, testimonials: savedTestimonials, partners: savedPartners,
      });

      setMsg("Your changes are now live on the website."); reload(); setTimeout(() => setMsg(""), 4000);
    } catch (e: any) {
      setErr(e?.message ?? "Couldn't save. Please try again.");
    } finally { setBusy(false); }
  }

  // ---- Reusable collapsible section card ----
  function Section({ id, title, desc, where, children }: { id: string; title: string; desc: string; where: string; children: ReactNode }) {
    const isOpen = open.has(id);
    return (
      <div id={`sec-${id}`} className="panel p-0 overflow-hidden mb-3 scroll-mt-24">
        <button
          type="button"
          onClick={() => toggle(id)}
          aria-expanded={isOpen}
          className="w-full flex items-start gap-3 text-left px-4 sm:px-5 py-3.5 hover:bg-[#F7F8FA] transition-colors"
        >
          <span className={`mt-0.5 flex-none w-7 h-7 grid place-items-center rounded-lg transition-colors ${isOpen ? "bg-corp-navy text-white" : "bg-[#EEF0F6] text-corp-navy"}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={`w-[15px] h-[15px] transition-transform ${isOpen ? "rotate-90" : ""}`}>
              <path d="M9 6l6 6-6 6" />
            </svg>
          </span>
          <span className="flex-1 min-w-0">
            <span className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-[15.5px] text-ink">{title}</span>
              <span className="font-mono text-[10px] uppercase tracking-wide text-steel bg-[#F0F1F4] rounded px-1.5 py-0.5">{where}</span>
            </span>
            <span className="block text-steel text-[12.5px] mt-0.5">{desc}</span>
          </span>
        </button>
        {isOpen && <div className="px-4 sm:px-5 pb-5 pt-3 border-t border-line-2">{children}</div>}
      </div>
    );
  }

  // ---- One repeating item, shown as a numbered card with reorder/remove controls ----
  function ItemCard({ i, total, label, title, onMove, onRemove, children }: {
    i: number; total: number; label: string; title: string;
    onMove: (dir: number) => void; onRemove: () => void; children: ReactNode;
  }) {
    const ctrl = "w-7 h-7 grid place-items-center rounded-md transition-colors disabled:opacity-30";
    return (
      <div className="rounded-xl border border-line-2 bg-[#FAFBFC]">
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-line-2">
          <span className="flex-none w-6 h-6 grid place-items-center rounded-md bg-corp-navy text-white font-mono text-[11px] font-semibold">{i + 1}</span>
          <span className="font-semibold text-[13.5px] text-ink truncate flex-1 min-w-0">{title.trim() || <span className="text-steel font-normal italic">Untitled {label}</span>}</span>
          {canWrite && (
            <div className="flex items-center gap-0.5 flex-none">
              <button type="button" title="Move up" aria-label="Move up" disabled={i === 0} onClick={() => onMove(-1)} className={`${ctrl} text-steel hover:bg-line-2 disabled:hover:bg-transparent`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-[15px] h-[15px]"><path d="M18 15l-6-6-6 6" /></svg>
              </button>
              <button type="button" title="Move down" aria-label="Move down" disabled={i === total - 1} onClick={() => onMove(1)} className={`${ctrl} text-steel hover:bg-line-2 disabled:hover:bg-transparent`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-[15px] h-[15px]"><path d="M6 9l6 6 6-6" /></svg>
              </button>
              <button type="button" title={`Remove ${label}`} aria-label={`Remove ${label}`} onClick={onRemove} className={`${ctrl} text-[#B23030] hover:bg-[#FCE9E9]`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="w-[15px] h-[15px]"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" /></svg>
              </button>
            </div>
          )}
        </div>
        <div className="p-3.5">{children}</div>
      </div>
    );
  }

  // ---- Full-width dashed "add another" button ----
  const AddButton = ({ onClick, children }: { onClick: () => void; children: ReactNode }) => (
    canWrite ? (
      <button type="button" onClick={onClick} className="w-full rounded-xl border border-dashed border-line text-corp-navy font-display font-semibold text-[13.5px] py-2.5 hover:border-corp-navy hover:bg-[#F7F8FA] transition-colors">
        {children}
      </button>
    ) : null
  );

  return (
    <div>
      {/* Sticky action bar — Save is always reachable, and shows whether there are unsaved edits. */}
      <div className="sticky top-0 z-20 -mx-5 lg:-mx-8 px-5 lg:px-8 py-3 bg-paper/95 backdrop-blur border-b border-line-2 mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[20px] leading-tight">Website content</h2>
          <p className="text-steel text-[12.5px] hidden sm:block">Edit the words and pictures visitors see on your website.</p>
        </div>
        <div className="flex items-center gap-2.5 flex-none">
          {canWrite && (
            dirty
              ? <span className="font-mono text-[11px] uppercase tracking-wide text-[#B26B00] bg-[#FFF4E0] border border-[#F3D9A6] rounded-full px-2.5 py-1 whitespace-nowrap">● Unsaved changes</span>
              : <span className="font-mono text-[11px] uppercase tracking-wide text-[#137A43] hidden sm:inline whitespace-nowrap">✓ All saved</span>
          )}
          {canWrite && (
            <button className="btn btn-primary btn-sm" onClick={save} disabled={busy || !dirty}>
              {busy ? "Saving…" : "Save changes"}
            </button>
          )}
        </div>
      </div>

      {!canWrite && <div className="bg-line-2 text-steel px-3.5 py-3 rounded text-[13.5px] mb-3.5">You're viewing in read-only mode — your role can't edit content. Ask an admin if you need access.</div>}
      {msg && <div className="bg-[#E8F7EF] border border-[#B6E6CB] text-[#137A43] px-3.5 py-3 rounded text-[13.5px] mb-3.5">{msg}</div>}
      {err && <div className="bg-[#FDECEA] border border-[#F5C2BA] text-[#B23120] px-3.5 py-3 rounded text-[13.5px] mb-3.5">{err}</div>}

      {/* How-to helper for non-technical editors */}
      <div className="bg-[#F4F6FB] border border-line-2 rounded-xl px-4 py-3 mb-4 text-[13px] text-steel">
        <b className="text-ink">How this works:</b> Click a section below to open it, change the text or photos, then press <b className="text-ink">Save changes</b> at the top. Nothing goes live until you save.
      </div>

      {/* Jump-to bar */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <span className="font-mono text-[11px] uppercase tracking-wide text-steel mr-1">Jump to:</span>
        {SECTIONS.map((sec) => (
          <button
            key={sec.id}
            onClick={() => goTo(sec.id)}
            className="font-display font-semibold text-[12.5px] rounded-full border border-line px-3 py-1 text-corp-navy hover:bg-corp-navy hover:text-white hover:border-corp-navy transition-colors"
          >
            {sec.title}
          </button>
        ))}
        <button onClick={toggleAll} className="font-mono text-[11px] uppercase tracking-wide text-steel hover:text-corp-navy ml-auto">
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>

      {/* ============ Homepage banner (hero) ============ */}
      <Section id="hero" title="Homepage banner" where="Home page" desc="The big headline and video at the very top of your home page.">
        <div className="mb-3.5">
          <label className="field-label">Small label above the headline</label>
          <input className="input" placeholder="e.g. Industrial finishing supplier" value={hero.eyebrow} onChange={(e) => setHero({ ...hero, eyebrow: e.target.value })} />
        </div>
        <div className="mb-3.5"><label className="field-label">Headline (the big text)</label><input className="input" value={hero.title} onChange={(e) => setHero({ ...hero, title: e.target.value })} /></div>
        <div className="mb-3.5"><label className="field-label">Subtitle (one or two sentences)</label><textarea className="input min-h-[90px]" value={hero.subtitle} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} /></div>
        <div>
          <label className="field-label">Background video link (optional)</label>
          <input className="input" placeholder="Paste a video link ending in .mp4 — or leave blank" value={hero.video_url ?? ""} onChange={(e) => setHero({ ...hero, video_url: e.target.value })} />
          <p className="text-steel text-[12px] mt-1.5">Leave blank to keep the built-in Lexus video. Most people should leave this empty.</p>
        </div>
      </Section>

      {/* ============ About ============ */}
      <Section id="about" title="About the company" where="Home + About page" desc="A short description of your company and the key numbers (the stats).">
        <div className="mb-3.5"><label className="field-label">Title</label><input className="input" value={about.title} onChange={(e) => setAbout({ ...about, title: e.target.value })} /></div>
        <div className="mb-4"><label className="field-label">Description</label><textarea className="input min-h-[110px]" value={about.body} onChange={(e) => setAbout({ ...about, body: e.target.value })} /></div>
        <div className="flex items-center justify-between mb-2">
          <label className="field-label mb-0">Key numbers <span className="normal-case tracking-normal text-[11px]">(first 3 also show on the home page)</span></label>
          {canWrite && <button className="btn btn-ghost btn-sm" onClick={addStat}>+ Add number</button>}
        </div>
        <div className="space-y-2">
          {about.stats.map((st, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input className="input max-w-[140px]" placeholder="Number (e.g. 1995)" value={st.value} onChange={(e) => setStat(i, "value", e.target.value)} />
              <input className="input flex-1" placeholder="What it means (e.g. Established)" value={st.label} onChange={(e) => setStat(i, "label", e.target.value)} />
              {canWrite && <button className="btn btn-sm bg-[#FCE9E9] text-[#B23030] shrink-0" onClick={() => removeStat(i)}>Remove</button>}
            </div>
          ))}
          {!about.stats.length && <p className="text-steel text-[13.5px]">No numbers yet. Click “Add number” to create one.</p>}
        </div>
      </Section>

      {/* ============ Services ============ */}
      <Section id="services" title="Services" where="Home + Services page" desc="The list of services you offer, each with its own photo.">
        <div className="mb-4"><label className="field-label">Section title</label><input className="input" value={services.title} onChange={(e) => setServices({ ...services, title: e.target.value })} /></div>
        <div className="space-y-3">
          {services.items.map((it, i) => (
            <ItemCard key={i} i={i} total={services.items.length} label="service" title={it.title} onMove={(d) => moveSvc(i, d)} onRemove={() => removeItem(i)}>
              <div className="grid sm:grid-cols-[140px_1fr] gap-3.5">
                {/* Image control */}
                <div>
                  <label className="field-label">Photo</label>
                  <div className="aspect-[4/3] rounded-lg overflow-hidden border border-line-2 bg-white grid place-items-center">
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
                      {it.image && <button className="btn btn-ghost btn-sm" onClick={() => setImage(i, null)}>Use default</button>}
                    </div>
                  )}
                </div>
                {/* Text fields */}
                <div className="grid gap-3 content-start">
                  <div><label className="field-label">Service name</label><input className="input" value={it.title} onChange={(e) => setItem(i, "title", e.target.value)} /></div>
                  <div><label className="field-label">Description</label><textarea className="input min-h-[64px]" value={it.body} onChange={(e) => setItem(i, "body", e.target.value)} /></div>
                </div>
              </div>
            </ItemCard>
          ))}
          {!services.items.length && <p className="text-steel text-[13.5px]">No services yet — add your first one below.</p>}
          <AddButton onClick={addItem}>+ Add service</AddButton>
        </div>
        <p className="text-steel text-[12px] mt-3">The first 4 services (top of the list) show on the home page; all of them appear on the Services page. Use the ↑ ↓ arrows to reorder. Leave a photo as “Default photo” to use the built-in picture.</p>
      </Section>

      {/* ============ Project gallery (interiors) ============ */}
      <Section id="interiors" title="Project gallery" where="Home page" desc="Photo tiles showing finished interiors (“Finished with Lexus”).">
        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          <div><label className="field-label">Label above heading</label><input className="input" value={interiors.eyebrow} onChange={(e) => setInteriors({ ...interiors, eyebrow: e.target.value })} /></div>
          <div><label className="field-label">Heading</label><input className="input" value={interiors.title} onChange={(e) => setInteriors({ ...interiors, title: e.target.value })} /></div>
          <div><label className="field-label">Subtitle</label><input className="input" value={interiors.subtitle} onChange={(e) => setInteriors({ ...interiors, subtitle: e.target.value })} /></div>
        </div>
        <div className="space-y-3">
          {interiors.items.map((it, i) => (
            <ItemCard key={i} i={i} total={interiors.items.length} label="tile" title={it.title} onMove={(d) => moveInt(i, d)} onRemove={() => removeIntItem(i)}>
              <div className="grid sm:grid-cols-[140px_1fr] gap-3.5">
                <div>
                  <label className="field-label">Photo</label>
                  <div className="aspect-[4/3] rounded-lg overflow-hidden border border-line-2 bg-white grid place-items-center">
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
                      {it.image && <button className="btn btn-ghost btn-sm" onClick={() => setIntImage(i, null)}>Use default</button>}
                    </div>
                  )}
                </div>
                <div className="grid gap-3 content-start">
                  <div><label className="field-label">Tag</label><input className="input" placeholder="e.g. Residential" value={it.eyebrow} onChange={(e) => setIntItem(i, "eyebrow", e.target.value)} /></div>
                  <div><label className="field-label">Title</label><input className="input" placeholder="e.g. Kitchens & cabinetry" value={it.title} onChange={(e) => setIntItem(i, "title", e.target.value)} /></div>
                </div>
              </div>
            </ItemCard>
          ))}
          {!interiors.items.length && <p className="text-steel text-[13.5px]">No tiles yet — add your first one below.</p>}
          <AddButton onClick={addIntItem}>+ Add photo tile</AddButton>
        </div>
        <p className="text-steel text-[12px] mt-3">The first tile (top of the list) shows large; the rest stack beside it. Use the ↑ ↓ arrows to reorder. Leave a photo as “Default photo” to use the built-in picture.</p>
      </Section>

      {/* ============ Awards & recognition (credentials) ============ */}
      <Section id="credentials" title="Awards & recognition" where="Home page" desc="Your industry-recognition band with a poster image and a few numbers.">
        <div className="grid sm:grid-cols-[160px_1fr] gap-3.5">
          <div>
            <label className="field-label">Poster image</label>
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
                {credentials.image && <button className="btn btn-ghost btn-sm" onClick={() => setCredentials({ ...credentials, image: null })}>Use default</button>}
              </div>
            )}
          </div>
          <div className="grid gap-3 content-start">
            <div className="grid sm:grid-cols-2 gap-3">
              <div><label className="field-label">Label above heading</label><input className="input" value={credentials.eyebrow} onChange={(e) => setCredentials({ ...credentials, eyebrow: e.target.value })} /></div>
              <div><label className="field-label">Heading</label><input className="input" value={credentials.title} onChange={(e) => setCredentials({ ...credentials, title: e.target.value })} /></div>
            </div>
            <div><label className="field-label">Description</label><textarea className="input min-h-[64px]" value={credentials.body} onChange={(e) => setCredentials({ ...credentials, body: e.target.value })} /></div>
            <div><label className="field-label">Caption under the image</label><input className="input" value={credentials.caption} onChange={(e) => setCredentials({ ...credentials, caption: e.target.value })} /></div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <label className="field-label mb-0">Key numbers <span className="normal-case tracking-normal text-[11px]">(first 3 show on the home page)</span></label>
            {canWrite && <button className="btn btn-ghost btn-sm" onClick={addCredStat}>+ Add number</button>}
          </div>
          <div className="space-y-2">
            {credentials.stats.map((st, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input className="input max-w-[120px]" placeholder="Number" value={st.value} onChange={(e) => setCredStat(i, "value", e.target.value)} />
                <input className="input flex-1" placeholder="What it means" value={st.label} onChange={(e) => setCredStat(i, "label", e.target.value)} />
                {canWrite && <button className="btn btn-sm bg-[#FCE9E9] text-[#B23030] shrink-0" onClick={() => removeCredStat(i)}>Remove</button>}
              </div>
            ))}
            {!credentials.stats.length && <p className="text-steel text-[13.5px]">No numbers yet. Click “Add number” to create one.</p>}
          </div>
          <p className="text-steel text-[12px] mt-3">Leave the image as “Default poster” to use the built-in WORLDBEX artwork.</p>
        </div>
      </Section>

      {/* ============ Customer quotes (testimonials) ============ */}
      <Section id="testimonials" title="Customer quotes" where="Home page" desc="What clients and partners say about working with you.">
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <div><label className="field-label">Label above heading</label><input className="input" value={testimonials.eyebrow} onChange={(e) => setTestimonials({ ...testimonials, eyebrow: e.target.value })} /></div>
          <div><label className="field-label">Heading</label><input className="input" value={testimonials.title} onChange={(e) => setTestimonials({ ...testimonials, title: e.target.value })} /></div>
        </div>
        <div className="space-y-3">
          {testimonials.items.map((it, i) => (
            <ItemCard key={i} i={i} total={testimonials.items.length} label="quote" title={it.author} onMove={(d) => moveTest(i, d)} onRemove={() => removeTestItem(i)}>
              <div className="grid gap-3">
                <div><label className="field-label">What they said</label><textarea className="input min-h-[72px]" value={it.quote} onChange={(e) => setTestItem(i, "quote", e.target.value)} /></div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><label className="field-label">Who said it</label><input className="input" placeholder="e.g. Project Architect" value={it.author} onChange={(e) => setTestItem(i, "author", e.target.value)} /></div>
                  <div><label className="field-label">Their company / role</label><input className="input" placeholder="e.g. Metro Manila design firm" value={it.role ?? ""} onChange={(e) => setTestItem(i, "role", e.target.value)} /></div>
                </div>
              </div>
            </ItemCard>
          ))}
          {!testimonials.items.length && <p className="text-steel text-[13.5px]">No quotes yet — add your first one below.</p>}
          <AddButton onClick={addTestItem}>+ Add quote</AddButton>
        </div>
      </Section>

      {/* ============ Partner logos (partners) ============ */}
      <Section id="partners" title="Partner logos" where="Home page" desc="Logos (or just names) of companies and brands you work with.">
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <div><label className="field-label">Label above heading</label><input className="input" value={partners.eyebrow} onChange={(e) => setPartners({ ...partners, eyebrow: e.target.value })} /></div>
          <div><label className="field-label">Heading</label><input className="input" value={partners.title} onChange={(e) => setPartners({ ...partners, title: e.target.value })} /></div>
        </div>
        <div className="space-y-3">
          {partners.items.map((it, i) => (
            <ItemCard key={i} i={i} total={partners.items.length} label="partner" title={it.name} onMove={(d) => movePart(i, d)} onRemove={() => removePartItem(i)}>
              <div className="grid sm:grid-cols-[140px_1fr] gap-3.5">
                <div>
                  <label className="field-label">Logo</label>
                  <div className="aspect-[3/2] rounded-lg overflow-hidden border border-line-2 bg-white grid place-items-center">
                    {it.image ? (
                      <img src={imgUrl(it.image)!} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <span className="font-mono text-[10.5px] uppercase tracking-wide text-steel text-center px-2">Name only</span>
                    )}
                  </div>
                  {canWrite && (
                    <div className="flex gap-2 mt-1.5">
                      <label className="btn btn-ghost btn-sm cursor-pointer">
                        {partImgBusy === i ? "Uploading…" : it.image ? "Replace" : "Upload"}
                        <input type="file" accept="image/*" className="hidden" disabled={partImgBusy === i}
                          onChange={(e) => { uploadPartImage(i, e.target.files?.[0]); e.target.value = ""; }} />
                      </label>
                      {it.image && <button className="btn btn-ghost btn-sm" onClick={() => setPartImage(i, null)}>Remove logo</button>}
                    </div>
                  )}
                </div>
                <div className="grid gap-3 content-start">
                  <div><label className="field-label">Partner name</label><input className="input" placeholder="e.g. WORLDBEX" value={it.name} onChange={(e) => setPartName(i, e.target.value)} /></div>
                </div>
              </div>
            </ItemCard>
          ))}
          {!partners.items.length && <p className="text-steel text-[13.5px]">No partners yet — add your first one below.</p>}
          <AddButton onClick={addPartItem}>+ Add partner</AddButton>
        </div>
        <p className="text-steel text-[12px] mt-3">Upload a logo, or leave it as “Name only” to show the partner’s name as text. Use the ↑ ↓ arrows to reorder.</p>
      </Section>

      {/* ============ Contact details ============ */}
      <Section id="contact" title="Contact details" where="Footer + Contact page" desc="Email, phone, address and opening hours shown across the site.">
        <div className="grid sm:grid-cols-2 gap-3">
          <div><label className="field-label">Email</label><input className="input" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} /></div>
          <div><label className="field-label">Phone</label><input className="input" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} /></div>
          <div><label className="field-label">Address</label><input className="input" value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} /></div>
          <div><label className="field-label">Opening hours</label><input className="input" value={contact.hours} onChange={(e) => setContact({ ...contact, hours: e.target.value })} /></div>
        </div>
      </Section>

      {/* Bottom save reminder so editors don't have to scroll back up */}
      {canWrite && (
        <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-line-2">
          <span className="text-[13px] text-steel">{dirty ? "You have unsaved changes." : "Everything is saved."}</span>
          <button className="btn btn-primary btn-sm" onClick={save} disabled={busy || !dirty}>{busy ? "Saving…" : "Save changes"}</button>
        </div>
      )}
    </div>
  );
}
