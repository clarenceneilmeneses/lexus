import { Link, useOutletContext } from "react-router-dom";
import type { Catalog, PartnerLogo as PartnerLogoData } from "../lib/types";
import { cn, imgUrl, primaryImage } from "../lib/utils";
import ContactForm from "../components/ContactForm";

/* ------------------------------------------------------------------ assets */
const IMG = {
  facade: "/lexus/facade.jpg",
  kitchen: "/lexus/kitchen.jpg",
  dining: "/lexus/interior-dining.jpg",
  supply: "/lexus/supply.jpg",
  lamination: "/lexus/lamination.jpg",
  cnc: "/lexus/cnc.jpg",
  metalFrame: "/lexus/metal-frame.jpg",
  worldbex: "/lexus/worldbex.jpg",
};
const SERVICE_IMG = [IMG.supply, IMG.lamination, IMG.metalFrame, IMG.cnc];
const INTERIOR_IMG = [IMG.kitchen, IMG.dining, IMG.facade];

/* ------------------------------------------------------------- small parts */

/** Section kicker — mono caps with a short red rule (doubled when centered). */
function Kicker({ children, light = false, center = false }: { children: React.ReactNode; light?: boolean; center?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-3 font-mono text-[11px] tracking-[0.2em] uppercase font-bold",
        light ? "text-white/65" : "text-corp-grey"
      )}
    >
      <span className="w-7 h-px bg-flag" />
      {children}
      {center && <span className="w-7 h-px bg-flag" />}
    </span>
  );
}

function PartnerLogo({ p }: { p: PartnerLogoData }) {
  return p.image ? (
    <img src={imgUrl(p.image)!} alt={p.name} loading="lazy" className="h-9 lg:h-10 w-auto object-contain" />
  ) : (
    <span className="font-display font-semibold text-[16px] lg:text-[18px] tracking-tight whitespace-nowrap text-corp-navy/60">
      {p.name}
    </span>
  );
}

/** Small line icons for the capability list — cycled by index. */
const CAPABILITY_ICONS = [
  // layers (boards & panels)
  <path key="a" d="M12 3 2.5 8 12 13l9.5-5L12 3zM4 12l8 4.2L20 12M4 16l8 4.2L20 16" />,
  // cutting / fabrication
  <path key="b" d="M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 0 14 12M6 15a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0 0L20 3" />,
  // machine / CNC
  <path key="c" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm8.4-3a8.4 8.4 0 0 0-.16-1.62l2.1-1.64-2-3.48-2.49 1a8.42 8.42 0 0 0-2.8-1.62L14.6 2h-4l-.45 2.64a8.42 8.42 0 0 0-2.8 1.62l-2.49-1-2 3.48 2.1 1.64a8.4 8.4 0 0 0 0 3.24l-2.1 1.64 2 3.48 2.49-1a8.42 8.42 0 0 0 2.8 1.62L10.6 22h4l.45-2.64a8.42 8.42 0 0 0 2.8-1.62l2.49 1 2-3.48-2.1-1.64c.1-.53.16-1.07.16-1.62z" />,
  // delivery / supply
  <path key="d" d="M1 5h13v11H1zM14 9h4l4 4v3h-8M6.5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm11 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />,
  // shield / quality
  <path key="e" d="M12 2 4 5.5V11c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5.5L12 2zm-3 10 2.2 2.2L15.5 10" />,
  // building
  <path key="f" d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M16 9h3a1 1 0 0 1 1 1v11M2 21h20M8 7h2M8 11h2M8 15h2M12 7h1M12 11h1M12 15h1" />,
];

export default function Home() {
  const { catalog } = useOutletContext<{ catalog: Catalog }>();
  const { settings, categories, products } = catalog;
  const { hero, services, about, contact, interiors, credentials, testimonials, partners } = settings;

  const featured = products.filter((p) => p.is_featured);
  const lineup = (featured.length ? featured : products).slice(0, 6);
  const categoryName = (id: string | null) => categories.find((c) => c.id === id)?.name;
  const branches = contact.branches?.length
    ? contact.branches
    : [{ city: "Metro Manila", address: contact.address, phone: contact.phone, email: contact.email }];

  return (
    <div className="bg-white">
      {/* ============================ HERO — full-width image, left overlay ============================ */}
      <section className="relative bg-corp-navy overflow-hidden">
        <img
          src={IMG.facade}
          alt="Lexus Industrial facility"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-corp-navyD/95 via-corp-navy/70 to-corp-navy/20" />
        <div className="wrap relative py-20 lg:py-28 min-h-[400px] lg:min-h-[480px] flex items-center">
          <div className="max-w-xl">
            <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-white/70 font-bold">
              {hero.eyebrow || "Interior finishings & building materials"}
            </span>
            <h1 className="font-display font-bold text-[clamp(30px,4.5vw,46px)] leading-[1.1] tracking-tight text-white mt-3">
              {hero.title}
            </h1>
            {hero.subtitle && (
              <p className="text-[15px] lg:text-[16px] text-white/85 mt-4 leading-relaxed max-w-lg">{hero.subtitle}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 mt-7">
              <a href="#contact" className="btn bg-flag text-white hover:bg-[#C93B24]">
                Request a quote
              </a>
              <Link to="/products" className="btn border-[1.5px] border-white/50 text-white hover:bg-white hover:text-corp-navy">
                {hero.cta_label || "Browse products"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ TRUSTED BY — static partner strip ============================ */}
      {partners.items.length > 0 && (
        <section className="bg-white border-b border-line">
          <div className="wrap py-10 lg:py-12 text-center reveal">
            <Kicker center>{partners.eyebrow || "Our partners"}</Kicker>
            <h2 className="font-display font-bold text-[clamp(20px,2.4vw,28px)] tracking-tight text-corp-navy mt-2">
              {partners.title || "Trusted by clients"}
            </h2>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
              {partners.items.map((p, i) => (
                <PartnerLogo key={i} p={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================ SERVICES — one-stop solutions tile grid ============================ */}
      <section id="services" className="bg-corp-navy scroll-mt-20">
        <div className="wrap py-12 lg:py-16">
          <div className="text-center mb-8 reveal">
            <Kicker light center>
              What we do
            </Kicker>
            <h2 className="font-display font-bold text-[clamp(22px,3vw,32px)] tracking-tight text-white mt-2">
              {services.title || "One-stop solutions"}
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {services.items.slice(0, 8).map((it, i) => (
              <Link
                key={i}
                to="/services"
                className="group relative block overflow-hidden rounded aspect-[4/5] bg-corp-navyD"
              >
                <img
                  src={imgUrl(it.image) || SERVICE_IMG[i % SERVICE_IMG.length]}
                  alt={it.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 motion-reduce:transition-none group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute left-4 right-4 bottom-4">
                  <span className="block w-6 h-[2px] bg-flag mb-2" />
                  <h3 className="font-display font-semibold text-[15px] lg:text-[16px] text-white leading-snug">{it.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ ABOUT — values / capability split ============================ */}
      <section className="bg-white">
        <div className="wrap py-12 lg:py-16 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div className="reveal">
            <Kicker>Who we are</Kicker>
            <h2 className="font-display font-bold text-[clamp(22px,3vw,32px)] tracking-tight text-corp-navy mt-2">
              {about.title}
            </h2>
            <div className="mt-4 space-y-3.5">
              {about.body.split(/\n\s*\n/).map((para, i) => (
                <p key={i} className="text-[15px] text-corp-grey leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
            <Link to="/about" className="btn btn-corp btn-sm mt-6">
              Learn more about us
            </Link>
            {about.stats.length > 0 && (
              <div className="grid grid-cols-3 gap-4 border-t border-line pt-5 mt-7">
                {about.stats.slice(0, 3).map((s, i) => (
                  <div key={i}>
                    <div className="font-display font-bold text-corp-navy text-[22px] lg:text-[26px]">{s.value}</div>
                    <div className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-corp-grey mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="reveal relative overflow-hidden rounded aspect-[4/3] bg-corp-navy">
            <img
              src={IMG.supply}
              alt="Lexus Industrial materials supply"
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ============================ FEATURED PRODUCTS ============================ */}
      <section id="products" className="bg-white border-t border-line scroll-mt-20">
        <div className="wrap py-12 lg:py-16">
          <div className="text-center mb-8 reveal">
            <Kicker center>Our catalog</Kicker>
            <h2 className="font-display font-bold text-[clamp(22px,3vw,32px)] tracking-tight text-corp-navy mt-2">
              Featured products
            </h2>
            <p className="text-[14.5px] text-corp-grey mt-2 max-w-xl mx-auto">
              A selection from our current catalog of boards, panels, and finishing materials.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lineup.map((p) => (
              <Link
                key={p.id}
                to={`/products/${p.slug}`}
                className="group bg-white border border-line rounded overflow-hidden hover:shadow-card hover:border-corp-navy/30 transition-all motion-reduce:transition-none"
              >
                <div className="aspect-[4/3] overflow-hidden bg-corp-bg">
                  <img
                    src={primaryImage(p)}
                    alt={p.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 motion-reduce:transition-none group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-4">
                  <div className="font-mono text-[10.5px] tracking-[0.12em] uppercase text-corp-grey">
                    {p.brand || categoryName(p.category_id) || "Lexus Industrial"}
                  </div>
                  <h3 className="font-display font-semibold text-[15.5px] text-corp-navy tracking-tight mt-1 leading-snug line-clamp-2">
                    {p.name}
                  </h3>
                  <span className="inline-block font-display font-semibold text-[13px] text-flag mt-2">
                    View product ›
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex justify-center mt-8 reveal">
            <Link to="/products" className="btn btn-corp-outline">
              View all products
            </Link>
          </div>

          {categories.length > 0 && (
            <div className="border-t border-line mt-10 pt-6 flex flex-wrap items-center justify-center gap-2 reveal">
              <span className="font-mono text-[11px] tracking-[0.12em] uppercase text-corp-grey mr-1">
                Browse by category:
              </span>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  to={`/products?cat=${c.slug}`}
                  className="font-display font-semibold text-[12.5px] text-corp-navy border border-line rounded px-2.5 py-1 hover:border-corp-navy hover:bg-corp-soft transition-colors motion-reduce:transition-none"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============================ WHY LEXUS — capability list ============================ */}
      <section className="bg-corp-bg border-t border-line">
        <div className="wrap py-12 lg:py-16">
          <div className="text-center mb-8 reveal">
            <Kicker center>The Lexus edge</Kicker>
            <h2 className="font-display font-bold text-[clamp(22px,3vw,32px)] tracking-tight text-corp-navy mt-2">
              Why Lexus Industrial
            </h2>
            <p className="text-[14.5px] text-corp-grey mt-2 max-w-xl mx-auto">
              Materials, fabrication, and service handled under one roof.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 lg:gap-4 max-w-4xl mx-auto">
            {services.items.slice(0, 8).map((it, i) => (
              <div key={i} className="flex items-start gap-4 bg-white border border-line rounded p-5">
                <span className="w-10 h-10 shrink-0 grid place-items-center rounded bg-corp-soft text-corp-navy">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5"
                  >
                    {CAPABILITY_ICONS[i % CAPABILITY_ICONS.length]}
                  </svg>
                </span>
                <div>
                  <h3 className="font-display font-semibold text-[15.5px] text-corp-navy tracking-tight">{it.title}</h3>
                  <p className="text-[13.5px] text-corp-grey leading-relaxed mt-1 line-clamp-2">{it.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ INTERIORS — application showcase ============================ */}
      <section className="bg-white border-t border-line">
        <div className="wrap py-12 lg:py-16">
          <div className="flex items-end justify-between gap-5 flex-wrap mb-7 reveal">
            <div className="max-w-xl">
              <Kicker>{interiors.eyebrow}</Kicker>
              <h2 className="font-display font-bold text-[clamp(22px,3vw,32px)] tracking-tight text-corp-navy mt-2">
                {interiors.title}
              </h2>
              {interiors.subtitle && <p className="text-[14.5px] text-corp-grey mt-2">{interiors.subtitle}</p>}
            </div>
            <Link to="/services" className="font-display font-semibold text-[14px] text-corp-navy hover:text-flag transition-colors motion-reduce:transition-none">
              Explore our services ›
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            {interiors.items.slice(0, 6).map((it, i) => (
              <div key={i} className="group relative overflow-hidden rounded aspect-[4/3] bg-corp-navy">
                <img
                  src={imgUrl(it.image) || INTERIOR_IMG[i % INTERIOR_IMG.length]}
                  alt={it.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 motion-reduce:transition-none group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                <div className="absolute left-4 right-4 bottom-4">
                  <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-white/70">{it.eyebrow}</span>
                  <div className="font-display font-semibold text-[16px] text-white tracking-tight">{it.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ CREDENTIALS — industry presence ============================ */}
      <section id="credentials" className="bg-corp-bg border-t border-line scroll-mt-20">
        <div className="wrap py-12 lg:py-16 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div className="reveal relative overflow-hidden rounded border border-line bg-white">
            <img
              src={imgUrl(credentials.image) || IMG.worldbex}
              alt={credentials.caption || credentials.title}
              loading="lazy"
              className="w-full h-auto object-cover"
            />
          </div>
          <div className="reveal">
            <Kicker>{credentials.eyebrow}</Kicker>
            <h2 className="font-display font-bold text-[clamp(22px,3vw,32px)] tracking-tight text-corp-navy mt-2">
              {credentials.title}
            </h2>
            {credentials.body && <p className="text-[15px] text-corp-grey mt-4 leading-relaxed">{credentials.body}</p>}
            {credentials.stats.length > 0 && (
              <div className="grid grid-cols-3 gap-4 border-t border-line pt-5 mt-6">
                {credentials.stats.slice(0, 3).map((st, i) => (
                  <div key={i}>
                    <div className="font-display font-bold text-corp-navy text-[22px]">{st.value}</div>
                    <div className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-corp-grey mt-1">{st.label}</div>
                  </div>
                ))}
              </div>
            )}
            {credentials.caption && (
              <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-corp-grey mt-5">{credentials.caption}</p>
            )}
          </div>
        </div>
      </section>

      {/* ============================ TESTIMONIALS — modest static cards ============================ */}
      {testimonials.items.length > 0 && (
        <section className="bg-white border-t border-line">
          <div className="wrap py-12 lg:py-16">
            <div className="text-center mb-8 reveal">
              <Kicker center>{testimonials.eyebrow}</Kicker>
              <h2 className="font-display font-bold text-[clamp(22px,3vw,32px)] tracking-tight text-corp-navy mt-2">
                {testimonials.title}
              </h2>
            </div>
            <div className={cn("grid gap-4", testimonials.items.length > 1 && "md:grid-cols-2", testimonials.items.length > 2 && "lg:grid-cols-3")}>
              {testimonials.items.map((t, i) => (
                <figure key={i} className="bg-corp-bg border border-line rounded p-5 lg:p-6 flex flex-col">
                  <blockquote className="text-[14.5px] text-corp-grey leading-relaxed flex-1">"{t.quote}"</blockquote>
                  <figcaption className="mt-4 pt-4 border-t border-line">
                    <div className="font-display font-semibold text-[14.5px] text-corp-navy">{t.author}</div>
                    {t.role && (
                      <div className="font-mono text-[10.5px] tracking-[0.12em] uppercase text-corp-grey mt-0.5">{t.role}</div>
                    )}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================ CONTACT — details + form ============================ */}
      <section id="contact" className="bg-corp-bg border-t border-line scroll-mt-24">
        <div className="wrap py-12 lg:py-16">
          <div className="text-center mb-8 reveal">
            <Kicker center>Get in touch</Kicker>
            <h2 className="font-display font-bold text-[clamp(22px,3vw,32px)] tracking-tight text-corp-navy mt-2">
              Contact us
            </h2>
            <p className="text-[14.5px] text-corp-grey mt-2 max-w-xl mx-auto">
              Tell us what you need — we'll respond with availability and pricing, including hard-to-find finishes.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] items-start">
            <div className="space-y-6">
              {branches.map((b, i) => (
                <div key={i}>
                  <h3 className="font-display font-bold text-[16px] text-corp-navy tracking-tight flex items-center gap-2.5">
                    <span className="w-5 h-[2px] bg-flag" />
                    {b.city}
                  </h3>
                  <div className="mt-3 space-y-2.5 text-[14px]">
                    <div className="flex items-start gap-2.5 text-corp-grey">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0 mt-0.5 text-corp-navy">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span className="leading-relaxed">{b.address}</span>
                    </div>
                    {b.phone && (
                      <div className="flex items-center gap-2.5 text-corp-grey">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0 text-corp-navy">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        {b.phone}
                      </div>
                    )}
                    {b.email && (
                      <a href={`mailto:${b.email}`} className="flex items-center gap-2.5 text-corp-navy hover:text-flag break-all transition-colors motion-reduce:transition-none">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                        {b.email}
                      </a>
                    )}
                  </div>
                </div>
              ))}

              {contact.hours && (
                <div className="border-t border-line pt-5">
                  <h3 className="font-mono text-[11px] tracking-[0.14em] uppercase text-corp-grey">Business hours</h3>
                  <p className="text-[14px] text-corp-navy mt-1.5">{contact.hours}</p>
                </div>
              )}
            </div>

            <ContactForm contactEmail={contact.email} />
          </div>
        </div>
      </section>
    </div>
  );
}
