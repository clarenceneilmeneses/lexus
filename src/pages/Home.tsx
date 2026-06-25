import { useRef, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import type { Catalog } from "../lib/types";
import { primaryImage } from "../lib/utils";
import CategoryIcon from "../components/CategoryIcon";
import ContactForm from "../components/ContactForm";
import SectionNav, { type Section } from "../components/SectionNav";

const SECTIONS: Section[] = [
  { id: "top", label: "Home" },
  { id: "services", label: "Services" },
  { id: "products", label: "Products" },
  { id: "categories", label: "Categories" },
  { id: "interiors", label: "Interiors" },
  { id: "credentials", label: "Credentials" },
  { id: "contact", label: "Contact" },
];

/* ------------------------------------------------------------------ assets */
const LEXUS_VIDEO =
  "https://video.wixstatic.com/video/e7f486_6ec33912679b47a6bd986d5d3a57de95/1080p/mp4/file.mp4";

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
const SERVICE_IMG = [IMG.supply, IMG.lamination, IMG.metalFrame, IMG.cnc];

export default function Home() {
  const { catalog } = useOutletContext<{ catalog: Catalog }>();
  const { settings, categories, products } = catalog;
  const { hero, services, about, contact } = settings;

  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    if (!v.muted) v.play().catch(() => {});
    setMuted(v.muted);
  };
  const goFullscreen = () => {
    const v = videoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (!v) return;
    if (v.requestFullscreen) v.requestFullscreen().catch(() => {});
    else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen();
  };

  const featured = products.filter((p) => p.is_featured);
  const lineup = (featured.length ? featured : products).slice(0, 10);
  const branches = contact.branches?.length
    ? contact.branches
    : [{ city: "Metro Manila", address: contact.address, phone: contact.phone, email: contact.email }];

  return (
    <div className="bg-corp-bg">
      <SectionNav sections={SECTIONS} />

      {/* ============================ HERO — full-bleed video ============================ */}
      <section id="top" className="relative h-[96vh] min-h-[680px] w-full overflow-hidden bg-black text-white">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          src={LEXUS_VIDEO}
          poster={IMG.facade}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
        {/* darker on the left for left-aligned copy */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/30" />

        {/* column: nav offset → left copy (flex-1) → stats strip in flow */}
        <div className="relative h-full wrap flex flex-col">
          <div className="flex-1 flex flex-col items-start justify-center text-left pt-24 pb-10 max-w-3xl">
            <span className="font-mono text-[12px] tracking-[0.22em] uppercase text-white/70">
              {hero.eyebrow || "Interior finishings & building materials · Since 1995"}
            </span>
            <h1 className="text-[clamp(38px,6.6vw,82px)] font-semibold tracking-[-0.02em] leading-[1.03] mt-5">
              {hero.title}
            </h1>
            <p className="text-[clamp(16px,2.1vw,22px)] text-white/85 mt-5 max-w-xl leading-relaxed">{hero.subtitle}</p>
            <div className="flex items-center gap-5 mt-9 flex-wrap">
              <Link to="/products" className="inline-flex items-center justify-center font-display font-semibold text-[15px] rounded-full px-7 py-3 bg-corp-orange text-white hover:bg-corp-orangeD transition-colors">
                {hero.cta_label || "Browse products"}
              </Link>
              <a href="#contact" className="group inline-flex items-center gap-1 font-display font-semibold text-[15px] text-white">
                Request a quote
                <span className="transition-transform group-hover:translate-x-0.5">›</span>
              </a>
            </div>
          </div>

          {/* stats strip — left aligned, in normal flow so it never clips the copy */}
          <div className="shrink-0 py-5 flex items-center gap-x-12 gap-y-3 flex-wrap border-t border-white/10">
            {about.stats.slice(0, 3).map((s, i) => (
              <div key={i} className="flex items-baseline gap-2">
                <span className="font-display font-bold text-white text-lg">{s.value}</span>
                <span className="font-mono text-[11px] tracking-[0.12em] uppercase text-white/55">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* video controls — unmute + fullscreen */}
        <div className="absolute bottom-24 right-6 sm:right-8 flex items-center gap-2 z-10">
          <button
            onClick={toggleMute}
            aria-label={muted ? "Unmute video" : "Mute video"}
            className="w-11 h-11 grid place-items-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white transition-colors"
          >
            {muted ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M11 5 6 9H2v6h4l5 4V5z" /><path d="m23 9-6 6M17 9l6 6" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M11 5 6 9H2v6h4l5 4V5z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14" /></svg>
            )}
          </button>
          <button
            onClick={goFullscreen}
            aria-label="Watch fullscreen"
            className="w-11 h-11 grid place-items-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M16 21h3a2 2 0 0 0 2-2v-3M8 21H5a2 2 0 0 1-2-2v-3" /></svg>
          </button>
        </div>
      </section>

      {/* ============================ SERVICES — Apple bento ============================ */}
      <section id="services" className="py-20 lg:py-28 section-light scroll-mt-20">
        <div className="wrap">
          <div className="text-center max-w-2xl mx-auto mb-12 reveal">
            <span className="eyebrow-corp justify-center">What we do</span>
            <h2 className="text-[clamp(28px,4vw,52px)] font-semibold tracking-tight text-corp-navy mt-3">
              {services.title || "One-stop solutions."}
            </h2>
            <p className="text-[17px] text-corp-grey mt-4">Everything from raw boards to ready-to-install panels — handled in-house.</p>
          </div>

          <div className="reveal grid sm:grid-cols-2 gap-5">
            {services.items.slice(0, 4).map((it, i) => (
              <article
                key={i}
                className="group relative overflow-hidden rounded-[28px] bg-corp-navy min-h-[360px] lg:min-h-[440px] flex flex-col items-center text-center pt-12 px-8"
              >
                <img
                  src={SERVICE_IMG[i % SERVICE_IMG.length]}
                  alt={it.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-85 group-hover:scale-[1.04] transition-all duration-700 ease-smooth"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/60" />
                <div className="relative">
                  <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-accent-glow">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="font-display font-semibold text-[26px] lg:text-[30px] text-white tracking-tight mt-2 leading-tight">{it.title}</h3>
                  <p className="text-[15px] text-white/80 mt-3 max-w-sm mx-auto leading-relaxed">{it.body}</p>
                  <Link to="/services" className="inline-flex items-center gap-1 font-display font-semibold text-[14px] text-white mt-5 group/link">
                    Learn more <span className="transition-transform group-hover/link:translate-x-0.5">›</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ PRODUCTS — Apple lineup carousel ============================ */}
      <section id="products" className="py-20 lg:py-28 bg-white border-y border-line overflow-hidden scroll-mt-20">
        <div className="wrap">
          <div className="flex items-end justify-between gap-5 flex-wrap mb-10 reveal">
            <div>
              <span className="eyebrow-corp">The lineup</span>
              <h2 className="text-[clamp(28px,4vw,52px)] font-semibold tracking-tight text-corp-navy mt-3">Featured products.</h2>
            </div>
            <Link to="/products" className="group inline-flex items-center gap-1 font-display font-semibold text-[15px] text-corp-orange">
              Explore the full catalog <span className="transition-transform group-hover:translate-x-0.5">›</span>
            </Link>
          </div>
        </div>

        {/* edge-to-edge horizontal snap scroller */}
        <div className="reveal flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 px-[max(1.5rem,calc((100%-1200px)/2))] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {lineup.map((p) => (
            <Link
              key={p.id}
              to={`/products/${p.slug}`}
              className="group snap-start shrink-0 w-[280px] rounded-3xl bg-corp-bg border border-line overflow-hidden hover:shadow-lift transition-shadow"
            >
              <div className="aspect-square overflow-hidden bg-white">
                <img src={primaryImage(p)} alt={p.name} loading="lazy" className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-smooth" />
              </div>
              <div className="p-6 text-center">
                <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-corp-orange">{p.brand || "Lexus"}</div>
                <h3 className="font-display font-semibold text-[18px] text-corp-navy tracking-tight mt-1.5 leading-tight line-clamp-2">{p.name}</h3>
                <span className="inline-flex items-center gap-1 font-display font-semibold text-[13px] text-corp-navy mt-3 group-hover:text-corp-orange transition-colors">
                  View <span className="transition-transform group-hover:translate-x-0.5">›</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ============================ CATEGORIES — clean grid ============================ */}
      <section id="categories" className="py-20 lg:py-28 section-light scroll-mt-20">
        <div className="wrap">
          <div className="text-center max-w-2xl mx-auto mb-12 reveal">
            <span className="eyebrow-corp justify-center">Our products</span>
            <h2 className="text-[clamp(28px,4vw,52px)] font-semibold tracking-tight text-corp-navy mt-3">Shop by category.</h2>
          </div>
          <div className="reveal grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))" }}>
            {categories.map((c, i) => (
              <Link
                key={c.id}
                to={`/products?cat=${c.slug}`}
                className="group rounded-3xl bg-white border border-line p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lift hover:border-corp-orange"
              >
                <span className="w-14 h-14 mx-auto grid place-items-center rounded-2xl bg-corp-soft text-corp-navy group-hover:bg-corp-orange group-hover:text-white transition-colors">
                  <CategoryIcon slug={c.slug} className="w-6 h-6" />
                </span>
                <h3 className="font-display font-semibold text-[16px] text-corp-navy tracking-tight mt-4 leading-tight">{c.name}</h3>
                <p className="text-[12.5px] text-corp-grey leading-relaxed line-clamp-2 mt-1.5">{c.description}</p>
                <span className="font-mono text-[11px] text-corp-orange font-bold inline-block mt-3">{String(i + 1).padStart(2, "0")}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ INTERIORS — editorial ============================ */}
      <section id="interiors" className="py-20 lg:py-28 bg-white border-y border-line scroll-mt-20">
        <div className="wrap">
          <div className="text-center max-w-2xl mx-auto mb-12 reveal">
            <span className="eyebrow-corp justify-center">Designed to be lived in</span>
            <h2 className="text-[clamp(28px,4vw,52px)] font-semibold tracking-tight text-corp-navy mt-3">Finished with Lexus.</h2>
            <p className="text-[17px] text-corp-grey mt-4">From kitchens to facades — interiors that designers and homeowners love.</p>
          </div>
          <div className="reveal grid lg:grid-cols-3 gap-5">
            <div className="group relative overflow-hidden rounded-[28px] lg:row-span-2 aspect-[3/4] lg:aspect-auto bg-corp-navy">
              <img src={IMG.kitchen} alt="Modern kitchen finished with Lexus materials" loading="lazy" className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-[1.04] transition-all duration-700 ease-smooth" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
              <div className="absolute left-6 bottom-6">
                <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-accent-glow">Residential</span>
                <div className="font-display font-semibold text-white text-2xl tracking-tight">Kitchens & cabinetry</div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-[28px] aspect-[4/3] lg:aspect-auto lg:min-h-[210px] bg-corp-navy">
              <img src={IMG.dining} alt="Dining interior fit-out" loading="lazy" className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-[1.04] transition-all duration-700 ease-smooth" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute left-5 bottom-5">
                <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-accent-glow">Hospitality</span>
                <div className="font-display font-semibold text-white text-xl tracking-tight">Dining & living spaces</div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-[28px] aspect-[4/3] lg:aspect-auto lg:min-h-[210px] bg-corp-navy">
              <img src={IMG.facade} alt="Building facade supplied by Lexus" loading="lazy" className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-[1.04] transition-all duration-700 ease-smooth" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute left-5 bottom-5">
                <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-accent-glow">Commercial</span>
                <div className="font-display font-semibold text-white text-xl tracking-tight">Facades & cladding</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ CREDENTIALS — WORLDBEX exhibitor ============================ */}
      <section id="credentials" className="py-20 lg:py-24 section-light scroll-mt-20">
        <div className="wrap">
          <div className="text-center max-w-2xl mx-auto mb-8 reveal">
            <span className="eyebrow-corp justify-center">Credentials</span>
            <h2 className="text-[clamp(28px,4vw,52px)] font-semibold tracking-tight text-corp-navy mt-3">Recognized in the industry.</h2>
            <p className="text-[17px] text-corp-grey mt-4">A proud exhibitor at WORLDBEX — the Philippines' biggest building &amp; construction exposition.</p>
          </div>
          <div className="reveal mx-auto max-w-4xl rounded-3xl overflow-hidden border border-line shadow-card bg-white">
            <img src={IMG.worldbex} alt="Lexus Industrial — official exhibitor at WORLDBEX 2025, SMX Convention Center, Manila" className="w-full h-auto" />
          </div>
          <p className="text-center font-mono text-[12px] tracking-[0.12em] uppercase text-corp-grey mt-5 reveal">
            Official exhibitor · WORLDBEX 2025 · SMX Convention Center, Manila
          </p>
        </div>
      </section>

      {/* ============================ CONTACT — form + branches ============================ */}
      <section id="contact" className="py-20 lg:py-28 section-light scroll-mt-24">
        <div className="wrap">
          <div className="text-center max-w-2xl mx-auto mb-12 reveal">
            <span className="eyebrow-corp justify-center">Get in touch</span>
            <h2 className="text-[clamp(28px,4vw,52px)] font-semibold tracking-tight text-corp-navy mt-3">Let's talk about your project.</h2>
            <p className="text-[17px] text-corp-grey mt-4">Tell us what you need — we'll respond with availability and pricing, including hard-to-find finishes.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] items-start reveal">
            {/* info + interior image */}
            <div className="space-y-5">
              <div className="relative overflow-hidden rounded-3xl aspect-[16/10] bg-corp-navy">
                <img src={IMG.dining} alt="Interior finished with Lexus materials" loading="lazy" className="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-corp-navy/80 to-transparent" />
                <div className="absolute left-6 bottom-6 right-6">
                  <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-accent-glow font-bold">Since 1995</div>
                  <p className="text-white/90 text-[15px] mt-1.5 leading-relaxed">Trusted by the interior design industry across the Philippines.</p>
                </div>
              </div>
              <div className="grid gap-3">
                {branches.map((b, i) => (
                  <div key={i} className="rounded-2xl bg-white border border-line p-5">
                    <h3 className="font-display font-semibold text-[17px] text-corp-navy tracking-tight">{b.city}</h3>
                    <p className="text-[13.5px] text-corp-grey leading-relaxed mt-1">{b.address}</p>
                    <div className="mt-2.5 space-y-1 font-mono text-[13px]">
                      {b.phone && <div className="text-corp-grey">☎ {b.phone}</div>}
                      {b.email && <a href={`mailto:${b.email}`} className="block text-corp-navy hover:text-corp-orange break-all">✉ {b.email}</a>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* the form */}
            <ContactForm contactEmail={contact.email} />
          </div>
        </div>
      </section>

    </div>
  );
}
