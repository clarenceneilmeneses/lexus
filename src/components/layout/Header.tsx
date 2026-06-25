import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import type { Category } from "../../lib/types";
import CategoryIcon from "../CategoryIcon";

const LINKS = [
  ["/", "Home"],
  ["/products", "Products"],
  ["/services", "Services"],
  ["/about", "About"],
  ["/contact", "Contact"],
] as const;

export function Brand({ className = "h-9", tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  // We only ship a white logo; on light backgrounds render it black via a filter.
  return (
    <Link to="/" className="flex items-center gap-3 group shrink-0" aria-label="Lexus Industrial — Home">
      <img
        src="/brand/logo-white.png"
        alt="Lexus Industrial Enterprise Corporation"
        className={cn(
          "w-auto object-contain transition-transform duration-200 group-hover:scale-[1.03]",
          tone === "dark" && "[filter:brightness(0)]",
          className
        )}
      />
    </Link>
  );
}

export default function Header({ categories = [] }: { categories?: Category[] }) {
  const [open, setOpen] = useState(false);
  const [mega, setMega] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loc = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on route change
  useEffect(() => { setOpen(false); setMega(false); }, [loc.pathname, loc.search]);

  const openMega = () => { if (closeT.current) clearTimeout(closeT.current); setMega(true); };
  const scheduleClose = () => { closeT.current = setTimeout(() => setMega(false), 120); };

  return (
    <header className="sticky top-0 z-50">
      {/* Main bar — light */}
      <div
        className={cn(
          "border-b transition-all duration-300",
          scrolled ? "bg-white/85 backdrop-blur-md border-line shadow-card" : "bg-corp-bg/90 backdrop-blur border-transparent"
        )}
      >
        <div className="wrap flex items-center justify-between h-[68px]">
          <Brand className="h-8 lg:h-9" tone="dark" />

          <nav className="hidden md:flex items-center gap-7">
            {LINKS.map(([to, label]) => {
              const isProducts = to === "/products";
              return (
                <div
                  key={to}
                  className="relative"
                  onMouseEnter={isProducts ? openMega : undefined}
                  onMouseLeave={isProducts ? scheduleClose : undefined}
                >
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      cn(
                        "relative font-display font-semibold text-[14.5px] py-2 hover:text-corp-orange transition-colors flex items-center gap-1",
                        (isActive && loc.pathname === to) || (isProducts && loc.pathname.startsWith("/products"))
                          ? "text-corp-orange"
                          : "text-corp-navy"
                      )
                    }
                  >
                    {label}
                    {isProducts && (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className={cn("transition-transform", mega && "rotate-180")}>
                        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </NavLink>
                </div>
              );
            })}
            <Link to="/contact" className="inline-flex items-center justify-center font-display font-semibold text-[13px] rounded-full px-5 py-2 bg-corp-orange text-white hover:bg-corp-orangeD transition-colors">Request a quote</Link>
          </nav>

          <button
            className="md:hidden w-10 h-10 grid place-items-center text-2xl text-corp-navy"
            aria-label="Toggle menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>

        {/* Mega menu */}
        {mega && categories.length > 0 && (
          <div
            className="absolute inset-x-0 top-full hidden md:block"
            onMouseEnter={openMega}
            onMouseLeave={scheduleClose}
          >
            <div className="wrap">
              <div className="bg-white border border-line rounded-b-2xl shadow-lift overflow-hidden animate-menu-in">
                <div className="grid grid-cols-[1fr_auto]">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="eyebrow-corp">Product catalog</span>
                      <Link to="/products" className="font-display font-semibold text-[13px] text-corp-orange hover:underline">
                        View all products →
                      </Link>
                    </div>
                    <div className="grid grid-cols-3 gap-x-5 gap-y-px">
                      {categories.map((c) => (
                        <Link
                          key={c.id}
                          to={`/products?cat=${c.slug}`}
                          className="group flex items-center gap-3 py-2 px-2 -mx-2 rounded-lg hover:bg-corp-soft transition-colors"
                        >
                          <span className="w-8 h-8 shrink-0 grid place-items-center rounded-lg bg-corp-bg text-corp-navy group-hover:bg-corp-navy group-hover:text-white transition-colors">
                            <CategoryIcon slug={c.slug} className="w-4 h-4" />
                          </span>
                          <span className="font-display font-semibold text-[13.5px] text-corp-navy leading-tight group-hover:text-corp-orange transition-colors">
                            {c.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <aside className="w-[260px] bg-corp-navy text-white p-6 flex flex-col justify-between">
                    <div>
                      <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-corp-orange font-bold">
                        Can't find it?
                      </span>
                      <h3 className="font-display font-semibold text-xl mt-3 leading-snug tracking-tight">
                        We source hard-to-find finishing materials.
                      </h3>
                      <p className="text-[13px] text-white/65 mt-2">
                        Tell us the spec and quantity — we'll get back fast.
                      </p>
                    </div>
                    <Link to="/contact" className="pill-orange text-[13px] px-5 py-2 mt-5 self-start">Request a quote</Link>
                  </aside>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-b border-line shadow-card animate-menu-in max-h-[calc(100vh-68px)] overflow-y-auto">
          <nav className="flex flex-col px-6 py-4">
            {LINKS.map(([to, label]) => (
              <Link
                key={to}
                to={to}
                className="font-display font-semibold text-[15px] py-2.5 border-b border-line text-corp-navy hover:text-corp-orange transition-colors"
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            ))}
            {categories.length > 0 && (
              <div className="py-3">
                <span className="eyebrow-corp mb-2">Categories</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      to={`/products?cat=${c.slug}`}
                      onClick={() => setOpen(false)}
                      className="font-mono text-[11px] uppercase tracking-wide border border-line rounded-full px-2.5 py-1 text-corp-grey hover:border-corp-orange hover:text-corp-orange transition-colors"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <Link to="/contact" className="pill-orange text-[13px] px-5 py-2 self-start mt-3" onClick={() => setOpen(false)}>
              Request a quote
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
