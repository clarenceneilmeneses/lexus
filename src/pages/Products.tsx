import { useMemo, useState } from "react";
import { Link, useOutletContext, useSearchParams } from "react-router-dom";
import type { Catalog } from "../lib/types";
import ProductCard from "../components/ProductCard";
import PageHeader from "../components/PageHeader";
import { cn } from "../lib/utils";

export default function Products() {
  const { catalog } = useOutletContext<{ catalog: Catalog }>();
  const [params, setParams] = useSearchParams();
  const cat = params.get("cat") ?? "all";
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const t = q.toLowerCase();
    return catalog.products.filter((p) => {
      const okCat = cat === "all" || catalog.categories.find((c) => c.id === p.category_id)?.slug === cat;
      const hay = [p.name, p.brand, p.model, p.short_description, p.description].join(" ").toLowerCase();
      return okCat && (!t || hay.includes(t));
    });
  }, [q, cat, catalog]);

  const setCat = (slug: string) => setParams(slug === "all" ? {} : { cat: slug });
  const catName = catalog.categories.find((c) => c.slug === cat)?.name;

  return (
    <>
      <PageHeader
        eyebrow="Catalog"
        title="Products"
        subtitle="Interior finishings, boards, panels, drywall, ceiling systems and more — sourced from trusted brands and ready to quote."
      />

      <section className="py-12 lg:py-16">
        <div className="wrap">
          {/* Search */}
          <div className="flex items-center gap-2.5 bg-white border border-line rounded-full shadow-card px-5 py-3 mb-6 max-w-xl mx-auto">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-corp-grey">
              <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" strokeLinecap="round" />
            </svg>
            <input
              className="flex-1 outline-none text-[15px] bg-transparent placeholder:text-steel-2"
              placeholder="Search products, brands, part numbers…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            {q && (
              <button onClick={() => setQ("")} className="text-steel-2 hover:text-corp-navy text-lg leading-none" aria-label="Clear">×</button>
            )}
          </div>

          {/* Filter chips */}
          <div className="flex gap-2 flex-wrap justify-center mb-8">
            <button
              className={cn(
                "font-display font-semibold text-[13px] border rounded-full px-4 py-2 transition-colors",
                cat === "all" ? "bg-corp-navy text-white border-corp-navy" : "bg-white border-line text-corp-navy hover:border-corp-navy"
              )}
              onClick={() => setCat("all")}
            >
              All products
            </button>
            {catalog.categories.map((c) => (
              <button
                key={c.id}
                className={cn(
                  "font-display font-semibold text-[13px] border rounded-full px-4 py-2 transition-colors",
                  cat === c.slug ? "bg-corp-navy text-white border-corp-navy" : "bg-white border-line text-corp-navy hover:border-corp-navy"
                )}
                onClick={() => setCat(c.slug)}
              >
                {c.name}
              </button>
            ))}
          </div>

          <p className="font-mono text-[12px] tracking-wide uppercase text-corp-grey mb-6 text-center">
            {filtered.length} {filtered.length === 1 ? "item" : "items"}
            {cat !== "all" && catName ? ` · ${catName}` : ""}
          </p>

          {filtered.length ? (
            <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(258px,1fr))" }}>
              {filtered.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          ) : (
            <div className="bg-white border border-line rounded-3xl text-center py-16">
              <h3 className="text-xl font-semibold tracking-tight mb-1.5">No matches</h3>
              <p className="text-corp-grey">
                Try a different keyword or{" "}
                <button onClick={() => { setQ(""); setCat("all"); }} className="text-corp-orange font-semibold hover:underline">
                  clear the filters
                </button>.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
