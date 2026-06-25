import { useEffect, useState } from "react";
import { cn } from "../lib/utils";

export interface Section { id: string; label: string; }

/** Fixed vertical scroll-spy on the right edge — shows which homepage section
 *  is in view and lets you jump between them. Uses mix-blend so the dots stay
 *  visible over both the dark hero and the light sections. */
export default function SectionNav({ sections }: { sections: Section[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => !!el);
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections]);

  return (
    <nav aria-label="Section navigation" className="hidden xl:flex fixed right-7 top-1/2 -translate-y-1/2 z-30 flex-col gap-3.5">
      {sections.map((s) => {
        const on = active === s.id;
        return (
          <a key={s.id} href={`#${s.id}`} className="group flex items-center justify-end gap-2.5" aria-current={on ? "true" : undefined}>
            <span
              className={cn(
                "font-mono text-[10px] uppercase tracking-[0.14em] transition-opacity text-white mix-blend-difference",
                on ? "opacity-100" : "opacity-0 group-hover:opacity-80"
              )}
            >
              {s.label}
            </span>
            <span
              className={cn(
                "rounded-full transition-all duration-300",
                on
                  ? "w-3 h-3 bg-corp-orange"
                  : "w-2.5 h-2.5 bg-white/70 mix-blend-difference group-hover:scale-110"
              )}
            />
          </a>
        );
      })}
    </nav>
  );
}
