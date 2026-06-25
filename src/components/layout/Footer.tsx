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

  if (done) return <p className="text-[14px] text-corp-grey">Thanks — you're on the list. ✓</p>;

  return (
    <form onSubmit={submit} className="flex items-center gap-2 bg-white border border-line rounded-full pl-5 pr-1.5 py-1.5 max-w-sm shadow-card">
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

const SOCIAL: [keyof SocialSettings, string, string][] = [
  ["facebook", "Facebook", "/lexus/facebook.png"],
  ["instagram", "Instagram", "/lexus/instagram.png"],
];

export default function Footer({ contact, social = {}, categories = [] }: { contact: ContactSettings; social?: SocialSettings; categories?: Category[] }) {
  return (
    <footer className="relative overflow-hidden bg-corp-bg text-corp-navy">
      {/* grounded interior photo at the base */}
      <div className="absolute inset-x-0 bottom-0 h-[48%] sm:h-[42%] pointer-events-none">
        <img src="/lexus/kitchen.jpg" alt="" aria-hidden="true" className="w-full h-full object-cover grayscale" />
        <div className="absolute inset-0 bg-gradient-to-t from-corp-navy/90 via-corp-bg/80 to-corp-bg" />
      </div>

      <div className="relative wrap pt-16 pb-8">
        <div className="grid gap-12 lg:grid-cols-[1.25fr_1.75fr]">
          {/* brand + tagline + signup */}
          <div>
            <h2 className="font-display font-semibold tracking-tight text-[clamp(26px,3.4vw,40px)] leading-[1.05] text-corp-navy max-w-sm">
              Beautiful interiors start with the right materials.
            </h2>
            <div className="mt-7">
              <Brand className="h-9" tone="dark" />
            </div>
            <div className="flex items-center gap-2.5 mt-5">
              {SOCIAL.map(([key, label, icon]) => (
                <a
                  key={key}
                  href={social[key] || "#"}
                  target={social[key] ? "_blank" : undefined}
                  rel="noreferrer"
                  aria-label={label}
                  className="w-9 h-9 grid place-items-center rounded-full bg-white border border-line hover:border-corp-orange transition-colors overflow-hidden"
                >
                  <img src={icon} alt="" className="w-4 h-4 object-contain" />
                </a>
              ))}
            </div>
            <div className="mt-6">
              <Newsletter />
            </div>
          </div>

          {/* link columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h4 className="font-mono text-[11px] tracking-[0.14em] uppercase text-corp-grey mb-4">Navigation</h4>
              {[["/", "Home"], ["/products", "Products"], ["/services", "Services"], ["/about", "About"], ["/contact", "Contact"]].map(
                ([to, l]) => (
                  <Link key={to} to={to} className="block py-1.5 text-[14px] text-corp-navy/80 hover:text-corp-orange transition-colors">{l}</Link>
                )
              )}
            </div>
            <div>
              <h4 className="font-mono text-[11px] tracking-[0.14em] uppercase text-corp-grey mb-4">Categories</h4>
              {categories.slice(0, 6).map((c) => (
                <Link key={c.id} to={`/products?cat=${c.slug}`} className="block py-1.5 text-[14px] text-corp-navy/80 hover:text-corp-orange transition-colors">
                  {c.name}
                </Link>
              ))}
            </div>
            <div>
              <h4 className="font-mono text-[11px] tracking-[0.14em] uppercase text-corp-grey mb-4">Get in touch</h4>
              <a href={`mailto:${contact.email}`} className="block py-1.5 text-[14px] text-corp-navy/80 hover:text-corp-orange transition-colors break-all">{contact.email}</a>
              {contact.phone && <a href={`tel:${contact.phone}`} className="block py-1.5 text-[14px] text-corp-navy/80 hover:text-corp-orange transition-colors">{contact.phone}</a>}
              <span className="block py-1.5 text-[14px] text-corp-navy/70">{contact.hours}</span>
              <span className="block py-1.5 text-[14px] text-corp-navy/70">{contact.address}</span>
            </div>
          </div>
        </div>

        {/* legal row — sits over the grounded photo */}
        <div className="mt-28 sm:mt-36 pt-5 border-t border-white/20 flex flex-wrap justify-between gap-2 text-[12.5px] font-mono text-white/80">
          <span>© {new Date().getFullYear()} Lexus Industrial Enterprise Corporation. All rights reserved.</span>
          <Link to="/admin" className="hover:text-accent-glow transition-colors">Staff login →</Link>
        </div>
      </div>
    </footer>
  );
}
