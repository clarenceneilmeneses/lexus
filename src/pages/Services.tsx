import { Link, useOutletContext } from "react-router-dom";
import type { Catalog } from "../lib/types";
import PageHeader from "../components/PageHeader";

const STEPS = [
  ["Tell us the spec", "Share sizes, finishes, quantities, and your delivery timeline."],
  ["Get a quote", "We confirm availability and pricing — including hard-to-find items."],
  ["We prep & finish", "Lamination, cut-to-size, and edging done to your requirement."],
  ["Delivered on site", "Wholesale and retail supply delivered to projects nationwide."],
];

export default function Services() {
  const { catalog } = useOutletContext<{ catalog: Catalog }>();
  const s = catalog.settings.services;

  return (
    <>
      <PageHeader
        eyebrow="Capabilities"
        title={s.title}
        subtitle="More than a supplier — we finish and fabricate so panels arrive on site ready to install."
      />

      <section className="py-16 lg:py-24 section-light">
        <div className="wrap reveal grid gap-5 sm:grid-cols-2">
          {s.items.map((it, i) => (
            <div key={i} className="group bg-white border border-line rounded-3xl p-8 hover:border-corp-orange hover:shadow-lift transition-all duration-300">
              <span className="font-mono text-[13px] text-corp-orange font-bold">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="font-display font-semibold text-[22px] tracking-tight text-corp-navy mt-4 mb-2 leading-tight">{it.title}</h3>
              <p className="text-[14px] text-corp-grey leading-relaxed">{it.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="py-16 lg:py-24 bg-white border-y border-line">
        <div className="wrap">
          <div className="reveal mb-12 text-center max-w-2xl mx-auto">
            <span className="eyebrow-corp justify-center">How it works</span>
            <h2 className="text-[clamp(28px,4vw,48px)] font-semibold tracking-tight text-corp-navy mt-3">From spec to site in four steps.</h2>
          </div>
          <div className="reveal grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([title, body], i) => (
              <div key={i} className="relative bg-corp-bg border border-line rounded-3xl p-6">
                <div className="font-display font-black text-[44px] leading-none text-corp-soft">{String(i + 1).padStart(2, "0")}</div>
                <h3 className="font-display font-semibold text-[17px] tracking-tight text-corp-navy mt-3 mb-2">{title}</h3>
                <p className="text-[13.5px] text-corp-grey leading-relaxed">{body}</p>
                {i < STEPS.length - 1 && (
                  <span className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-corp-orange font-bold z-10">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 section-light">
        <div className="wrap">
          <div className="reveal relative overflow-hidden bg-corp-navy text-white rounded-[28px] p-10 lg:p-14 flex items-center justify-between gap-6 flex-wrap">
            <div>
              <h2 className="text-[clamp(24px,3vw,38px)] font-semibold tracking-tight leading-tight">Let's talk about your requirements.</h2>
              <p className="text-white/75 mt-2 text-lg">Bulk orders, sourcing, or recurring supply — we're ready.</p>
            </div>
            <Link to="/contact" className="pill-orange shrink-0">Get in touch</Link>
          </div>
        </div>
      </section>
    </>
  );
}
