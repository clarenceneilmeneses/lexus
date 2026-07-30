import { useMemo, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { Search, SearchX, X } from "lucide-react";
import type { Catalog } from "../lib/types";
import ProductCard from "../components/ProductCard";
import PageHeader from "../components/PageHeader";
import Pagination from "../components/Pagination";
import CategoryIcon from "../components/CategoryIcon";
import { usePagination } from "../hooks/usePagination";

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

  const { page, setPage, totalPages, pageItems } = usePagination(filtered, 12, `${q}|${cat}`);

  return (
    <>
      <PageHeader
        eyebrow="Catalog"
        title="Products"
        subtitle="Interior finishings, boards, panels, drywall, ceiling systems and more — sourced from trusted brands and ready to quote."
      />

      <section className="sec bg-white">
        <div className="band-cards">
          {/* Search */}
          <div className="flex items-center gap-2.5 card-ref px-4 py-3 mb-5 max-w-xl mx-auto focus-within:border-ref-band transition-colors">
            <Search className="w-[18px] h-[18px] shrink-0 text-ref-body/60" strokeWidth={1.8} />
            <input
              className="flex-1 outline-none text-[15px] bg-transparent text-ref-ink placeholder:text-ref-body/50"
              placeholder="Search products, brands, part numbers…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            {q && (
              <button onClick={() => setQ("")} className="text-ref-body/60 hover:text-ref-ink transition-colors" aria-label="Clear search">
                <X className="w-4 h-4" strokeWidth={1.8} />
              </button>
            )}
          </div>

          {/* Filter chips */}
          <div className="flex gap-2 flex-wrap justify-center mb-6">
            <button className={cat === "all" ? "chip-ref-on" : "chip-ref"} onClick={() => setCat("all")}>
              All products
            </button>
            {catalog.categories.map((c) => (
              <button
                key={c.id}
                className={cat === c.slug ? "chip-ref-on" : "chip-ref"}
                onClick={() => setCat(c.slug)}
              >
                <CategoryIcon slug={c.slug} className="w-3.5 h-3.5 shrink-0" />
                {c.name}
              </button>
            ))}
          </div>

          <p className="meta-ref mb-6 text-center">
            {filtered.length} {filtered.length === 1 ? "item" : "items"}
            {cat !== "all" && catName ? ` · ${catName}` : ""}
          </p>

          {filtered.length ? (
            <>
              <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(258px,1fr))" }}>
                {pageItems.map((p) => <ProductCard key={p.id} p={p} />)}
              </div>
              <Pagination page={page} totalPages={totalPages} onPage={setPage} />
            </>
          ) : (
            <div className="card-ref text-center py-16 px-6">
              <SearchX className="w-8 h-8 mx-auto text-ref-body/40 mb-4" strokeWidth={1.5} />
              <h3 className="h-card text-ref-ink mb-1.5">No matches</h3>
              <p className="copy">
                Try a different keyword or{" "}
                <button onClick={() => { setQ(""); setCat("all"); }} className="link-ref !text-[inherit]">
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
