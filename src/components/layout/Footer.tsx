import { useState } from "react";
import { Link } from "react-router-dom";
import type { Category, ContactSettings, SocialSettings } from "../../lib/types";
import { submitInquiry } from "../../lib/api";
import { Brand } from "./Header";

/* Newsletter signup — records a lightweight inquiry (public insert is allowed). */
function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setBusy(true);
    try {
      await submitInquiry({ name: "Newsletter subscriber", email, subject: "Newsletter signup", message: "Newsletter signup from website footer." });
      setDone(true);
    } catch { /* keep silent in the footer */ } finally { setBusy(false); }
  }

  if (done) return <p className="text-[14px] text-white/85">Thanks — you're on the list. ✓</p>;

  return (
    <form onSubmit={submit} className="flex items-center gap-2 bg-white rounded-full pl-5 pr-1.5 py-1.5 max-w-sm shadow-card">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email for updates"
        className="flex-1 bg-transparent outline-none text-[14px] text-corp-navy placeholder:text-steel-2"
      />
      <button type="submit" disabled={busy} aria-label="Subscribe" className="w-9 h-9 shrink-0 grid place-items-center rounded-full bg-corp-orange text-white hover:bg-corp-orangeD transition-colors disabled:opacity-60">›</button>
    </form>
  );
}

/* Industrial skyline silhouette — buildings + a couple of smokestacks rising from
   a continuous baseline so it merges seamlessly into the navy block below. */
const BUILDINGS: [number, number, number][] = [
  [20, 70, 90], [100, 62, 122], [172, 82, 76], [262, 52, 146], [322, 70, 100],
  [400, 62, 132], [472, 92, 86], [574, 56, 162], [640, 70, 112], [718, 60, 142],
  [786, 82, 96], [876, 56, 150], [940, 76, 106], [1024, 60, 172], [1092, 82, 90],
  [1182, 56, 136], [1248, 70, 116], [1326, 94, 100],
];
const STACKS: [number, number, number][] = [[626, 9, 188], [1010, 9, 196]];
const BASE = 240;

function Skyline() {
  return (
    <svg viewBox="0 0 1440 240" preserveAspectRatio="xMidYMax meet" aria-hidden="true" className="block w-full h-auto text-corp-navy">
      <g fill="currentColor">
        <rect x="0" y="230" width="1440" height="10" />
        {BUILDINGS.map(([x, w, h], i) => <rect key={i} x={x} y={BASE - h} width={w} height={h} rx="1.5" />)}
        {STACKS.map(([x, w, h], i) => <rect key={`s${i}`} x={x} y={BASE - h} width={w} height={h} />)}
      </g>
    </svg>
  );
}

const SOCIAL: [keyof SocialSettings, string, string][] = [
  ["facebook", "Facebook", "/lexus/facebook.png"],
  ["instagram", "Instagram", "/lexus/instagram.png"],
];

const NAV: [string, string][] = [["/", "Home"], ["/products", "Products"], ["/services", "Services"], ["/about", "About"], ["/contact", "Contact"]];

export default function Footer({ contact, social = {}, categories = [] }: { contact: ContactSettings; social?: SocialSettings; categories?: Category[] }) {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full">
      {/* Sky + skyline silhouette — full-bleed. Gradient fades from the light
          section above into a soft periwinkle behind the buildings (no seam). */}
      <div className="bg-gradient-to-b from-paper to-[#E9EAF7] pt-20">
        <Skyline />
      </div>

      {/* Solid navy block — full-bleed, content centered */}
      <div className="bg-corp-navy text-white -mt-px">
        <div className="max-w-content mx-auto px-6 sm:px-8 pt-12 pb-10">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_2fr]">
            {/* Brand */}
            <div>
              <Brand className="h-8" />
              <p className="text-white/65 text-[14px] mt-4 max-w-xs leading-relaxed">
                Interior finishings &amp; building materials — trusted by builders across the Philippines since 1995.
              </p>
              <div className="flex items-center gap-2.5 mt-5">
                {SOCIAL.map(([key, label, icon]) => (
                  <a
                    key={key}
                    href={social[key] || "#"}
                    target={social[key] ? "_blank" : undefined}
                    rel="noreferrer"
                    aria-label={label}
                    className="w-9 h-9 grid place-items-center rounded-full bg-white hover:opacity-80 transition-opacity overflow-hidden"
                  >
                    <img src={icon} alt="" className="w-4 h-4 object-contain" />
                  </a>
                ))}
              </div>
              <div className="mt-5">
                <Newsletter />
              </div>
            </div>

            {/* Link columns */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div>
                <h4 className="font-mono text-[11px] tracking-[0.14em] uppercase text-white/45 mb-4">Contact</h4>
                <a href={`mailto:${contact.email}`} className="block py-1.5 text-[14px] text-white/75 hover:text-white transition-colors break-all">{contact.email}</a>
                {contact.phone && <a href={`tel:${contact.phone}`} className="block py-1.5 text-[14px] text-white/75 hover:text-white transition-colors">{contact.phone}</a>}
                <span className="block py-1.5 text-[14px] text-white/60">{contact.address}</span>
                <span className="block py-1.5 text-[14px] text-white/60">{contact.hours}</span>
              </div>
              <div>
                <h4 className="font-mono text-[11px] tracking-[0.14em] uppercase text-white/45 mb-4">Quick links</h4>
                {NAV.map(([to, l]) => (
                  <Link key={to} to={to} className="block py-1.5 text-[14px] text-white/75 hover:text-white transition-colors">{l}</Link>
                ))}
              </div>
              <div>
                <h4 className="font-mono text-[11px] tracking-[0.14em] uppercase text-white/45 mb-4">Categories</h4>
                {categories.slice(0, 6).map((c) => (
                  <Link key={c.id} to={`/products?cat=${c.slug}`} className="block py-1.5 text-[14px] text-white/75 hover:text-white transition-colors">
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Legal — centered */}
          <div className="mt-12 pt-6 border-t border-white/15 text-center">
            <p className="font-mono text-[12px] text-white/55">{contact.address || "Metro Manila, Philippines"} · Since 1995</p>
            <p className="font-mono text-[12px] text-white/45 mt-1.5">© {year} Lexus Industrial Enterprise Corporation. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
