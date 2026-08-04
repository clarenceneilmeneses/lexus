import { useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import type { Catalog } from "../lib/types";
import { cn, imgUrl, placeholder, primaryImage } from "../lib/utils";
import ProductCard from "../components/ProductCard";
import CategoryIcon from "../components/CategoryIcon";
import { useSeo, useJsonLd, productSchema, breadcrumbSchema } from "../lib/seo";

export default function ProductDetail() {
  const { catalog } = useOutletContext<{ catalog: Catalog }>();
  const { slug } = useParams();
  const [idx, setIdx] = useState(0);
  const p = catalog.products.find((x) => x.slug === slug);
  const category = catalog.categories.find((c) => c.id === p?.category_id);
  const heroImage = p ? primaryImage(p) : null;

  // Hooks must run on every render, including the "not found" branch below.
  useSeo(
    p
      ? {
          title: [p.brand, p.name, p.model].filter(Boolean).join(" "),
          description:
            p.short_description ||
            p.description ||
            `${p.name}${category ? ` — ${category.name}` : ""} available from Lexus Industrial. Request a quote for wholesale or retail supply in Metro Manila and nationwide.`,
          image: heroImage,
          type: "product",
        }
      : { title: "Product not found", noindex: true },
    catalog.settings
  );
  useJsonLd(
    "product",
    p
      ? productSchema({
          name: p.name,
          slug: p.slug,
          brand: p.brand,
          model: p.model,
          description: p.short_description || p.description,
          image: heroImage!,
          category: category?.name,
        })
      : null
  );
  useJsonLd(
    "breadcrumb",
    p
      ? breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Products", path: "/products" },
          ...(category ? [{ name: category.name, path: `/products?cat=${category.slug}` }] : []),
          { name: p.name, path: `/products/${p.slug}` },
        ])
      : null
  );

  if (!p) {
    return (
      <section className="sec bg-ref-off"><div className="band py-16 text-center">
        <div className="font-mono text-[12px] uppercase tracking-[0.14em] text-ref-accent">Not found</div>
        <h2 className="h-sec text-ref-ink mt-3 mb-6">Product not found</h2>
        <Link to="/products" className="btn-ref-accent">
          <ArrowLeft className="w-4 h-4" strokeWidth={1.9} /> Back to catalog
        </Link>
      </div></section>
    );
  }

  const cat = category;
  const gallery = p.images.length ? p.images.map((i) => imgUrl(i.storage_path)!) : [placeholder(p.name, p.model)];
  const related = catalog.products
    .filter((x) => x.id !== p.id && x.category_id === p.category_id)
    .slice(0, 4);

  return (
    <section className="sec bg-white">
      <div className="band-cards">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="font-mono text-[12px] text-ref-body/70 mb-7 flex flex-wrap gap-1 items-center">
          <Link to="/products" className="hover:text-ref-accent transition-colors">Catalog</Link>
          {cat && (
            <>
              <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-50" strokeWidth={2} />
              <Link to={`/products?cat=${cat.slug}`} className="hover:text-ref-accent transition-colors">{cat.name}</Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-50" strokeWidth={2} />
          <span className="text-ref-ink">{p.name}</span>
        </nav>

        <div className="grid gap-8 lg:gap-12 lg:grid-cols-[1.05fr_1fr]">
          {/* Gallery */}
          <div>
            <div className="aspect-square card-ref overflow-hidden">
              <img src={gallery[idx]} alt={p.name} className="w-full h-full object-cover" />
            </div>
            {gallery.length > 1 && (
              <div className="flex gap-2.5 mt-2.5 flex-wrap">
                {gallery.map((g, i) => (
                  <button
                    key={i}
                    onClick={() => setIdx(i)}
                    aria-label={`View image ${i + 1}`}
                    className={cn(
                      "w-[74px] h-[74px] border overflow-hidden bg-white transition-colors",
                      i === idx ? "border-ref-accent" : "border-ref-hair hover:border-ref-band"
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
            {cat && (
              <Link
                to={`/products?cat=${cat.slug}`}
                className="inline-flex items-center gap-1.5 meta-ref border border-ref-hair px-2.5 py-1.5 hover:border-ref-band hover:text-ref-band transition-colors"
              >
                <CategoryIcon slug={cat.slug} className="w-3.5 h-3.5" />
                {cat.name}
              </Link>
            )}
            <h1 className="h-hero text-ref-ink mt-4 mb-2">{p.name}</h1>
            <div className="font-mono text-[13px] uppercase tracking-[0.06em] text-ref-accent mb-5">
              {p.brand ? `${p.brand} · ` : ""}Model {p.model || "—"}
            </div>
            {p.short_description && <p className="copy">{p.short_description}</p>}

            {p.specs.length > 0 && (
              <div className="mt-7 card-ref overflow-hidden">
                <div className="meta-ref bg-ref-off px-4 py-3 border-b border-ref-hair">Specifications</div>
                <table className="w-full border-collapse">
                  <tbody>
                    {p.specs.map((s, i) => (
                      <tr key={i} className="border-b border-ref-hair last:border-0">
                        <td className="font-mono text-[12.5px] text-ref-body bg-ref-off/60 px-4 py-3 w-[42%] align-top">{s.label}</td>
                        <td className="text-[14px] px-4 py-3 text-ref-ink">{s.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex items-center gap-5 mt-8 flex-wrap">
              {p.price_text && <span className="num text-[19px] text-ref-ink">{p.price_text}</span>}
              <Link to={`/contact?product=${encodeURIComponent(p.name)}`} className="btn-ref-accent">Request a quote</Link>
            </div>

            {p.description && (
              <div className="border-t border-ref-hair pt-6 mt-8">
                <h4 className="meta-ref mb-3">Description</h4>
                <p className="copy whitespace-pre-wrap">{p.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-20">
            <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
              <div>
                <span className="eyebrow-rule start">Same category</span>
                <h2 className="h-sec text-ref-ink mt-3">Related products</h2>
              </div>
              {cat && <Link to={`/products?cat=${cat.slug}`} className="link-ref">View all</Link>}
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
