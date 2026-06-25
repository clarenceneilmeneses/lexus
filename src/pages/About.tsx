import { Link, useOutletContext } from "react-router-dom";
import type { Catalog } from "../lib/types";
import PageHeader from "../components/PageHeader";

const IMG = {
  facade: "/lexus/facade.jpg",
  kitchen: "/lexus/kitchen.jpg",
  dining: "/lexus/interior-dining.jpg",
  supply: "/lexus/supply.jpg",
};

const VALUES = [
  ["Trusted since 1995", "Three decades supplying the people who shape Philippine interiors."],
  ["Specifier-grade brands", "A curated selection of trusted international brands with high-grade features."],
  ["End-to-end supply", "Source, finish, and deliver — wholesale and retail, project by project."],
];

export default function About() {
  const { catalog } = useOutletContext<{ catalog: Catalog }>();
  const a = catalog.settings.about;

  return (
    <>
      <PageHeader
        eyebrow="Who we are"
        title={a.title}
        subtitle="A wholesale and retail supplier of modern interior finishings — trusted by the design industry since 1995."
      />

      {/* Intro — text + image collage */}
      <section className="py-16 lg:py-24 section-light">
        <div className="wrap grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center">
          <div className="reveal">
            <p className="text-[clamp(18px,2vw,22px)] text-corp-navy leading-relaxed font-medium">{a.body}</p>
            <div className="mt-8 space-y-5">
              {VALUES.map(([t, b], i) => (
                <div key={i} className="flex gap-4 items-start">
                  <span className="w-9 h-9 shrink-0 grid place-items-center rounded-lg bg-corp-soft text-corp-navy font-display font-black">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display font-semibold text-[16px] tracking-tight text-corp-navy">{t}</h3>
                    <p className="text-[14px] text-corp-grey leading-relaxed mt-0.5">{b}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/contact" className="pill-orange mt-9">Work with us</Link>
          </div>

          {/* image collage */}
          <div className="reveal grid grid-cols-2 gap-4">
            <div className="overflow-hidden rounded-[28px] col-span-2 aspect-[16/10] bg-corp-navy">
              <img src={IMG.facade} alt="Building facade supplied by Lexus" loading="lazy" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
            </div>
            <div className="overflow-hidden rounded-[24px] aspect-square bg-corp-navy">
              <img src={IMG.kitchen} alt="Modern kitchen interior" loading="lazy" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
            </div>
            <div className="overflow-hidden rounded-[24px] aspect-square bg-corp-navy">
              <img src={IMG.dining} alt="Dining interior fit-out" loading="lazy" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats band */}
      {a.stats.length > 0 && (
        <section className="py-16 lg:py-24 bg-corp-navy text-white">
          <div className="wrap">
            <div className="grid sm:grid-cols-3 gap-8 text-center">
              {a.stats.map((s, i) => (
                <div key={i} className="reveal">
                  <div className="font-display font-black text-[clamp(38px,5vw,60px)] leading-none">{s.value}</div>
                  <div className="font-mono text-[11px] text-corp-orange uppercase tracking-[0.14em] mt-3">{s.label}</div>
                </div>
              ))}
            </div>
            <p className="reveal text-center font-display font-semibold text-[clamp(18px,2.4vw,26px)] tracking-tight text-white/90 max-w-3xl mx-auto mt-14">
              Trusted by architects, interior designers &amp; project managers across the Philippines.
            </p>
          </div>
        </section>
      )}

      {/* Capability strip */}
      <section className="py-16 lg:py-24 section-light">
        <div className="wrap grid lg:grid-cols-[1fr_1.1fr] gap-12 items-center">
          <div className="reveal overflow-hidden rounded-[28px] aspect-[4/3] bg-corp-navy order-2 lg:order-1">
            <img src={IMG.supply} alt="Lexus warehouse and distribution" loading="lazy" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
          </div>
          <div className="reveal order-1 lg:order-2">
            <span className="eyebrow-corp">More than a supplier</span>
            <h2 className="text-[clamp(26px,3.6vw,44px)] font-semibold tracking-tight text-corp-navy mt-3 leading-tight">
              We source, finish, and deliver.
            </h2>
            <p className="text-[17px] text-corp-grey leading-relaxed mt-5">
              From boards and panels to drywall, ceilings, and doors — we hold the lines designers ask for and
              finish them in-house with lamination, precision cutting, and edging, so materials arrive on site
              ready to install.
            </p>
            <div className="flex gap-3 flex-wrap mt-8">
              <Link to="/services" className="pill-navy">Our capabilities</Link>
              <Link to="/products" className="pill-outline">Browse products</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
