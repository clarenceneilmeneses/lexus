import { useOutletContext, useSearchParams } from "react-router-dom";
import { Clock, Mail, MapPin, Phone, type LucideIcon } from "lucide-react";
import type { Catalog } from "../lib/types";
import PageHeader from "../components/PageHeader";
import ContactForm from "../components/ContactForm";

export default function Contact() {
  const { catalog } = useOutletContext<{ catalog: Catalog }>();
  const c = catalog.settings.contact;
  const [params] = useSearchParams();
  const product = params.get("product");

  const InfoRow = ({ icon: Icon, label, value, href }: { icon: LucideIcon; label: string; value: string; href?: string }) => (
    <div className="card-ref px-5 py-4 flex gap-3.5 items-start">
      <Icon className="w-[18px] h-[18px] shrink-0 mt-0.5 text-ref-accent" strokeWidth={1.7} />
      <div className="min-w-0">
        <div className="meta-ref mb-1">{label}</div>
        {href
          ? <a href={href} className="text-[15px] font-medium text-ref-ink hover:text-ref-accent transition-colors break-all">{value}</a>
          : <span className="text-[15px] font-medium text-ref-ink">{value}</span>}
      </div>
    </div>
  );

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title={product ? `Request a quote for ${product}` : "Request a quote"}
        subtitle={
          product
            ? "We've started your request below — add your details and we'll respond with availability and pricing."
            : "Tell us what you need and we'll respond with availability and pricing — including hard-to-find finishing materials."
        }
      />

      <section className="sec bg-white">
        <div className="band-cards grid gap-5 lg:gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="grid gap-4 content-start">
            <InfoRow icon={Mail} label="Email" value={c.email} href={`mailto:${c.email}`} />
            {c.phone && <InfoRow icon={Phone} label="Phone" value={c.phone} href={`tel:${c.phone}`} />}
            <InfoRow icon={Clock} label="Hours" value={c.hours} />
            <InfoRow icon={MapPin} label="Location" value={c.address} />
            <div className="bg-ref-band text-white p-6 mt-1">
              <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-white/60">Since 1995</div>
              <p className="copy-sm !text-white/80 mt-2">
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
