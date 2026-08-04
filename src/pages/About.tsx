import { Link, useOutletContext } from "react-router-dom";
import type { Catalog } from "../lib/types";
import PageHeader from "../components/PageHeader";
import { useSeo } from "../lib/seo";

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

  useSeo(
    {
      title: "About Us",
      description:
        a.body ||
        "Lexus Industrial Enterprise Corporation has supplied modern interior finishings and building materials to the Philippine design industry since 1995.",
      image: IMG.facade,
    },
    catalog.settings
  );

  return (
    <>
      <PageHeader
        eyebrow="Who we are"
        title={a.title}
        subtitle="A wholesale and retail supplier of modern interior finishings — trusted by the design industry since 1995."
      />

      {/* Intro — text + image collage */}
      <section className="sec bg-white">
        <div className="band grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-center">
          <div className="reveal">
            <p className="text-[clamp(17px,1.9vw,21px)] leading-[1.55] tracking-[-0.01em] text-ref-ink font-medium">{a.body}</p>
            <div className="mt-8 space-y-6">
              {VALUES.map(([t, b], i) => (
                <div key={i} className="flex gap-4 items-start">
                  <span className="num w-9 h-9 shrink-0 grid place-items-center bg-ref-band text-white text-[13px]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="h-card text-ref-ink">{t}</h3>
                    <p className="copy-sm mt-1">{b}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/contact" className="btn-ref-accent mt-9">Work with us</Link>
          </div>

          {/* image collage */}
          <div className="reveal grid grid-cols-2 gap-4">
            <div className="overflow-hidden col-span-2 aspect-[16/10] bg-ref-band">
              <img src={IMG.facade} alt="Building facade supplied by Lexus" loading="lazy" className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden aspect-square bg-ref-band">
              <img src={IMG.kitchen} alt="Modern kitchen interior" loading="lazy" className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden aspect-square bg-ref-band">
              <img src={IMG.dining} alt="Dining interior fit-out" loading="lazy" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats band */}
      {a.stats.length > 0 && (
        <section className="sec bg-ref-band text-white">
          <div className="band">
            <div className="grid sm:grid-cols-3 gap-8 text-center">
              {a.stats.map((s, i) => (
                <div key={i} className="reveal">
                  <div className="num text-[clamp(34px,4.6vw,52px)] leading-none">{s.value}</div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/60 mt-3.5">{s.label}</div>
                </div>
              ))}
            </div>
            <p className="reveal text-center h-sec text-white/90 max-w-3xl mx-auto mt-14">
              Trusted by architects, interior designers &amp; project managers across the Philippines.
            </p>
          </div>
        </section>
      )}

      {/* Capability strip */}
      <section className="sec bg-ref-off">
        <div className="band grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-14 items-center">
          <div className="reveal overflow-hidden aspect-[4/3] bg-ref-band order-2 lg:order-1">
            <img src={IMG.supply} alt="Lexus warehouse and distribution" loading="lazy" className="w-full h-full object-cover" />
          </div>
          <div className="reveal order-1 lg:order-2">
            <span className="eyebrow-rule start">More than a supplier</span>
            <h2 className="h-sec text-ref-ink mt-4">We source, finish, and deliver.</h2>
            <p className="copy mt-5">
              From boards and panels to drywall, ceilings, and doors — we hold the lines designers ask for and
              finish them in-house with lamination, precision cutting, and edging, so materials arrive on site
              ready to install.
            </p>
            <div className="flex gap-3 flex-wrap mt-8">
              <Link to="/services" className="btn-ref-band">Our capabilities</Link>
              <Link to="/products" className="btn-ref-out">Browse products</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
