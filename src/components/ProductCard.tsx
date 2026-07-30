import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { Product } from "../lib/types";
import { primaryImage } from "../lib/utils";

export default function ProductCard({ p }: { p: Product }) {
  return (
    <Link
      to={`/products/${p.slug}`}
      className="group card-ref flex flex-col hover:border-ref-band transition-colors"
    >
      <div className="relative aspect-[3/4] bg-ref-grey overflow-hidden">
        {p.is_featured && (
          <span className="absolute top-0 left-0 z-10 bg-ref-accent text-white font-mono text-[10px] uppercase tracking-[0.1em] px-2.5 py-1.5">
            Featured
          </span>
        )}
        <img
          loading="lazy"
          src={primaryImage(p)}
          alt={p.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <div className="p-5 flex flex-col gap-1.5 flex-1">
        <span className="font-mono text-[11px] uppercase tracking-[0.09em] text-ref-accent">
          {p.brand ? `${p.brand} · ` : ""}{p.model || "—"}
        </span>
        <h3 className="h-card text-ref-ink">{p.name}</h3>
        <p className="copy-sm flex-1 line-clamp-2">{p.short_description}</p>
        <div className="flex items-center justify-between gap-2 pt-3 mt-1 border-t border-ref-hair">
          {/* DM Mono is for numerics — the non-numeric fallback stays in DM Sans. */}
          {p.price_text
            ? <span className="num text-[13px] text-ref-ink">{p.price_text}</span>
            : <span className="text-[13px] font-medium text-ref-body">Request a quote</span>}
          <ArrowRight className="w-4 h-4 shrink-0 text-ref-accent transition-transform group-hover:translate-x-0.5" strokeWidth={1.8} />
        </div>
      </div>
    </Link>
  );
}
