import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight, ChevronUp, Trash2 } from "lucide-react";
import type {
  Branch,
  Catalog,
  ContactSettings,
  CredentialsSettings,
  InteriorsSettings,
  PartnersSettings,
  ServicesSettings,
} from "../../lib/types";
import { deleteSiteImages, saveSettings, uploadSiteImage } from "../../lib/api";
import { imgUrl } from "../../lib/utils";

// Every site-image path referenced across the editable content blocks — used to
// reconcile storage at save time and delete whatever ends up unreferenced.
const contentImages = (
  services: ServicesSettings,
  interiors: InteriorsSettings,
  credentials: CredentialsSettings,
  partners: PartnersSettings,
  contact: ContactSettings,
) =>
  [
    ...services.items.map((it) => it.image),
    ...interiors.items.map((it) => it.image),
    credentials.image,
    ...partners.items.map((it) => it.image),
    contact.image,
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
  { id: "featured", title: "Featured products", where: "Home page" },
  { id: "category_section", title: "Category tiles", where: "Home page" },
  { id: "interiors", title: "Project gallery", where: "Home page" },
  { id: "credentials", title: "Awards & recognition", where: "Home page" },
  { id: "testimonials", title: "Customer quotes", where: "Home page" },
  { id: "partners", title: "Partner logos", where: "Home page" },
  { id: "contact", title: "Contact details", where: "Home + Footer + Contact" },
] as const;

/* These three live at module scope on purpose. Declared inside ContentPanel they
   would be a brand-new component type on every render, so React would unmount
   and remount every field — and the input you were typing in would lose focus
   after each keystroke. Anything they used to close over is now a prop. */

// ---- Reusable collapsible section card ----
function Section({ id, title, desc, where, open, onToggle, children }: {
  id: string; title: string; desc: string; where: string;
  open: Set<string>; onToggle: (id: string) => void; children: ReactNode;
}) {
  const isOpen = open.has(id);
  return (
    <div id={`sec-${id}`} className="panel p-0 overflow-hidden mb-3 scroll-mt-24">
      <button
        type="button"
        onClick={() => onToggle(id)}
        aria-expanded={isOpen}
        className="w-full flex items-start gap-3 text-left px-4 sm:px-5 py-3.5 hover:bg-[#F7F8FA] transition-colors"
      >
        <span className={`mt-0.5 flex-none w-7 h-7 grid place-items-center rounded-lg transition-colors ${isOpen ? "bg-corp-navy text-white" : "bg-[#EEF0F6] text-corp-navy"}`}>
          <ChevronRight className={`w-[15px] h-[15px] transition-transform ${isOpen ? "rotate-90" : ""}`} strokeWidth={2.2} />
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
function ItemCard({ i, total, label, title, canWrite, onMove, onRemove, children }: {
  i: number; total: number; label: string; title: string; canWrite: boolean;
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
              <ChevronUp className="w-[15px] h-[15px]" strokeWidth={2.2} />
            </button>
            <button type="button" title="Move down" aria-label="Move down" disabled={i === total - 1} onClick={() => onMove(1)} className={`${ctrl} text-steel hover:bg-line-2 disabled:hover:bg-transparent`}>
              <ChevronDown className="w-[15px] h-[15px]" strokeWidth={2.2} />
            </button>
            <button type="button" title={`Remove ${label}`} aria-label={`Remove ${label}`} onClick={onRemove} className={`${ctrl} text-[#B23030] hover:bg-[#FCE9E9]`}>
              <Trash2 className="w-[15px] h-[15px]" strokeWidth={1.9} />
            </button>
          </div>
        )}
      </div>
      <div className="p-3.5">{children}</div>
    </div>
  );
}

// ---- Full-width dashed "add another" button ----
function AddButton({ canWrite, onClick, children }: { canWrite: boolean; onClick: () => void; children: ReactNode }) {
  if (!canWrite) return null;
  return (
    <button type="button" onClick={onClick} className="w-full rounded-xl border border-dashed border-line text-corp-navy font-display font-semibold text-[13.5px] py-2.5 hover:border-corp-navy hover:bg-[#F7F8FA] transition-colors">
      {children}
    </button>
  );
}

export default function ContentPanel({ catalog, reload, canWrite }: { catalog: Catalog; reload: () => void; canWrite: boolean }) {
  const s = catalog.settings;
  const [hero, setHero] = useState(s.hero);
  const [about, setAbout] = useState(s.about);
  const [contact, setContact] = useState(s.contact);
  const [services, setServices] = useState(s.services);
  const [featured, setFeatured] = useState(s.featured);
  const [categoryBlock, setCategoryBlock] = useState(s.category_section);
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
  const [contactImgBusy, setContactImgBusy] = useState(false);

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
  const persistedImages = useRef<Set<string>>(
    new Set(contentImages(s.services, s.interiors, s.credentials, s.partners, s.contact)),
  );
  const uploadedImages = useRef<Set<string>>(new Set());

  // Unsaved-changes tracking: snapshot of the last-saved state vs. current.
  const snap = () =>
    JSON.stringify({ hero, about, contact, services, featured, categoryBlock, interiors, credentials, testimonials, partners });
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

  // ---- Contact: branch cards (home page) + the photo beside the form ----
  const branches = contact.branches ?? [];
  const setBranch = (i: number, patch: Partial<Branch>) =>
    setContact((c) => ({ ...c, branches: (c.branches ?? []).map((b, j) => (j === i ? { ...b, ...patch } : b)) }));
  const addBranch = () =>
    setContact((c) => ({ ...c, branches: [...(c.branches ?? []), { city: "", address: "", phone: "", email: "" }] }));
  const removeBranch = (i: number) =>
    setContact((c) => ({ ...c, branches: (c.branches ?? []).filter((_, j) => j !== i) }));
  const moveBranch = (i: number, dir: number) =>
    setContact((c) => ({ ...c, branches: move(c.branches ?? [], i, i + dir) }));

  async function uploadContactImage(file: File | undefined) {
    if (!file) return;
    setErr(""); setContactImgBusy(true);
    try {
      const path = await uploadSiteImage(file, "contact");
      uploadedImages.current.add(path);
      setContact((c) => ({ ...c, image: path }));
    } catch (e: any) {
      setErr(e?.message ?? "Image upload failed.");
    } finally { setContactImgBusy(false); }
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
      const branchItems = (contact.branches ?? []).filter((b) => b.city.trim() || b.address.trim());
      const savedAbout = { ...about, stats: aboutStats };
      const savedServices = { ...services, items };
      const savedInteriors = { ...interiors, items: intItems };
      const savedCredentials = { ...credentials, stats: credStats };
      const savedTestimonials = { ...testimonials, items: testItems };
      const savedPartners = { ...partners, items: partItems };
      const savedContact = { ...contact, branches: branchItems };
      await saveSettings([
        { key: "hero", value: hero },
        { key: "about", value: savedAbout },
        { key: "contact", value: savedContact },
        { key: "services", value: savedServices },
        { key: "featured", value: featured },
        { key: "category_section", value: categoryBlock },
        { key: "interiors", value: savedInteriors },
        { key: "credentials", value: savedCredentials },
        { key: "testimonials", value: savedTestimonials },
        { key: "partners", value: savedPartners },
      ]);

      // Reconcile storage: delete any previously-persisted or this-session-uploaded
      // image that the saved content no longer references.
      const kept = new Set(contentImages(savedServices, savedInteriors, savedCredentials, savedPartners, savedContact));
      const orphans = [...persistedImages.current, ...uploadedImages.current].filter((p) => !kept.has(p));
      if (orphans.length) await deleteSiteImages([...new Set(orphans)]).catch(() => { /* best effort */ });
      persistedImages.current = kept;
      uploadedImages.current = new Set();

      // Adopt the cleaned (blank rows removed) values so the form matches what's
      // live, and mark everything as saved.
      setAbout(savedAbout); setServices(savedServices); setInteriors(savedInteriors);
      setCredentials(savedCredentials); setTestimonials(savedTestimonials); setPartners(savedPartners);
      setContact(savedContact);
      savedSnap.current = JSON.stringify({
        hero, about: savedAbout, contact: savedContact, services: savedServices, featured,
        categoryBlock, interiors: savedInteriors, credentials: savedCredentials,
        testimonials: savedTestimonials, partners: savedPartners,
      });

      setMsg("Your changes are now live on the website."); reload(); setTimeout(() => setMsg(""), 4000);
    } catch (e: any) {
      setErr(e?.message ?? "Couldn't save. Please try again.");
    } finally { setBusy(false); }
  }

  return (
    <div>
      {/* Sticky action bar — the one and only Save, always reachable. Offsets
          match the admin container's padding so the blur runs edge to edge. */}
      <div className="sticky top-[58px] md:top-[70px] z-20 -mx-4 md:-mx-6 px-4 md:px-6 -mt-5 md:-mt-6 pt-5 md:pt-6 pb-3 bg-white/95 backdrop-blur border-b border-line-2 mb-4 flex items-center justify-between gap-3">
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
      <Section id="hero" open={open} onToggle={toggle} title="Homepage banner" where="Home page" desc="The big headline and video at the very top of your home page.">
        <div className="mb-3.5">
          <label className="field-label">Small label above the headline</label>
          <input className="input" placeholder="e.g. Industrial finishing supplier" value={hero.eyebrow} onChange={(e) => setHero({ ...hero, eyebrow: e.target.value })} />
        </div>
        <div className="mb-3.5"><label className="field-label">Headline (the big text)</label><input className="input" value={hero.title} onChange={(e) => setHero({ ...hero, title: e.target.value })} /></div>
        <div className="mb-3.5"><label className="field-label">Subtitle (one or two sentences)</label><textarea className="input min-h-[90px]" value={hero.subtitle} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} /></div>
        <div className="mb-3.5">
          <label className="field-label">Second button label</label>
          <input className="input" placeholder="e.g. Explore our work" value={hero.cta_label} onChange={(e) => setHero({ ...hero, cta_label: e.target.value })} />
          <p className="text-steel text-[12px] mt-1.5">The button next to “Request a quote”. It scrolls down to your Services section, so keep the wording about your work — not about products.</p>
        </div>
        <div>
          <label className="field-label">Background video link (optional)</label>
          <input className="input" placeholder="Paste a video link ending in .mp4 — or leave blank" value={hero.video_url ?? ""} onChange={(e) => setHero({ ...hero, video_url: e.target.value })} />
          <p className="text-steel text-[12px] mt-1.5">Leave blank to keep the built-in Lexus video. Most people should leave this empty.</p>
        </div>
      </Section>

      {/* ============ About ============ */}
      <Section id="about" open={open} onToggle={toggle} title="About the company" where="Home + About page" desc="A short description of your company and the key numbers (the stats).">
        <div className="grid sm:grid-cols-2 gap-3 mb-3.5">
          <div><label className="field-label">Label above heading</label><input className="input" placeholder="e.g. Our story" value={about.eyebrow} onChange={(e) => setAbout({ ...about, eyebrow: e.target.value })} /></div>
          <div><label className="field-label">Title</label><input className="input" value={about.title} onChange={(e) => setAbout({ ...about, title: e.target.value })} /></div>
        </div>
        <div className="mb-2"><label className="field-label">Description</label><textarea className="input min-h-[110px]" value={about.body} onChange={(e) => setAbout({ ...about, body: e.target.value })} /></div>
        {!about.body.trim() && (
          <div className="bg-[#FFF4E0] border border-[#F3D9A6] text-[#8A5300] rounded-lg px-3 py-2 text-[12.5px] mb-4">
            Heads up: with the description empty, this whole section — <b>including the key numbers below</b> — disappears from the home page. It still shows on the About page.
          </div>
        )}
        <div className="flex items-center justify-between mb-2 mt-4">
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
      <Section id="services" open={open} onToggle={toggle} title="Services" where="Home + Services page" desc="The list of services you offer, each with its own photo.">
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <div><label className="field-label">Label above heading</label><input className="input" placeholder="e.g. What we do" value={services.eyebrow} onChange={(e) => setServices({ ...services, eyebrow: e.target.value })} /></div>
          <div><label className="field-label">Section title</label><input className="input" value={services.title} onChange={(e) => setServices({ ...services, title: e.target.value })} /></div>
        </div>
        <div className="mb-4">
          <label className="field-label">Subtitle</label>
          <input className="input" value={services.subtitle} onChange={(e) => setServices({ ...services, subtitle: e.target.value })} />
          <p className="text-steel text-[12px] mt-1.5">Shown under the heading on the home page only. The Services page has its own fixed subtitle.</p>
        </div>
        <div className="space-y-3">
          {services.items.map((it, i) => (
            <ItemCard key={i} i={i} canWrite={canWrite} total={services.items.length} label="service" title={it.title} onMove={(d) => moveSvc(i, d)} onRemove={() => removeItem(i)}>
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
          <AddButton canWrite={canWrite} onClick={addItem}>+ Add service</AddButton>
        </div>
        <p className="text-steel text-[12px] mt-3"><b className="text-ink">Every</b> service here shows on both the home page and the Services page — there's no cut-off, so adding one adds a card to the home page too. They're laid out in rows of three, and a leftover row spreads to fill the width. Use the ↑ ↓ arrows to reorder. Leave a photo as “Default photo” to use the built-in picture.</p>
      </Section>

      {/* ============ Featured products heading ============ */}
      <Section id="featured" open={open} onToggle={toggle} title="Featured products" where="Home page" desc="The wording above the sliding row of products on your home page.">
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <div><label className="field-label">Label above heading</label><input className="input" placeholder="e.g. The lineup" value={featured.eyebrow} onChange={(e) => setFeatured({ ...featured, eyebrow: e.target.value })} /></div>
          <div><label className="field-label">Heading</label><input className="input" value={featured.title} onChange={(e) => setFeatured({ ...featured, title: e.target.value })} /></div>
        </div>
        <div><label className="field-label">Subtitle</label><input className="input" value={featured.subtitle} onChange={(e) => setFeatured({ ...featured, subtitle: e.target.value })} /></div>
        <p className="text-steel text-[12px] mt-3">
          <b className="text-ink">Which products appear here</b> is set in <b className="text-ink">Products</b> — tick “Featured on home” on the ones you want, up to 10.
          If you haven't ticked any, the home page falls back to showing your first 10 products so the row is never empty.
        </p>
      </Section>

      {/* ============ Category tiles heading ============ */}
      <Section id="category_section" open={open} onToggle={toggle} title="Category tiles" where="Home page" desc="The wording above the “Shop by Category” picture tiles.">
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <div><label className="field-label">Label above heading</label><input className="input" placeholder="e.g. Our products" value={categoryBlock.eyebrow} onChange={(e) => setCategoryBlock({ ...categoryBlock, eyebrow: e.target.value })} /></div>
          <div><label className="field-label">Heading</label><input className="input" value={categoryBlock.title} onChange={(e) => setCategoryBlock({ ...categoryBlock, title: e.target.value })} /></div>
        </div>
        <div><label className="field-label">Subtitle</label><input className="input" value={categoryBlock.subtitle} onChange={(e) => setCategoryBlock({ ...categoryBlock, subtitle: e.target.value })} /></div>
        <p className="text-steel text-[12px] mt-3">
          <b className="text-ink">The tiles themselves</b> come from <b className="text-ink">Categories</b> — the first 8 in that list appear here, and their pictures and descriptions are edited there.
        </p>
      </Section>

      {/* ============ Project gallery (interiors) ============ */}
      <Section id="interiors" open={open} onToggle={toggle} title="Project gallery" where="Home page" desc="Photo tiles showing finished interiors (“Finished with Lexus”).">
        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          <div><label className="field-label">Label above heading</label><input className="input" value={interiors.eyebrow} onChange={(e) => setInteriors({ ...interiors, eyebrow: e.target.value })} /></div>
          <div><label className="field-label">Heading</label><input className="input" value={interiors.title} onChange={(e) => setInteriors({ ...interiors, title: e.target.value })} /></div>
          <div><label className="field-label">Subtitle</label><input className="input" value={interiors.subtitle} onChange={(e) => setInteriors({ ...interiors, subtitle: e.target.value })} /></div>
        </div>
        <div className="space-y-3">
          {interiors.items.map((it, i) => (
            <ItemCard key={i} i={i} canWrite={canWrite} total={interiors.items.length} label="tile" title={it.title} onMove={(d) => moveInt(i, d)} onRemove={() => removeIntItem(i)}>
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
          <AddButton canWrite={canWrite} onClick={addIntItem}>+ Add photo tile</AddButton>
        </div>
        <p className="text-steel text-[12px] mt-3">Tiles are all the same size, laid out in rows of three, and a leftover row spreads to fill the width. Use the ↑ ↓ arrows to reorder. Leave a photo as “Default photo” to use the built-in picture. If you remove every tile, the whole gallery section disappears from the home page.</p>
      </Section>

      {/* ============ Awards & recognition (credentials) ============ */}
      <Section id="credentials" open={open} onToggle={toggle} title="Awards & recognition" where="Home page" desc="Your industry-recognition band with a poster image and a few numbers.">
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
      <Section id="testimonials" open={open} onToggle={toggle} title="Customer quotes" where="Home page" desc="What clients and partners say about working with you.">
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <div><label className="field-label">Label above heading</label><input className="input" value={testimonials.eyebrow} onChange={(e) => setTestimonials({ ...testimonials, eyebrow: e.target.value })} /></div>
          <div><label className="field-label">Heading</label><input className="input" value={testimonials.title} onChange={(e) => setTestimonials({ ...testimonials, title: e.target.value })} /></div>
        </div>
        <div className="space-y-3">
          {testimonials.items.map((it, i) => (
            <ItemCard key={i} i={i} canWrite={canWrite} total={testimonials.items.length} label="quote" title={it.author} onMove={(d) => moveTest(i, d)} onRemove={() => removeTestItem(i)}>
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
          <AddButton canWrite={canWrite} onClick={addTestItem}>+ Add quote</AddButton>
        </div>
        <p className="text-steel text-[12px] mt-3">
          With <b className="text-ink">one</b> quote the home page shows it large and centred; with <b className="text-ink">two or more</b> they sit side by side in boxes. Remove them all and the section disappears.
        </p>
      </Section>

      {/* ============ Partner logos (partners) ============ */}
      <Section id="partners" open={open} onToggle={toggle} title="Partner logos" where="Home page" desc="Logos (or just names) of companies and brands you work with.">
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <div><label className="field-label">Label above heading</label><input className="input" value={partners.eyebrow} onChange={(e) => setPartners({ ...partners, eyebrow: e.target.value })} /></div>
          <div><label className="field-label">Heading</label><input className="input" value={partners.title} onChange={(e) => setPartners({ ...partners, title: e.target.value })} /></div>
        </div>
        <div className="space-y-3">
          {partners.items.map((it, i) => (
            <ItemCard key={i} i={i} canWrite={canWrite} total={partners.items.length} label="partner" title={it.name} onMove={(d) => movePart(i, d)} onRemove={() => removePartItem(i)}>
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
          <AddButton canWrite={canWrite} onClick={addPartItem}>+ Add partner</AddButton>
        </div>
        <p className="text-steel text-[12px] mt-3">
          Upload a logo, or leave it as “Name only” to show the partner’s name as text. Use the ↑ ↓ arrows to reorder.
          With <b className="text-ink">4 or more</b> partners the logos scroll past continuously; with <b className="text-ink">fewer than 4</b> they sit still in a centred row. Remove them all and the section disappears.
          {partners.items.length > 0 && partners.items.length < 4 && (
            <span className="block mt-1.5 text-[#8A5300]">You have {partners.items.length} — add {4 - partners.items.length} more to turn the scrolling strip on.</span>
          )}
        </p>
      </Section>

      {/* ============ Contact details ============ */}
      <Section id="contact" open={open} onToggle={toggle} title="Contact details" where="Home + Footer + Contact page" desc="Your email, phone and addresses — plus the wording and photo of the home page's contact section.">
        <h4 className="font-semibold text-[13.5px] text-ink mb-2">Main details</h4>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><label className="field-label">Email</label><input className="input" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} /></div>
          <div><label className="field-label">Phone</label><input className="input" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} /></div>
          <div><label className="field-label">Address</label><input className="input" value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} /></div>
          <div><label className="field-label">Opening hours</label><input className="input" value={contact.hours} onChange={(e) => setContact({ ...contact, hours: e.target.value })} /></div>
        </div>
        <p className="text-steel text-[12px] mt-2">These appear in the footer of every page and on the Contact page.</p>

        <h4 className="font-semibold text-[13.5px] text-ink mb-2 mt-5 pt-4 border-t border-line-2">Home page wording</h4>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <div><label className="field-label">Label above heading</label><input className="input" placeholder="e.g. Get in touch" value={contact.eyebrow} onChange={(e) => setContact({ ...contact, eyebrow: e.target.value })} /></div>
          <div><label className="field-label">Heading</label><input className="input" value={contact.title} onChange={(e) => setContact({ ...contact, title: e.target.value })} /></div>
        </div>
        <div><label className="field-label">Subtitle</label><input className="input" value={contact.subtitle} onChange={(e) => setContact({ ...contact, subtitle: e.target.value })} /></div>

        <h4 className="font-semibold text-[13.5px] text-ink mb-2 mt-5 pt-4 border-t border-line-2">Photo beside the form</h4>
        <div className="grid sm:grid-cols-[160px_1fr] gap-3.5">
          <div>
            <label className="field-label">Photo</label>
            <div className="aspect-[16/10] rounded-lg overflow-hidden border border-line-2 bg-white grid place-items-center">
              {contact.image ? (
                <img src={imgUrl(contact.image)!} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="font-mono text-[10.5px] uppercase tracking-wide text-steel text-center px-2">Default photo</span>
              )}
            </div>
            {canWrite && (
              <div className="flex gap-2 mt-1.5">
                <label className="btn btn-ghost btn-sm cursor-pointer">
                  {contactImgBusy ? "Uploading…" : contact.image ? "Replace" : "Upload"}
                  <input type="file" accept="image/*" className="hidden" disabled={contactImgBusy}
                    onChange={(e) => { uploadContactImage(e.target.files?.[0]); e.target.value = ""; }} />
                </label>
                {contact.image && <button className="btn btn-ghost btn-sm" onClick={() => setContact({ ...contact, image: null })}>Use default</button>}
              </div>
            )}
          </div>
          <div className="grid gap-3 content-start">
            <div><label className="field-label">Small label on the photo</label><input className="input" placeholder="e.g. Since 1995" value={contact.image_eyebrow} onChange={(e) => setContact({ ...contact, image_eyebrow: e.target.value })} /></div>
            <div><label className="field-label">Caption on the photo</label><textarea className="input min-h-[64px]" value={contact.image_caption} onChange={(e) => setContact({ ...contact, image_caption: e.target.value })} /></div>
          </div>
        </div>

        <h4 className="font-semibold text-[13.5px] text-ink mb-2 mt-5 pt-4 border-t border-line-2">Branches / locations</h4>
        <div className="space-y-3">
          {branches.map((b, i) => (
            <ItemCard key={i} i={i} canWrite={canWrite} total={branches.length} label="branch" title={b.city} onMove={(d) => moveBranch(i, d)} onRemove={() => removeBranch(i)}>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><label className="field-label">City / label</label><input className="input" placeholder="e.g. Metro Manila" value={b.city} onChange={(e) => setBranch(i, { city: e.target.value })} /></div>
                <div><label className="field-label">Address</label><input className="input" value={b.address} onChange={(e) => setBranch(i, { address: e.target.value })} /></div>
                <div><label className="field-label">Phone</label><input className="input" value={b.phone ?? ""} onChange={(e) => setBranch(i, { phone: e.target.value })} /></div>
                <div><label className="field-label">Email</label><input className="input" value={b.email ?? ""} onChange={(e) => setBranch(i, { email: e.target.value })} /></div>
              </div>
            </ItemCard>
          ))}
          {!branches.length && <p className="text-steel text-[13.5px]">No branches yet — add your first one below.</p>}
          <AddButton canWrite={canWrite} onClick={addBranch}>+ Add branch</AddButton>
        </div>
        <p className="text-steel text-[12px] mt-3">
          These show as cards under the photo on the home page. If you remove them all, the home page falls back to a single card built from the main address, phone and email above.
        </p>
      </Section>

      {/* Status line only — Save itself lives in the sticky bar above. */}
      {canWrite && (
        <p className="text-[13px] text-steel mt-5 pt-4 border-t border-line-2">
          {dirty ? "You have unsaved changes — press Save changes at the top." : "Everything is saved."}
        </p>
      )}
    </div>
  );
}
