import type { ReactNode } from "react";

/** Centred page intro used at the top of inner pages — the reference's
 *  eyebrow-with-rules + heading + lede, on the off-white band. */
export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <section className="bg-ref-off border-b border-ref-hair">
      <div className="band py-[52px] lg:py-[70px] text-center">
        <span className="eyebrow-rule center">{eyebrow}</span>
        <h1 className="h-hero text-ref-ink mt-5 max-w-3xl mx-auto">{title}</h1>
        {subtitle && <p className="copy max-w-2xl mx-auto mt-5">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
