import type { ReactNode } from "react";

/** Light, centered Apple-style hero used at the top of inner pages. */
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
    <section className="section-light border-b border-line">
      <div className="wrap py-16 lg:py-24 text-center max-w-3xl mx-auto">
        <span className="eyebrow-corp justify-center">{eyebrow}</span>
        <h1 className="text-[clamp(34px,5.4vw,64px)] font-semibold tracking-[-0.02em] text-corp-navy mt-4 leading-[1.04]">{title}</h1>
        {subtitle && <p className="text-[clamp(16px,2vw,20px)] text-corp-grey max-w-2xl mx-auto mt-5 leading-relaxed">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
