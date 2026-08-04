import { useRef, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Volume2, VolumeX } from "lucide-react";
import type { Catalog, Category, PartnerLogo as PartnerLogoData } from "../lib/types";
import { imgUrl, primaryImage, placeholder } from "../lib/utils";
import { useSeo, useJsonLd, organizationSchema } from "../lib/seo";
import ContactForm from "../components/ContactForm";
import { useHomeMotion } from "../hooks/useHomeMotion";

/** Renders a CMS stat value like "29+" or "1,200 m²" with the numeric part
 *  tagged for the GSAP count-up; non-numeric values pass through untouched. */
function CountValue({ value }: { value: string }) {
  const m = /^([\d,]+(?:\.\d+)?)(.*)$/.exec(value.trim());
  if (!m) return <>{value}</>;
  const n = parseFloat(m[1].replace(/,/g, ""));
  if (!isFinite(n)) return <>{value}</>;
  return (
    <>
      <span data-count={n}>{m[1]}</span>
      {m[2]}
    </>
  );
}

function PartnerLogo({ p }: { p: PartnerLogoData }) {
  return p.image ? (
    <img
      src={imgUrl(p.image)!}
      alt={p.name}
      loading="lazy"
      className="h-10 lg:h-12 w-auto object-contain grayscale opacity-55 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
    />
  ) : (
    <span className="font-display font-semibold text-[17px] lg:text-[20px] tracking-[-0.02em] whitespace-nowrap text-ref-ink/40 hover:text-ref-ink transition-colors">
      {p.name}
    </span>
  );
}

/** Splits a list into rows of three whose trailing remainder spreads to fill
 *  its own row — the reference's 1/3·1/3·1/3 + 1/2·1/2 card rhythm. A group of
 *  four balances to 2+2 rather than leaving one card stranded at full width
 *  (so 4 → 2+2, 5 → 3+2, 7 → 3+2+2). `--cols` feeds `.row-cols` (index.css). */
function cardRows<T>(items: T[]): T[][] {
  const rows: T[][] = [];
  let rest = items;
  while (rest.length > 4) {
    rows.push(rest.slice(0, 3));
    rest = rest.slice(3);
  }
  if (rest.length === 4) rows.push(rest.slice(0, 2), rest.slice(2));
  else if (rest.length) rows.push(rest);
  return rows;
}

/* ------------------------------------------------------------------ assets */
const LEXUS_VIDEO =
  "https://video.wixstatic.com/video/e7f486_6ec33912679b47a6bd986d5d3a57de95/1080p/mp4/file.mp4";

// Respect reduced-motion: skip autoplay and let the poster stand in.
const REDUCED_MOTION =
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const IMG = {
  facade: "/lexus/facade.jpg",
  kitchen: "/lexus/kitchen.jpg",
  dining: "/lexus/interior-dining.jpg",
  supply: "/lexus/supply.jpg",
  lamination: "/lexus/lamination.jpg",
  cnc: "/lexus/cnc.jpg",
  metalCut: "/lexus/metal-cut.jpg",
  metalFrame: "/lexus/metal-frame.jpg",
  worldbex: "/lexus/worldbex.jpg",
};
const INTERIOR_IMG = [IMG.kitchen, IMG.dining, IMG.facade];

/** Faint diagonal hatch behind the story band — stands in for the reference's
 *  SVG pattern overlay without shipping another asset. */
const HATCH =
  "url(\"data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cpath d='M0 80 80 0M-20 60 60-20M20 100 100 20' stroke='%23232c6d' stroke-opacity='.045' stroke-width='1.5' fill='none'/%3E%3C/svg%3E\")";

export default function Home() {
  const { catalog } = useOutletContext<{ catalog: Catalog }>();
  const { settings, categories, products } = catalog;
  const { hero, services, about, contact, interiors, credentials, testimonials, partners } = settings;
  // Aliased: `featured` below is the product list, and `categories` is the catalog's.
  const { featured: featuredBlock, category_section: categoryBlock } = settings;

  // Home carries the site-wide title/description straight from Site settings.
  useSeo({ path: "/", image: imgUrl(credentials.image) ?? "/lexus/facade.jpg" }, settings);
  useJsonLd("organization", organizationSchema(catalog));

  const rootRef = useRef<HTMLDivElement>(null);
  useHomeMotion(rootRef);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    if (!v.muted) v.play().catch(() => {});
    setMuted(v.muted);
  };

  const featured = products.filter((p) => p.is_featured);
  const lineup = (featured.length ? featured : products).slice(0, 10);
  // image for each category tile: uploaded hero image → first product photo → branded placeholder
  const categoryImage = (c: Category) => {
    if (c.image_path) return imgUrl(c.image_path)!;
    const p = products.find((pr) => pr.category_id === c.id && pr.images?.length);
    return p ? primaryImage(p) : placeholder(c.name);
  };
  const topCategories = categories.slice(0, 8);
  const branches = contact.branches?.length
    ? contact.branches
    : [{ city: "Metro Manila", address: contact.address, phone: contact.phone, email: contact.email }];

  const serviceRows = cardRows(services.items);
  const interiorRows = cardRows(interiors.items);

  return (
    <div ref={rootRef} className="bg-white">
      {/* ============================ HERO — full-bleed banner ============================ */}
      <section id="top" className="relative bg-ref-band overflow-hidden">
        <video
          ref={videoRef}
          className="hero-media absolute inset-0 w-full h-full object-cover scale-[1.06]"
          src={hero.video_url?.trim() || LEXUS_VIDEO}
          poster={IMG.facade}
          autoPlay={!REDUCED_MOTION}
          muted
          loop
          playsInline
          preload="metadata"
        />
        {/* Brand-navy wash + vertical scrim so the serif title always reads. */}
        <div className="absolute inset-0 bg-ref-band/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/35" />

        <div className="band relative text-center text-white py-[110px] lg:py-[170px] min-h-[520px] lg:min-h-[700px] flex flex-col items-center justify-center">
          <span className="hero-eyebrow eyebrow-rule center on-dark">
            {hero.eyebrow || "Interior finishings & building materials · Since 1995"}
          </span>
          <h1 className="hero-title h-hero mt-6 max-w-4xl">{hero.title}</h1>
          {hero.subtitle && (
            <p className="hero-sub copy !text-white/85 max-w-2xl mt-5">{hero.subtitle}</p>
          )}
          <div className="hero-ctas flex flex-wrap items-center justify-center gap-3 mt-9">
            <a href="#contact" className="btn-ref-accent">Request a quote</a>
            <a href="#services" className="btn-ref-ghost">{hero.cta_label || "Explore our work"}</a>
          </div>
        </div>

        <button
          onClick={toggleMute}
          aria-label={muted ? "Unmute video" : "Mute video"}
          className="absolute right-5 bottom-5 w-11 h-11 grid place-items-center bg-black/30 hover:bg-black/50 border border-white/25 text-white transition-colors"
        >
          {muted
            ? <VolumeX className="w-[18px] h-[18px]" strokeWidth={1.8} />
            : <Volume2 className="w-[18px] h-[18px]" strokeWidth={1.8} />}
        </button>
      </section>

      {/* ============================ TRUSTED BY CLIENTS — logo wall ============================ */}
      {partners.items.length > 0 && (
        <section className="sec bg-white">
          <div className="band text-center reveal">
            <span className="eyebrow-rule center">{partners.eyebrow}</span>
            <h2 className="h-sec text-ref-ink mt-4">{partners.title}</h2>
          </div>
          <div className="mt-10 lg:mt-12">
            {partners.items.length >= 4 ? (
              /* infinite marquee — two identical halves, CSS keyframe shifts -50% */
              <div className="reveal fade-x overflow-hidden">
                <div className="marquee-track flex w-max animate-marquee">
                  {[0, 1].map((half) => (
                    <div key={half} aria-hidden={half === 1} className="flex items-center gap-x-14 lg:gap-x-20 pr-14 lg:pr-20">
                      {partners.items.map((p, i) => <PartnerLogo key={i} p={p} />)}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="band reveal flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
                {partners.items.map((p, i) => <PartnerLogo key={i} p={p} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ============ ONE-STOP SOLUTIONS — navy band with cards pulled up over it ============ */}
      <section id="services" className="bg-ref-band pt-[52px] pb-[52px] lg:pt-[70px] lg:pb-[170px] scroll-mt-20">
        <div className="band text-center">
          <span className="eyebrow-rule center on-dark">{services.eyebrow}</span>
          <h2 className="h-sec text-white mt-4">{services.title || "One-Stop Solutions Provider"}</h2>
          {services.subtitle && (
            <p className="copy !text-white/70 max-w-2xl mx-auto mt-5">{services.subtitle}</p>
          )}
        </div>
      </section>
      {/* `flow-root` is load-bearing: without a block formatting context the
          card row's negative top margin collapses into this wrapper and drags
          the white background up over the navy band instead of just the cards. */}
      <div className="bg-white flow-root">
        {/* Pulled up so the cards straddle the navy band above (reference: -220px
            over 170px of band padding). Mobile stacks with no overlap. */}
        <div className="band-cards relative z-[7] lg:-mt-[220px] pt-[52px] lg:pt-[70px] pb-[52px] lg:pb-[70px] space-y-5">
          {serviceRows.map((row, r) => (
            <div
              key={r}
              className={`row-cols stagger-grid${row.length === 1 ? " max-w-[400px] mx-auto" : ""}`}
              style={{ "--cols": row.length } as React.CSSProperties}
            >
              {row.map((it, i) => {
                const idx = serviceRows.slice(0, r).reduce((n, x) => n + x.length, 0) + i;
                // Same treatment as a product with no photo: the generated
                // brand placeholder, not a blurry stock stand-in.
                // No code line — the caption below already carries the number.
                const photo = imgUrl(it.image) || placeholder(it.title);

                return (
                  <article key={idx} className="dany aspect-[3/4]">
                    <img src={photo} alt={it.title} loading="lazy" />
                    <div className="dany-scrim" />
                    <div className="dany-cap">
                      <div className="dany-cap-title">
                        <span className="font-ui font-semibold text-[12.5px] uppercase tracking-[0.1em] text-white/60">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <h3 className="h-card text-white mt-2">{it.title}</h3>
                      </div>
                      <p className="dany-cap-text">{it.body}</p>
                    </div>
                    {/* the whole card is a link, but the caption must not eat clicks */}
                    <Link to="/services" className="absolute inset-0" aria-label={it.title} />
                  </article>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ============================ GUIDED BY VALUES — story + stats ============================ */}
      {about.body && (
        <section className="sec bg-ref-off relative" style={{ backgroundImage: HATCH }}>
          <div className="band relative grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div className="reveal">
              <span className="eyebrow-rule start">{about.eyebrow}</span>
              <h2 className="h-sec text-ref-ink mt-4">{about.title || "Guided by Values. Powered by Purpose."}</h2>
              <Link to="/about" className="btn-ref-out mt-8">Learn more</Link>
            </div>
            <div>
              <div className="story-body space-y-5">
                {about.body.split(/\n\s*\n/).map((para, i) => (
                  <p key={i} className="copy">{para}</p>
                ))}
              </div>
              {about.stats.length > 0 && (
                <div className="mt-10 grid grid-cols-3 gap-5 border-t border-ref-hair pt-7">
                  {about.stats.slice(0, 3).map((s, i) => (
                    <div key={i}>
                      <div className="num text-[clamp(24px,2.8vw,32px)] leading-none text-ref-band">
                        <CountValue value={s.value} />
                      </div>
                      <div className="font-ui font-semibold text-[12px] uppercase tracking-[0.09em] text-ref-body mt-2.5">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ============================ FEATURED PRODUCTS — carousel ============================ */}
      <section id="products" className="sec bg-white border-t border-ref-hair scroll-mt-20">
        <div className="band text-center reveal">
          <span className="eyebrow-rule center">{featuredBlock.eyebrow}</span>
          <h2 className="h-sec text-ref-ink mt-4">{featuredBlock.title}</h2>
          {featuredBlock.subtitle && (
            <p className="copy max-w-2xl mx-auto mt-5">{featuredBlock.subtitle}</p>
          )}
        </div>

        {/* Infinite marquee — two identical halves, CSS keyframe shifts -50%.
            Hovering pauses it so a card can actually be clicked. Duration
            scales with the card count to hold a steady pixel speed. */}
        <div className="marquee-scroll mt-10 lg:mt-12 fade-x overflow-hidden">
          <div
            className="marquee-track flex w-max animate-marquee"
            style={{ animationDuration: `${Math.max(30, lineup.length * 6)}s` }}
          >
            {[0, 1].map((half) => (
              <div key={half} aria-hidden={half === 1} className="flex gap-5 pr-5">
                {lineup.map((p) => (
                  <Link
                    key={p.id}
                    to={`/products/${p.slug}`}
                    tabIndex={half === 1 ? -1 : undefined}
                    className="group shrink-0 w-[280px] border border-ref-hair bg-white hover:border-ref-band transition-colors"
                  >
                    <div className="aspect-[3/4] overflow-hidden bg-ref-grey">
                      <img
                        src={primaryImage(p)}
                        alt={p.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6">
                      <div className="font-ui font-semibold text-[12px] uppercase tracking-[0.1em] text-ref-accent">
                        {p.brand || "Lexus"}
                      </div>
                      <h3 className="h-card text-ref-ink mt-2 line-clamp-2">{p.name}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="band flex justify-center mt-10 reveal">
          <Link to="/products" className="link-ref">Explore the full catalog</Link>
        </div>
      </section>

      {/* ============================ SHOP BY CATEGORY ============================ */}
      <section id="categories" className="sec bg-ref-off scroll-mt-20">
        <div className="band text-center reveal">
          <span className="eyebrow-rule center">{categoryBlock.eyebrow}</span>
          <h2 className="h-sec text-ref-ink mt-4">{categoryBlock.title}</h2>
          {categoryBlock.subtitle && (
            <p className="copy max-w-2xl mx-auto mt-5">{categoryBlock.subtitle}</p>
          )}
        </div>
        <div className="band-cards mt-10 lg:mt-12">
          <div className="stagger-grid grid grid-cols-2 lg:grid-cols-4 gap-5">
            {topCategories.map((c) => (
              <Link key={c.id} to={`/products?cat=${c.slug}`} className="dany aspect-[3/4]">
                <img src={categoryImage(c)} alt={c.name} loading="lazy" />
                <div className="dany-scrim" />
                <div className="dany-cap">
                  <div className="dany-cap-title">
                    <h3 className="h-card text-white">{c.name}</h3>
                  </div>
                  {c.description && <p className="dany-cap-text line-clamp-3">{c.description}</p>}
                </div>
              </Link>
            ))}
          </div>
          <div className="flex justify-center mt-10 reveal">
            <Link to="/products" className="link-ref">View all categories</Link>
          </div>
        </div>
      </section>

      {/* ============================ FEATURED PROJECTS — interiors ============================ */}
      {interiors.items.length > 0 && (
        <section id="interiors" className="sec bg-white scroll-mt-20">
          <div className="band text-center reveal">
            <span className="eyebrow-rule center">{interiors.eyebrow}</span>
            <h2 className="h-sec text-ref-ink mt-4">{interiors.title}</h2>
            {interiors.subtitle && <p className="copy max-w-2xl mx-auto mt-5">{interiors.subtitle}</p>}
          </div>
          <div className="band-cards mt-10 lg:mt-12 space-y-5">
            {interiorRows.map((row, r) => (
              <div
                key={r}
                className={`row-cols stagger-grid${row.length === 1 ? " max-w-[520px] mx-auto" : ""}`}
                style={{ "--cols": row.length } as React.CSSProperties}
              >
                {row.map((it, i) => {
                  const idx = interiorRows.slice(0, r).reduce((n, x) => n + x.length, 0) + i;
                  return (
                    <figure key={idx} className="group relative overflow-hidden bg-ref-band aspect-[4/3]">
                      <img
                        src={imgUrl(it.image) || INTERIOR_IMG[idx % INTERIOR_IMG.length]}
                        alt={it.title}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-[1.04] transition-all duration-500"
                      />
                      <div className="dany-scrim" />
                      <figcaption className="absolute left-6 right-6 bottom-6 text-white">
                        <span className="font-ui font-semibold text-[12px] uppercase tracking-[0.1em] text-white/65">
                          {it.eyebrow}
                        </span>
                        <div className="h-card mt-1.5">{it.title}</div>
                      </figcaption>
                    </figure>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="band flex justify-center mt-10 reveal">
            <Link to="/services" className="link-ref">Explore our services</Link>
          </div>
        </section>
      )}

      {/* ============================ CREDENTIALS — WORLDBEX trust band ============================ */}
      <section id="credentials" className="sec bg-ref-grey scroll-mt-20">
        <div className="band-cards">
          <div className="reveal grid lg:grid-cols-2 items-stretch bg-white border border-ref-hair">
            <div className="bg-ref-off flex items-center justify-center p-6 lg:p-10">
              <img
                src={imgUrl(credentials.image) || IMG.worldbex}
                alt={credentials.caption || credentials.title}
                loading="lazy"
                className="w-full max-w-[460px] h-auto object-contain"
              />
            </div>
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <span className="eyebrow-rule start">{credentials.eyebrow}</span>
              <h2 className="h-sec text-ref-ink mt-4">{credentials.title}</h2>
              {credentials.body && <p className="copy mt-5">{credentials.body}</p>}
              {credentials.stats.length > 0 && (
                <div className="mt-8 grid grid-cols-3 gap-5 border-t border-ref-hair pt-6">
                  {credentials.stats.slice(0, 3).map((st, i) => (
                    <div key={i}>
                      <div className="num text-[clamp(20px,2.2vw,26px)] leading-none text-ref-band">
                        <CountValue value={st.value} />
                      </div>
                      <div className="font-ui font-semibold text-[11.5px] uppercase tracking-[0.09em] text-ref-body mt-2.5">
                        {st.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {credentials.caption && (
                <p className="font-ui text-[12.5px] uppercase tracking-[0.09em] text-ref-body/70 mt-7">
                  {credentials.caption}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============================ TESTIMONIALS — navy quote band ============================ */}
      {testimonials.items.length > 0 && (
        <section className="sec bg-ref-band">
          <div className="band text-center reveal">
            <span className="eyebrow-rule center on-dark">{testimonials.eyebrow}</span>
            <h2 className="h-sec text-white mt-4">{testimonials.title}</h2>
          </div>

          <div className="band-cards mt-10 lg:mt-12">
            {testimonials.items.length === 1 ? (
              <figure className="reveal max-w-3xl mx-auto text-center">
                <blockquote className="font-display font-medium text-[clamp(20px,2.6vw,29px)] leading-[1.3] tracking-[-0.022em] text-white">
                  “{testimonials.items[0].quote}”
                </blockquote>
                <figcaption className="mt-8">
                  <div className="font-ui font-semibold text-[15px] text-white">{testimonials.items[0].author}</div>
                  {testimonials.items[0].role && (
                    <div className="font-ui text-[12px] uppercase tracking-[0.1em] text-white/55 mt-1.5">
                      {testimonials.items[0].role}
                    </div>
                  )}
                </figcaption>
              </figure>
            ) : (
              <div className="stagger-grid grid gap-5 md:grid-cols-2">
                {testimonials.items.map((t, i) => (
                  <figure key={i} className="border border-white/15 p-8 lg:p-10 flex flex-col">
                    <blockquote className="font-display font-medium text-[clamp(17px,1.8vw,21px)] leading-[1.4] tracking-[-0.018em] text-white/90 flex-1">
                      “{t.quote}”
                    </blockquote>
                    <figcaption className="mt-7 pt-5 border-t border-white/15">
                      <div className="font-ui font-semibold text-[15px] text-white">{t.author}</div>
                      {t.role && (
                        <div className="font-ui text-[12px] uppercase tracking-[0.1em] text-white/55 mt-1.5">{t.role}</div>
                      )}
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ============================ CONTACT — form + branches ============================ */}
      <section id="contact" className="sec bg-white scroll-mt-20">
        <div className="band text-center reveal">
          <span className="eyebrow-rule center">{contact.eyebrow}</span>
          <h2 className="h-sec text-ref-ink mt-4">{contact.title}</h2>
          {contact.subtitle && <p className="copy max-w-2xl mx-auto mt-5">{contact.subtitle}</p>}
        </div>

        <div className="band-cards mt-10 lg:mt-12">
          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] items-start reveal">
            <div className="space-y-5">
              <div className="relative overflow-hidden bg-ref-band aspect-[16/10]">
                <img
                  src={imgUrl(contact.image) || IMG.dining}
                  alt={contact.image_caption || "Interior finished with Lexus materials"}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover opacity-85"
                />
                <div className="dany-scrim" />
                <div className="absolute left-6 right-6 bottom-6 text-white">
                  {contact.image_eyebrow && (
                    <span className="font-ui font-semibold text-[12px] uppercase tracking-[0.1em] text-white/65">
                      {contact.image_eyebrow}
                    </span>
                  )}
                  {contact.image_caption && (
                    <p className="copy-sm !text-white/85 mt-1.5">{contact.image_caption}</p>
                  )}
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
                {branches.map((b, i) => (
                  <div key={i} className="border border-ref-hair p-6">
                    <h3 className="h-card text-ref-ink">{b.city}</h3>
                    <p className="copy-sm mt-2">{b.address}</p>
                    <div className="mt-3 space-y-1.5">
                      {b.phone && <div className="copy-sm">{b.phone}</div>}
                      {b.email && (
                        <a href={`mailto:${b.email}`} className="link-ref !text-[14.5px] break-all">{b.email}</a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <ContactForm contactEmail={contact.email} />
          </div>
        </div>
      </section>
    </div>
  );
}
