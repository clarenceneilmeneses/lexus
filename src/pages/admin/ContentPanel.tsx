import { useState } from "react";
import type { Catalog } from "../../lib/types";
import { saveSettings } from "../../lib/api";

export default function ContentPanel({ catalog, reload, canWrite }: { catalog: Catalog; reload: () => void; canWrite: boolean }) {
  const s = catalog.settings;
  const [hero, setHero] = useState(s.hero);
  const [about, setAbout] = useState(s.about);
  const [contact, setContact] = useState(s.contact);
  const [services, setServices] = useState(s.services);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const setItem = (i: number, k: "title" | "body", v: string) =>
    setServices((sv) => ({ ...sv, items: sv.items.map((it, j) => (j === i ? { ...it, [k]: v } : it)) }));
  const addItem = () =>
    setServices((sv) => ({ ...sv, items: [...sv.items, { title: "", body: "" }] }));
  const removeItem = (i: number) =>
    setServices((sv) => ({ ...sv, items: sv.items.filter((_, j) => j !== i) }));

  async function save() {
    setBusy(true);
    try {
      await saveSettings([
        { key: "hero", value: hero },
        { key: "about", value: about },
        { key: "contact", value: contact },
        { key: "services", value: { ...services, items: services.items.filter((it) => it.title.trim() || it.body.trim()) } },
      ]);
      setMsg("Saved."); reload(); setTimeout(() => setMsg(""), 2500);
    } finally { setBusy(false); }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[22px]">Website content</h2>
        {canWrite && <button className="btn btn-primary btn-sm" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>}
      </div>
      {!canWrite && <div className="bg-line-2 text-steel px-3.5 py-3 rounded text-[13.5px] mb-3.5">Read-only — your role can't edit content.</div>}
      {msg && <div className="bg-[#E8F7EF] border border-[#B6E6CB] text-[#137A43] px-3.5 py-3 rounded text-[13.5px] mb-3.5">{msg}</div>}

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
            <div key={i} className="grid sm:grid-cols-[1fr_2fr_auto] gap-3 pb-4 border-b border-line-2 last:border-0 last:pb-0">
              <div><label className="field-label">Title</label><input className="input" value={it.title} onChange={(e) => setItem(i, "title", e.target.value)} /></div>
              <div><label className="field-label">Description</label><textarea className="input min-h-[64px]" value={it.body} onChange={(e) => setItem(i, "body", e.target.value)} /></div>
              {canWrite && <div className="flex items-end"><button className="btn btn-sm bg-[#FCE9E9] text-[#B23030]" onClick={() => removeItem(i)}>Remove</button></div>}
            </div>
          ))}
          {!services.items.length && <p className="text-steel text-[13.5px]">No services yet. Add one above.</p>}
        </div>
        <p className="text-steel text-[12px] mt-3">The first 4 show on the homepage; all appear on the Services page.</p>
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
