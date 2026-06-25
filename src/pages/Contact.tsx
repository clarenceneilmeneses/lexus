import { useOutletContext, useSearchParams } from "react-router-dom";
import type { Catalog } from "../lib/types";
import PageHeader from "../components/PageHeader";
import ContactForm from "../components/ContactForm";

export default function Contact() {
  const { catalog } = useOutletContext<{ catalog: Catalog }>();
  const c = catalog.settings.contact;
  const [params] = useSearchParams();
  const product = params.get("product");

  const InfoRow = ({ label, value, href }: { label: string; value: string; href?: string }) => (
    <div className="bg-white border border-line rounded-2xl px-4 py-3.5 shadow-card">
      <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-steel mb-0.5">{label}</div>
      {href ? <a href={href} className="font-semibold hover:text-corp-orange transition-colors break-all">{value}</a> : <b className="font-semibold">{value}</b>}
    </div>
  );

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Request a quote"
        subtitle="Tell us what you need and we'll respond with availability and pricing — including hard-to-find finishing materials."
      />

      <section className="py-14 lg:py-20">
        <div className="wrap grid gap-10 lg:gap-14 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="grid gap-3 content-start">
            <InfoRow label="Email" value={c.email} href={`mailto:${c.email}`} />
            {c.phone && <InfoRow label="Phone" value={c.phone} href={`tel:${c.phone}`} />}
            <InfoRow label="Hours" value={c.hours} />
            <InfoRow label="Location" value={c.address} />
            <div className="bg-corp-navy text-white rounded-2xl p-6 mt-2">
              <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-corp-orange font-bold">Since 1995</div>
              <p className="text-[14px] text-white/75 mt-2 leading-relaxed">
                Wholesale &amp; retail supply of modern interior finishings — trusted by the interior design industry.
              </p>
            </div>
          </div>

          <ContactForm productSubject={product} contactEmail={c.email} />
        </div>
      </section>
    </>
  );
}
