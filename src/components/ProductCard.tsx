import { Link } from "react-router-dom";
import type { Product } from "../lib/types";
import { primaryImage } from "../lib/utils";

export default function ProductCard({ p }: { p: Product }) {
  return (
    <Link
      to={`/products/${p.slug}`}
      className="group bg-white border border-line rounded-3xl overflow-hidden flex flex-col shadow-card transition-all duration-300 ease-smooth hover:border-corp-orange hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative aspect-square bg-corp-bg overflow-hidden">
        {p.is_featured && (
          <span className="absolute top-3 left-3 bg-corp-orange text-white font-mono text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full z-10">
            Featured
          </span>
        )}
        <img
          loading="lazy"
          src={primaryImage(p)}
          alt={p.name}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-smooth group-hover:scale-[1.04]"
        />
      </div>
      <div className="p-5 flex flex-col gap-1.5 flex-1">
        <span className="font-mono text-[11px] text-corp-orange tracking-wide">
          {p.brand ? `${p.brand} · ` : ""}{p.model || "—"}
        </span>
        <h3 className="text-[17px] font-display font-semibold tracking-tight leading-tight text-corp-navy">{p.name}</h3>
        <p className="text-[13.5px] text-corp-grey flex-1 line-clamp-2">{p.short_description}</p>
        <div className="flex items-center justify-between pt-3 mt-1 border-t border-line">
          <span className="font-mono text-[13px] font-bold text-corp-navy">{p.price_text || "Request a quote"}</span>
          <span className="font-display font-semibold text-[13px] text-corp-orange group-hover:translate-x-0.5 transition-transform">View ›</span>
        </div>
      </div>
    </Link>
  );
}
