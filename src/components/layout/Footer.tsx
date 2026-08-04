import { Link } from "react-router-dom";
import type { Category, ContactSettings, SocialSettings } from "../../lib/types";

/* Brand glyphs as inline SVG — lucide has no brand marks, and this keeps them
   monochrome so they inherit the footer's colour instead of sitting on the
   white plate a full-colour PNG needs. */
const GLYPH: Record<string, string> = {
  facebook:
    "M22.675 0h-21.35C.595 0 0 .593 0 1.325v21.351C0 23.407.595 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.325-.593 1.325-1.325V1.325C24 .593 23.405 0 22.675 0z",
  instagram:
    "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  linkedin:
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z",
};

const SOCIAL: [keyof SocialSettings, string][] = [
  ["facebook", "Facebook"],
  ["instagram", "Instagram"],
  ["linkedin", "LinkedIn"],
];

const NAV: [string, string][] = [["/", "Home"], ["/products", "Products"], ["/services", "Services"], ["/about", "About"], ["/contact", "Contact"]];

/** Uppercase column heading, as on the reference footer. */
const colHead = "font-ui font-semibold text-[12.5px] uppercase tracking-[0.1em] text-white/55 mb-5";
const colLink = "block py-1.5 text-[14.5px] leading-[1.6] tracking-[0.015em] text-white/75 hover:text-white transition-colors";

export default function Footer({ contact, social = {}, categories = [] }: { contact: ContactSettings; social?: SocialSettings; categories?: Category[] }) {
  const year = new Date().getFullYear();
  // Only render channels that actually have a URL — a "#" icon is a dead link.
  const links = SOCIAL.filter(([key]) => social[key]?.trim());

  return (
    <footer className="w-full">
      {/* Solid brand block — logo + tagline, then three link columns */}
      <div className="bg-ref-band text-white">
        <div className="band pt-[50px] pb-[30px]">
          <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
            <div>
              {/* White wordmark — reads straight on the navy, no white plate */}
              <Link to="/" aria-label="Lexus Industrial — Home" className="inline-block">
                <img
                  src="/lexus/logo-white.png"
                  alt="Lexus Industrial Enterprise Corporation"
                  className="h-8 w-auto object-contain"
                />
              </Link>
              <p className="copy-sm !text-white/70 mt-5 max-w-xs">
                Interior finishings &amp; building materials — trusted by builders across the Philippines since 1995.
              </p>

              {links.length > 0 && (
                <div className="flex items-center gap-2.5 mt-7">
                  {links.map(([key, label]) => (
                    <a
                      key={key}
                      href={social[key]}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={label}
                      title={label}
                      className="w-10 h-10 grid place-items-center rounded-full border border-white/20 bg-white/[0.06] text-white/75
                                 hover:bg-ref-accent hover:border-ref-accent hover:text-white transition-colors duration-200"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true" className="w-[17px] h-[17px] fill-current">
                        <path d={GLYPH[key]} />
                      </svg>
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div>
                <h4 className={colHead}>Contact</h4>
                {/* break-words, not break-all — the latter snaps mid-TLD */}
                <a href={`mailto:${contact.email}`} className={`${colLink} break-words`}>{contact.email}</a>
                {contact.phone && <a href={`tel:${contact.phone}`} className={colLink}>{contact.phone}</a>}
                <span className={`${colLink} !text-white/60`}>{contact.address}</span>
                <span className={`${colLink} !text-white/60`}>{contact.hours}</span>
              </div>
              <div>
                <h4 className={colHead}>Main</h4>
                {NAV.map(([to, l]) => (
                  <Link key={to} to={to} className={colLink}>{l}</Link>
                ))}
              </div>
              <div>
                <h4 className={colHead}>Products</h4>
                {categories.slice(0, 6).map((c) => (
                  <Link key={c.id} to={`/products?cat=${c.slug}`} className={colLink}>{c.name}</Link>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-white/15">
            <p className="font-ui text-[13px] tracking-[0.02em] text-white/55">
              © Copyright {year} | Lexus Industrial Enterprise Corporation. All Rights Reserved
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
