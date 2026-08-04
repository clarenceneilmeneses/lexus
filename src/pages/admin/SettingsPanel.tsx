import { useState } from "react";
import type { Catalog, SeoSettings, SocialSettings } from "../../lib/types";
import { saveSettings } from "../../lib/api";
import { StatCard, StatRow } from "../../components/StatCard";

/**
 * Technical site settings. Contact details, branches and all page copy live in
 * the Content panel — keeping them out of here means only one screen ever
 * writes the `contact` key, so two people editing at once can't clobber each
 * other's changes.
 */
/** Plain-language hint plus a length counter that warns past Google's cut-off. */
function CharHint({ value, ideal, hint }: { value: string; ideal: number; hint: string }) {
  const n = value.trim().length;
  const over = n > ideal;
  return (
    <div className="flex items-start justify-between gap-3 mt-1.5">
      <p className="text-steel text-[12px] leading-snug">{hint}</p>
      <span className={`font-mono text-[11px] tabular-nums whitespace-nowrap ${over ? "text-[#B26B00]" : "text-steel-2"}`}>
        {n}/{ideal}{over ? " — may be cut off" : ""}
      </span>
    </div>
  );
}

export default function SettingsPanel({ catalog, reload }: { catalog: Catalog; reload: () => void }) {
  const s = catalog.settings;
  const [social, setSocial] = useState<SocialSettings>({ ...s.social });
  const [seo, setSeo] = useState<SeoSettings>({ ...s.seo });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const branchCount = (s.contact.branches ?? []).filter((b) => b.city.trim() || b.address.trim()).length;

  async function save() {
    setBusy(true); setMsg("");
    try {
      await saveSettings([
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
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[22px]">Site settings</h2>
        <button className="btn btn-primary btn-sm" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save settings"}</button>
      </div>

      <StatRow>
        <StatCard label="Branches" value={branchCount} />
        <StatCard label="Social links" value={[social.facebook, social.instagram, social.linkedin].filter((x) => x?.trim()).length} tone="steel" />
        <StatCard label="SEO" value={(seo.title?.trim() || seo.description?.trim()) ? "Set" : "—"} tone={(seo.title?.trim() || seo.description?.trim()) ? "green" : "orange"} />
      </StatRow>

      {msg && <div className="bg-[#E8F7EF] border border-[#BFE6CF] text-[#137A43] px-3.5 py-3 rounded text-[13.5px] mb-4">{msg}</div>}

      <div className="bg-[#F4F6FB] border border-line-2 rounded-xl px-4 py-3 mb-4 text-[13px] text-steel">
        Looking for the <b className="text-ink">email, phone, address or branches</b>? They're edited under <b className="text-ink">Website content → Contact details</b>, alongside the wording that goes with them.
      </div>

      {/* Side by side on wide screens so neither card stretches on its own */}
      <div className="grid gap-4 lg:grid-cols-2 items-start">
        {/* Social */}
        <div className="panel">
          <h3 className="text-base mb-3">Social links</h3>
          <div className="grid gap-3">
            <div><label className="field-label">Facebook</label><input className="input" value={social.facebook ?? ""} onChange={(e) => setSocial({ ...social, facebook: e.target.value })} /></div>
            <div><label className="field-label">Instagram</label><input className="input" value={social.instagram ?? ""} onChange={(e) => setSocial({ ...social, instagram: e.target.value })} /></div>
            <div><label className="field-label">LinkedIn</label><input className="input" value={social.linkedin ?? ""} onChange={(e) => setSocial({ ...social, linkedin: e.target.value })} /></div>
          </div>
        </div>

        {/* SEO */}
        <div className="panel">
          <h3 className="text-base mb-1">SEO</h3>
          <p className="text-steel text-[13px] mb-3">
            What Google shows when someone finds your website. Individual pages write their own —
            these are the site-wide default, used on the home page.
          </p>
          <div className="grid gap-3">
            <div>
              <label className="field-label">Meta title</label>
              <input className="input" value={seo.title ?? ""} onChange={(e) => setSeo({ ...seo, title: e.target.value })} />
              <CharHint
                value={seo.title ?? ""}
                ideal={60}
                hint="The blue clickable line in Google. Put what you sell and where — e.g. “Interior Finishings & Building Materials Supplier | Metro Manila”."
              />
            </div>
            <div>
              <label className="field-label">Meta description</label>
              <textarea className="input min-h-[104px]" value={seo.description ?? ""} onChange={(e) => setSeo({ ...seo, description: e.target.value })} />
              <CharHint
                value={seo.description ?? ""}
                ideal={160}
                hint="The grey summary under the title. One or two sentences: what you supply, who you serve, and since when."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
