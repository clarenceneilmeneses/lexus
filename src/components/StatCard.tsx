import type { ReactNode } from "react";
import { cn } from "../lib/utils";

export type StatTone = "navy" | "orange" | "green" | "steel";

const TONES: Record<StatTone, string> = {
  navy: "text-corp-navy",
  orange: "text-corp-orange",
  green: "text-[#137A43]",
  steel: "text-steel",
};

export function StatCard({
  label,
  value,
  tone = "navy",
  hint,
}: {
  label: string;
  value: number | string;
  tone?: StatTone;
  hint?: string;
}) {
  return (
    <div className="panel">
      <div className={cn("font-display font-black text-[34px] leading-none", TONES[tone])}>{value}</div>
      <div className="font-mono text-[11px] tracking-[0.1em] uppercase text-steel mt-2">{label}</div>
      {hint && <div className="text-[12px] text-steel mt-1">{hint}</div>}
    </div>
  );
}

/** Responsive row of stat cards — wraps to fit however many are passed. */
export function StatRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("grid gap-4 mb-6 grid-cols-[repeat(auto-fit,minmax(150px,1fr))]", className)}>
      {children}
    </div>
  );
}
