import { Link, useOutletContext } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { Catalog } from "../lib/types";
import PageHeader from "../components/PageHeader";
import { useSeo } from "../lib/seo";

const STEPS = [
  ["Tell us the spec", "Share sizes, finishes, quantities, and your delivery timeline."],
  ["Get a quote", "We confirm availability and pricing — including hard-to-find items."],
  ["We prep & finish", "Lamination, cut-to-size, and edging done to your requirement."],
  ["Delivered on site", "Wholesale and retail supply delivered to projects nationwide."],
];

export default function Services() {
  const { catalog } = useOutletContext<{ catalog: Catalog }>();
  const s = catalog.settings.services;

  useSeo(
    {
      title: "Services — Lamination, Cut-to-Size & Edging",
      description:
        s.subtitle ||
        "Lamination, cut-to-size and edging services for interior finishing panels — delivered to project sites across the Philippines.",
    },
    catalog.settings
  );

  return (
    <>
      <PageHeader
        eyebrow="Capabilities"
        title={s.title}
        subtitle="More than a supplier — we finish and fabricate so panels arrive on site ready to install."
      />

      <section className="sec bg-white">
        <div className="band-cards reveal grid gap-5 sm:grid-cols-2">
          {s.items.map((it, i) => (
            <div key={i} className="card-ref p-8 hover:border-ref-band transition-colors">
              <span className="num text-[13px] text-ref-accent">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="h-card text-ref-ink mt-4 mb-2">{it.title}</h3>
              <p className="copy-sm">{it.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="sec bg-ref-off border-y border-ref-hair">
        <div className="band">
          <div className="reveal mb-12 text-center">
            <span className="eyebrow-rule center">How it works</span>
            <h2 className="h-sec text-ref-ink mt-4">From spec to site in four steps.</h2>
          </div>
          <div className="reveal grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([title, body], i) => (
              <div key={i} className="relative card-ref p-6">
                <div className="num text-[40px] leading-none text-ref-hair">{String(i + 1).padStart(2, "0")}</div>
                <h3 className="h-card text-ref-ink mt-3 mb-2">{title}</h3>
                <p className="copy-sm">{body}</p>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute -right-[13px] top-1/2 -translate-y-1/2 w-5 h-5 text-ref-accent bg-ref-off z-10" strokeWidth={1.8} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec bg-white">
        <div className="band-cards">
          <div className="reveal bg-ref-band text-white p-10 lg:p-14 flex items-center justify-between gap-6 flex-wrap">
            <div>
              <h2 className="h-sec">Let's talk about your requirements.</h2>
              <p className="copy !text-white/75 mt-3">Bulk orders, sourcing, or recurring supply — we're ready.</p>
            </div>
            <Link to="/contact" className="btn-ref shrink-0 bg-white border-white text-ref-band hover:bg-ref-off">
              Get in touch
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
