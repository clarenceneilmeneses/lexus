import { useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import type { Catalog } from "../lib/types";
import { cn, imgUrl, placeholder } from "../lib/utils";
import ProductCard from "../components/ProductCard";

export default function ProductDetail() {
  const { catalog } = useOutletContext<{ catalog: Catalog }>();
  const { slug } = useParams();
  const [idx, setIdx] = useState(0);
  const p = catalog.products.find((x) => x.slug === slug);

  if (!p) {
    return (
      <section className="py-24"><div className="wrap text-center">
        <div className="font-mono text-corp-orange text-sm">NOT FOUND</div>
        <h2 className="text-3xl font-semibold tracking-tight mt-2 mb-4">Product not found</h2>
        <Link to="/products" className="pill-orange">← Back to catalog</Link>
      </div></section>
    );
  }

  const cat = catalog.categories.find((c) => c.id === p.category_id);
  const gallery = p.images.length ? p.images.map((i) => imgUrl(i.storage_path)!) : [placeholder(p.name, p.model)];
  const related = catalog.products
    .filter((x) => x.id !== p.id && x.category_id === p.category_id)
    .slice(0, 4);

  return (
    <section className="py-12 lg:py-16">
      <div className="wrap">
        {/* Breadcrumb */}
        <div className="font-mono text-[12px] text-corp-grey mb-6 flex flex-wrap gap-1.5 items-center">
          <Link to="/products" className="hover:text-corp-orange transition-colors">Catalog</Link>
          {cat && (
            <>
              <span className="text-line">/</span>
              <Link to={`/products?cat=${cat.slug}`} className="hover:text-corp-orange transition-colors">{cat.name}</Link>
            </>
          )}
          <span className="text-line">/</span>
          <span className="text-corp-navy">{p.name}</span>
        </div>

        <div className="grid gap-10 lg:gap-14 lg:grid-cols-[1.05fr_1fr]">
          {/* Gallery */}
          <div>
            <div className="aspect-square bg-white border border-line rounded-3xl overflow-hidden shadow-card">
              <img src={gallery[idx]} alt={p.name} className="w-full h-full object-cover" />
            </div>
            {gallery.length > 1 && (
              <div className="flex gap-2.5 mt-3 flex-wrap">
                {gallery.map((g, i) => (
                  <button
                    key={i}
                    onClick={() => setIdx(i)}
                    className={cn(
                      "w-[74px] h-[74px] border rounded-2xl overflow-hidden bg-white transition-all",
                      i === idx ? "border-corp-orange border-2" : "border-line hover:border-corp-navy"
                    )}
                  >
                    <img src={g} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {cat && <Link to={`/products?cat=${cat.slug}`} className="tag hover:border-corp-orange hover:text-corp-orange transition-colors">{cat.name}</Link>}
            <h1 className="text-[clamp(28px,4vw,44px)] font-semibold tracking-tight mt-3 mb-2 leading-tight text-corp-navy">{p.name}</h1>
            <div className="font-mono text-[13px] text-corp-orange mb-4">
              {p.brand ? `${p.brand} · ` : ""}MODEL {p.model || "—"}
            </div>
            {p.short_description && <p className="text-base text-corp-grey leading-relaxed">{p.short_description}</p>}

            {p.specs.length > 0 && (
              <div className="mt-6 border border-line rounded-3xl overflow-hidden shadow-card">
                <div className="font-mono text-[11px] tracking-[0.1em] uppercase text-corp-grey bg-corp-bg px-4 py-2.5 border-b border-line">
                  Specifications
                </div>
                <table className="w-full border-collapse">
                  <tbody>
                    {p.specs.map((s, i) => (
                      <tr key={i} className="border-b border-line last:border-0">
                        <td className="font-mono text-[12.5px] text-corp-grey bg-corp-bg/60 px-4 py-3 w-[42%]">{s.label}</td>
                        <td className="text-sm px-4 py-3 text-corp-navy">{s.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex items-center gap-4 mt-7 flex-wrap">
              <span className="font-mono text-lg font-bold text-corp-navy">{p.price_text || "Request a quote"}</span>
              <Link to={`/contact?product=${encodeURIComponent(p.name)}`} className="pill-orange">Request a quote</Link>
            </div>

            {p.description && (
              <div className="border-t border-line pt-5 mt-7">
                <h4 className="font-mono text-[12px] tracking-[0.1em] text-corp-grey uppercase mb-2.5">Description</h4>
                <p className="text-corp-grey leading-relaxed whitespace-pre-wrap">{p.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-20">
            <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
              <div>
                <span className="eyebrow-corp">Same category</span>
                <h2 className="text-[clamp(22px,2.6vw,32px)] font-semibold tracking-tight text-corp-navy mt-2">Related products</h2>
              </div>
              {cat && <Link to={`/products?cat=${cat.slug}`} className="pill-outline">View all</Link>}
            </div>
            <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(258px,1fr))" }}>
              {related.map((r) => <ProductCard key={r.id} p={r} />)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
