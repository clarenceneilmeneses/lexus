import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight, Check, Loader2 } from "lucide-react";
import type { Category, ContactSettings, SocialSettings } from "../../lib/types";
import { submitInquiry } from "../../lib/api";
import { Brand } from "./Header";

/* Newsletter signup — records a lightweight inquiry. Styled for the dark footer
   block. A failure used to be swallowed silently, which left the form looking
   inert; it now says so, since the visitor can't tell otherwise. */
function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setBusy(true);
    setFailed(false);
    try {
      await submitInquiry({ name: "Newsletter subscriber", email, subject: "Newsletter signup", message: "Newsletter signup from website footer." });
      setDone(true);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <p className="flex items-center gap-2 text-[14px] text-white/85">
        <Check className="w-4 h-4 shrink-0 text-ref-accent" strokeWidth={2.4} />
        Thanks — you're on the list.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="max-w-sm">
      <div className="flex items-stretch">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          aria-label="Your email address"
          className="flex-1 min-w-0 bg-white/10 border border-white/25 border-r-0 px-3.5 py-2.5 text-[14px] text-white
                     placeholder:text-white/45 outline-none transition-colors focus:border-white/60"
        />
        <button
          type="submit"
          disabled={busy}
          className="shrink-0 grid place-items-center px-4 bg-ref-accent hover:bg-ref-accentD text-white
                     transition-colors disabled:opacity-60"
          aria-label="Subscribe"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.2} /> : <ArrowRight className="w-4 h-4" strokeWidth={2.2} />}
        </button>
      </div>
      {failed && (
        <p className="flex items-start gap-1.5 text-[12.5px] text-[#ffb3a6] mt-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" strokeWidth={2} />
          Couldn't sign you up just now — please try again later.
        </p>
      )}
    </form>
  );
}

const SOCIAL: [keyof SocialSettings, string, string][] = [
  ["facebook", "Facebook", "/lexus/facebook.png"],
  ["instagram", "Instagram", "/lexus/instagram.png"],
];

const NAV: [string, string][] = [["/", "Home"], ["/products", "Products"], ["/services", "Services"], ["/about", "About"], ["/contact", "Contact"]];

/** Uppercase column heading, as on the reference footer. */
const colHead = "font-ui font-semibold text-[12.5px] uppercase tracking-[0.1em] text-white/55 mb-5";
const colLink = "block py-1.5 text-[14.5px] leading-[1.6] tracking-[0.015em] text-white/75 hover:text-white transition-colors";

export default function Footer({ contact, social = {}, categories = [] }: { contact: ContactSettings; social?: SocialSettings; categories?: Category[] }) {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full">
      {/* Solid brand block — logo + tagline, then three link columns */}
      <div className="bg-ref-band text-white">
        <div className="band pt-[50px] pb-[30px]">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
            <div>
              <Brand className="h-9" />
              <p className="copy-sm !text-white/70 mt-5 max-w-xs">
                Interior finishings &amp; building materials — trusted by builders across the Philippines since 1995.
              </p>
              <div className="flex items-center gap-2.5 mt-6">
                {SOCIAL.map(([key, label, icon]) => (
                  <a
                    key={key}
                    href={social[key] || "#"}
                    target={social[key] ? "_blank" : undefined}
                    rel="noreferrer"
                    aria-label={label}
                    className="w-9 h-9 grid place-items-center bg-white hover:opacity-80 transition-opacity"
                  >
                    <img src={icon} alt="" className="w-4 h-4 object-contain" />
                  </a>
                ))}
              </div>

              {/* News & updates — lives inside the footer block */}
              <div className="mt-7">
                <h4 className={colHead}>News &amp; updates</h4>
                <p className="copy-sm !text-white/70 -mt-3 mb-3.5 max-w-xs">
                  Sign up with your email address to receive news and updates.
                </p>
                <Newsletter />
              </div>
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
