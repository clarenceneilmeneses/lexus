import { useRef, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import type { Catalog, Category } from "../lib/types";
import { imgUrl, primaryImage, placeholder } from "../lib/utils";
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
const INTERIOR_IMG = [IMG.kitchen, IMG.dining, IMG.facade];

export default function Home() {
  const { catalog } = useOutletContext<{ catalog: Catalog }>();
  const { settings, categories, products } = catalog;
  const { hero, services, about, contact, interiors, credentials } = settings;

  const videoRef = useRef<HTMLVideoElement>(null);
  const lineupRef = useRef<HTMLDivElement>(null);
  const scrollLineup = (dir: -1 | 1) => {
    lineupRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };
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

  return (
    <div className="bg-corp-bg">
      <SectionNav sections={SECTIONS} />

      {/* ============================ HERO — editorial, contained video ============================ */}
      <section id="top" className="relative bg-corp-bg pt-8 lg:pt-12 pb-14 lg:pb-20 scroll-mt-20">
        {/* centered title block */}
        <div className="wrap text-center max-w-4xl mx-auto">
          <span className="font-mono text-[11px] sm:text-[12px] tracking-[0.22em] uppercase text-corp-grey">
            {hero.eyebrow || "Interior finishings & building materials · Since 1995"}
          </span>
          <h1 className="font-serif font-medium text-[clamp(40px,7vw,94px)] tracking-[-0.01em] leading-[1.02] text-corp-navy mt-4">
            {hero.title}
          </h1>
          {hero.subtitle && (
            <p className="text-[clamp(15px,1.9vw,20px)] text-corp-grey max-w-2xl mx-auto mt-5 leading-relaxed">
              {hero.subtitle}
            </p>
          )}
        </div>

        {/* controls row above the video */}
        <div className="wrap mt-9 lg:mt-12 flex items-center justify-between">
          <button
            onClick={goFullscreen}
            className="font-mono text-[11px] tracking-[0.16em] uppercase text-corp-grey hover:text-corp-navy transition-colors"
          >
            Fullscreen
          </button>
          <button
            onClick={goFullscreen}
            aria-label="Expand video to fullscreen"
            className="w-8 h-8 grid place-items-center text-corp-grey hover:text-corp-navy transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="w-5 h-5"><path d="M12 5v14M5 12h14" /></svg>
          </button>
        </div>

        {/* cinematic contained video */}
        <div className="mt-4 mx-auto max-w-[1360px] px-4 sm:px-6">
          {/* 16:9 frame matched to the source so object-contain never crops the
              burned-in captions; any spare space stays black (cinematic). */}
          <div className="relative overflow-hidden bg-black aspect-video">
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-contain"
              src={hero.video_url?.trim() || LEXUS_VIDEO}
              poster={IMG.facade}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10 pointer-events-none" />

            {/* unmute toggle — bottom-left */}
            <button
              onClick={toggleMute}
              aria-label={muted ? "Unmute video" : "Mute video"}
              className="absolute left-4 bottom-4 sm:left-5 sm:bottom-5 w-10 h-10 grid place-items-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white transition-colors"
            >
              {muted ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><path d="M11 5 6 9H2v6h4l5 4V5z" /><path d="m23 9-6 6M17 9l6 6" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><path d="M11 5 6 9H2v6h4l5 4V5z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14" /></svg>
              )}
            </button>

          </div>
        </div>

        {/* CTA pill — sits below the video so it never covers the captions */}
        <div className="flex justify-center mt-7">
          <a
            href="#services"
            className="group inline-flex items-center gap-2 rounded-full bg-corp-navy hover:bg-corp-navyD text-white font-display font-semibold text-[14px] px-6 py-3 transition-colors"
          >
            {hero.cta_label || "Explore our work"}
            <span className="transition-transform group-hover:translate-y-0.5">↓</span>
          </a>
        </div>

        {/* slim stats strip under the video */}
        <div className="wrap mt-6 flex items-center justify-center gap-x-10 gap-y-3 flex-wrap">
          {about.stats.slice(0, 3).map((s, i) => (
            <div key={i} className="flex items-baseline gap-2">
              <span className="font-display font-bold text-corp-navy text-lg">{s.value}</span>
              <span className="font-mono text-[11px] tracking-[0.12em] uppercase text-corp-grey">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ============================ SERVICES — varied bento ============================ */}
      <section id="services" className="py-16 lg:py-24 section-light scroll-mt-20">
        <div className="wrap">
          <div className="text-center max-w-2xl mx-auto mb-12 reveal">
            <span className="eyebrow-corp justify-center">What we do</span>
            <h2 className="text-[clamp(28px,4vw,52px)] font-semibold tracking-tight text-corp-navy mt-3">
              {services.title || "One-stop solutions."}
            </h2>
            <p className="text-[17px] text-corp-grey mt-4">Everything from raw boards to ready-to-install panels — handled in-house.</p>
          </div>

          {/* asymmetric rhythm: items 0 & 3 run wide, 1 & 2 stay square */}
          <div className="reveal grid sm:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-fr">
            {services.items.slice(0, 4).map((it, i) => {
              const wide = i === 0 || i === 3;
              return (
                <article
                  key={i}
                  className={`group relative overflow-hidden rounded-[28px] bg-corp-navy flex flex-col justify-end p-8 lg:p-10 ${
                    wide ? "sm:col-span-2 lg:col-span-2 min-h-[300px] lg:min-h-[340px]" : "min-h-[300px]"
                  }`}
                >
                  <img
                    src={imgUrl(it.image) || SERVICE_IMG[i % SERVICE_IMG.length]}
                    alt={it.title}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-90 group-hover:scale-[1.04] transition-all duration-700 ease-smooth"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
                  <div className="relative">
                    <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-accent-glow">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="font-display font-semibold text-[24px] lg:text-[28px] text-white tracking-tight mt-2 leading-tight">{it.title}</h3>
                    <p className="text-[15px] text-white/80 mt-2.5 max-w-md leading-relaxed">{it.body}</p>
                    <Link to="/services" className="inline-flex items-center gap-1 font-display font-semibold text-[14px] text-white mt-4 group/link">
                      Learn more <span className="transition-transform group-hover/link:translate-x-0.5">›</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================ PRODUCTS — Apple lineup carousel ============================ */}
      <section id="products" className="py-16 lg:py-24 bg-white border-y border-line overflow-hidden scroll-mt-20">
        <div className="wrap">
          <div className="flex items-end justify-between gap-5 flex-wrap mb-10 reveal">
            <div>
              <span className="eyebrow-corp">The lineup</span>
              <h2 className="text-[clamp(28px,4vw,52px)] font-semibold tracking-tight text-corp-navy mt-3">Featured products.</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => scrollLineup(-1)}
                  aria-label="Scroll products left"
                  className="w-10 h-10 grid place-items-center rounded-full border border-line text-corp-navy text-xl leading-none hover:border-corp-orange hover:text-corp-orange transition-colors"
                >
                  ‹
                </button>
                <button
                  onClick={() => scrollLineup(1)}
                  aria-label="Scroll products right"
                  className="w-10 h-10 grid place-items-center rounded-full border border-line text-corp-navy text-xl leading-none hover:border-corp-orange hover:text-corp-orange transition-colors"
                >
                  ›
                </button>
              </div>
              <Link to="/products" className="group inline-flex items-center gap-1 font-display font-semibold text-[15px] text-corp-orange">
                Explore the full catalog <span className="transition-transform group-hover:translate-x-0.5">›</span>
              </Link>
            </div>
          </div>
        </div>

        {/* edge-to-edge horizontal snap scroller, with a right-edge fade hinting more */}
        <div className="relative">
          <div
            ref={lineupRef}
            className="reveal flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 px-[max(1.5rem,calc((100%-1200px)/2))] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
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
          <div className="pointer-events-none absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-l from-white to-transparent hidden sm:block" />
        </div>
      </section>

      {/* ============================ CATEGORIES — clean grid ============================ */}
      <section id="categories" className="py-16 lg:py-24 section-light scroll-mt-20">
        <div className="wrap">
          <div className="text-center max-w-2xl mx-auto mb-12 reveal">
            <span className="eyebrow-corp justify-center">Our products</span>
            <h2 className="text-[clamp(28px,4vw,52px)] font-semibold tracking-tight text-corp-navy mt-3">Shop by category.</h2>
            <p className="text-[17px] text-corp-grey mt-4">From boards and panels to framing and finishes — browse the full range by category.</p>
          </div>

          {/* clean image-card grid */}
          <div className="reveal grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {topCategories.map((c, i) => (
              <Link
                key={c.id}
                to={`/products?cat=${c.slug}`}
                className="group relative block overflow-hidden rounded-2xl aspect-[4/5] bg-corp-navy"
              >
                <img
                  src={categoryImage(c)}
                  alt={c.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-[1.05] transition-all duration-700 ease-smooth"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-corp-navy/90 via-corp-navy/20 to-transparent" />
                <span className="absolute top-3.5 right-4 font-mono text-[11px] font-bold text-white/55">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="absolute left-4 right-4 bottom-4 font-display font-semibold text-[16px] text-white tracking-tight leading-tight">{c.name}</h3>
              </Link>
            ))}
          </div>

          <div className="flex justify-center mt-10 reveal">
            <Link to="/products" className="pill-outline">
              View all categories <span className="transition-transform group-hover:translate-x-0.5">›</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================ INTERIORS — editorial ============================ */}
      <section id="interiors" className="py-20 lg:py-28 bg-white border-y border-line scroll-mt-20">
        <div className="wrap">
          <div className="text-center max-w-2xl mx-auto mb-12 reveal">
            <span className="eyebrow-corp justify-center">{interiors.eyebrow}</span>
            <h2 className="text-[clamp(28px,4vw,52px)] font-semibold tracking-tight text-corp-navy mt-3">{interiors.title}</h2>
            {interiors.subtitle && <p className="text-[17px] text-corp-grey mt-4">{interiors.subtitle}</p>}
          </div>
          <div className="reveal grid lg:grid-cols-3 gap-5">
            {interiors.items.map((it, i) => {
              const big = i === 0;
              return (
                <div
                  key={i}
                  className={`group relative overflow-hidden rounded-[28px] bg-corp-navy ${
                    big ? "lg:row-span-2 aspect-[3/4] lg:aspect-auto" : "aspect-[4/3] lg:aspect-auto lg:min-h-[210px]"
                  }`}
                >
                  <img
                    src={imgUrl(it.image) || INTERIOR_IMG[i % INTERIOR_IMG.length]}
                    alt={it.title}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-[1.04] transition-all duration-700 ease-smooth"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/70 ${big ? "via-black/5" : ""} to-transparent`} />
                  <div className={big ? "absolute left-6 bottom-6" : "absolute left-5 bottom-5"}>
                    <span className={`font-mono tracking-[0.16em] uppercase text-accent-glow ${big ? "text-[11px]" : "text-[10px]"}`}>{it.eyebrow}</span>
                    <div className={`font-display font-semibold text-white tracking-tight ${big ? "text-2xl" : "text-xl"}`}>{it.title}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================ CREDENTIALS — WORLDBEX trust band ============================ */}
      <section id="credentials" className="py-14 lg:py-20 section-light scroll-mt-20">
        <div className="wrap">
          <div className="reveal grid lg:grid-cols-2 items-stretch rounded-[28px] overflow-hidden border border-line shadow-card bg-white">
            <div className="relative bg-corp-soft flex items-center justify-center p-5 lg:p-7">
              <img
                src={imgUrl(credentials.image) || IMG.worldbex}
                alt={credentials.caption || credentials.title}
                loading="lazy"
                className="w-full max-w-[460px] h-auto object-contain rounded-2xl shadow-card"
              />
            </div>
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <span className="eyebrow-corp">{credentials.eyebrow}</span>
              <h2 className="text-[clamp(24px,3.2vw,40px)] font-semibold tracking-tight text-corp-navy mt-3">{credentials.title}</h2>
              {credentials.body && <p className="text-[16px] text-corp-grey mt-4 leading-relaxed">{credentials.body}</p>}
              {credentials.stats.length > 0 && (
                <div className="mt-7 grid grid-cols-3 gap-4 border-t border-line pt-6">
                  {credentials.stats.slice(0, 3).map((st, i) => (
                    <div key={i}>
                      <div className="font-display font-bold text-corp-navy text-2xl">{st.value}</div>
                      <div className="font-mono text-[11px] tracking-[0.1em] uppercase text-corp-grey mt-1">{st.label}</div>
                    </div>
                  ))}
                </div>
              )}
              {credentials.caption && (
                <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-corp-grey mt-6">{credentials.caption}</p>
              )}
            </div>
          </div>
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
