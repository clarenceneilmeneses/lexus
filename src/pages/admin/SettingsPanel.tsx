import { useState } from "react";
import type { Branch, Catalog, ContactSettings, SeoSettings, SocialSettings } from "../../lib/types";
import { saveSettings } from "../../lib/api";

export default function SettingsPanel({ catalog, reload }: { catalog: Catalog; reload: () => void }) {
  const s = catalog.settings;
  const [contact, setContact] = useState<ContactSettings>({
    ...s.contact,
    branches: s.contact.branches?.length ? s.contact.branches : [{ city: "", address: "", phone: "", email: "" }],
  });
  const [social, setSocial] = useState<SocialSettings>({ ...s.social });
  const [seo, setSeo] = useState<SeoSettings>({ ...s.seo });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const branches = contact.branches ?? [];
  const setBranch = (i: number, patch: Partial<Branch>) =>
    setContact((c) => ({ ...c, branches: (c.branches ?? []).map((b, j) => (j === i ? { ...b, ...patch } : b)) }));
  const addBranch = () =>
    setContact((c) => ({ ...c, branches: [...(c.branches ?? []), { city: "", address: "", phone: "", email: "" }] }));
  const removeBranch = (i: number) =>
    setContact((c) => ({ ...c, branches: (c.branches ?? []).filter((_, j) => j !== i) }));

  async function save() {
    setBusy(true); setMsg("");
    try {
      const cleanBranches = (contact.branches ?? []).filter((b) => b.city.trim() || b.address.trim());
      await saveSettings([
        { key: "contact", value: { ...contact, branches: cleanBranches } },
        { key: "social", value: social },
        { key: "seo", value: seo },
      ]);
      setMsg("Saved.");
      reload();
    } catch (e: any) {
      setMsg(e.message ?? "Failed to save.");
    } finally { setBusy(false); }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[22px]">Site settings</h2>
        <button className="btn btn-primary btn-sm" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save settings"}</button>
      </div>
      {msg && <div className="bg-[#E8F7EF] border border-[#BFE6CF] text-[#137A43] px-3.5 py-3 rounded text-[13.5px] mb-4">{msg}</div>}

      {/* Branches */}
      <div className="panel mb-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base">Branches / locations</h3>
          <button className="btn btn-ghost btn-sm" onClick={addBranch}>+ Add branch</button>
        </div>
        <div className="space-y-4">
          {branches.map((b, i) => (
            <div key={i} className="grid sm:grid-cols-2 gap-3 pb-4 border-b border-line-2 last:border-0 last:pb-0">
              <div><label className="field-label">City / label</label><input className="input" value={b.city} onChange={(e) => setBranch(i, { city: e.target.value })} /></div>
              <div><label className="field-label">Address</label><input className="input" value={b.address} onChange={(e) => setBranch(i, { address: e.target.value })} /></div>
              <div><label className="field-label">Phone</label><input className="input" value={b.phone ?? ""} onChange={(e) => setBranch(i, { phone: e.target.value })} /></div>
              <div className="flex items-end gap-2">
                <div className="flex-1"><label className="field-label">Email</label><input className="input" value={b.email ?? ""} onChange={(e) => setBranch(i, { email: e.target.value })} /></div>
                {branches.length > 1 && <button className="btn btn-sm bg-[#FCE9E9] text-[#B23030]" onClick={() => removeBranch(i)}>Remove</button>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Primary contact */}
      <div className="panel mb-4">
        <h3 className="text-base mb-3">Primary contact</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><label className="field-label">Email</label><input className="input" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} /></div>
          <div><label className="field-label">Phone</label><input className="input" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} /></div>
          <div><label className="field-label">Address</label><input className="input" value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} /></div>
          <div><label className="field-label">Hours</label><input className="input" value={contact.hours} onChange={(e) => setContact({ ...contact, hours: e.target.value })} /></div>
        </div>
      </div>

      {/* Social */}
      <div className="panel mb-4">
        <h3 className="text-base mb-3">Social links</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <div><label className="field-label">Facebook</label><input className="input" value={social.facebook ?? ""} onChange={(e) => setSocial({ ...social, facebook: e.target.value })} /></div>
          <div><label className="field-label">Instagram</label><input className="input" value={social.instagram ?? ""} onChange={(e) => setSocial({ ...social, instagram: e.target.value })} /></div>
          <div><label className="field-label">LinkedIn</label><input className="input" value={social.linkedin ?? ""} onChange={(e) => setSocial({ ...social, linkedin: e.target.value })} /></div>
        </div>
      </div>

      {/* SEO */}
      <div className="panel">
        <h3 className="text-base mb-3">SEO</h3>
        <div className="grid gap-3">
          <div><label className="field-label">Meta title</label><input className="input" value={seo.title ?? ""} onChange={(e) => setSeo({ ...seo, title: e.target.value })} /></div>
          <div><label className="field-label">Meta description</label><textarea className="input min-h-[80px]" value={seo.description ?? ""} onChange={(e) => setSeo({ ...seo, description: e.target.value })} /></div>
        </div>
      </div>
    </div>
  );
}
