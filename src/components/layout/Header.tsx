import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
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
  // Full-colour brand logo (navy mark + red star). The PNG has a transparent
  // surround, so on light backgrounds (tone="dark") it sits flush; on dark
  // backgrounds (tone="light") we set it on a white badge so the navy stays legible.
  const img = (
    <img
      src="/lexus/lexus-logo.png"
      alt="Lexus Industrial Enterprise Corporation"
      className={cn("w-auto object-contain transition-transform duration-200 group-hover:scale-[1.03]", className)}
    />
  );
  return (
    <Link to="/" className="flex items-center gap-3 group shrink-0" aria-label="Lexus Industrial — Home">
      {tone === "light"
        ? <span className="inline-flex items-center bg-white px-3 py-2">{img}</span>
        : img}
    </Link>
  );
}

/** Uppercase, letter-spaced nav link — the reference's 12px menu voice. */
const navLink = "font-ui font-semibold text-[12px] uppercase tracking-[0.1em] leading-none transition-colors";

export default function Header({ categories = [] }: { categories?: Category[] }) {
  const [open, setOpen] = useState(false);
  const [mega, setMega] = useState(false);
  const closeT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loc = useLocation();

  // Close menus on route change
  useEffect(() => { setOpen(false); setMega(false); }, [loc.pathname, loc.search]);

  const openMega = () => { if (closeT.current) clearTimeout(closeT.current); setMega(true); };
  const scheduleClose = () => { closeT.current = setTimeout(() => setMega(false), 120); };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#f1f1f1]">
      {/* Three-part bar: logo left, centred nav, action right (reference 20/60/20) */}
      <div className="band flex items-center justify-between gap-6 h-[74px]">
        <Brand className="h-9 lg:h-10" tone="dark" />

        <nav className="hidden lg:flex items-center justify-center gap-[22px] flex-1">
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
                      navLink,
                      "flex items-center gap-1.5 py-2 hover:text-ref-accent",
                      (isActive && loc.pathname === to) || (isProducts && loc.pathname.startsWith("/products"))
                        ? "text-ref-accent"
                        : "text-ref-ink"
                    )
                  }
                >
                  {label}
                  {isProducts && (
                    <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", mega && "rotate-180")} strokeWidth={2.2} />
                  )}
                </NavLink>
              </div>
            );
          })}
        </nav>

        <div className="hidden lg:block shrink-0">
          <Link to="/contact" className="btn-ref-accent !text-[13px] !px-6 !py-3.5">Request a quote</Link>
        </div>

        <button
          className="lg:hidden w-10 h-10 grid place-items-center text-ref-ink"
          aria-label="Toggle menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="w-6 h-6" strokeWidth={1.8} /> : <Menu className="w-6 h-6" strokeWidth={1.8} />}
        </button>
      </div>

      {/* Mega menu — full-width panel, as on the reference */}
      {mega && categories.length > 0 && (
        <div
          className="absolute inset-x-0 top-full hidden lg:block bg-white border-y border-[#f1f1f1] shadow-[0_18px_44px_-30px_rgba(14,14,35,.4)] animate-menu-in"
          onMouseEnter={openMega}
          onMouseLeave={scheduleClose}
        >
          <div className="band grid grid-cols-[1fr_300px] gap-10 py-9">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="eyebrow-rule start">Product catalog</span>
                <Link to="/products" className="link-ref !text-[14px]">View all products</Link>
              </div>
              <div className="grid grid-cols-3 gap-x-8 gap-y-1">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    to={`/products?cat=${c.slug}`}
                    className="group flex items-center gap-3 py-2 text-ref-ink hover:text-ref-accent transition-colors"
                  >
                    <CategoryIcon slug={c.slug} className="w-4 h-4 shrink-0 text-ref-band group-hover:text-ref-accent transition-colors" />
                    <span className="font-ui font-medium text-[14.5px] leading-tight">{c.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            <aside className="bg-ref-band text-white p-8 flex flex-col justify-between">
              <div>
                <span className="font-ui font-semibold text-[12px] uppercase tracking-[0.1em] text-white/60">
                  Can't find it?
                </span>
                <h3 className="h-card text-white mt-3">We source hard-to-find finishing materials.</h3>
                <p className="copy-sm !text-white/70 mt-3">
                  Tell us the spec and quantity — we'll get back fast.
                </p>
              </div>
              <Link to="/contact" className="btn-ref-accent !text-[13px] !px-6 !py-3.5 mt-7 self-start">
                Request a quote
              </Link>
            </aside>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-white border-b border-[#f1f1f1] animate-menu-in max-h-[calc(100vh-74px)] overflow-y-auto">
          <nav className="band flex flex-col py-4">
            {LINKS.map(([to, label]) => (
              <Link
                key={to}
                to={to}
                className={cn(navLink, "py-4 border-b border-[#f1f1f1] text-ref-ink hover:text-ref-accent")}
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            ))}
            {categories.length > 0 && (
              <div className="py-5">
                <span className="eyebrow-rule start">Categories</span>
                <div className="grid grid-cols-2 gap-x-6 mt-3">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      to={`/products?cat=${c.slug}`}
                      onClick={() => setOpen(false)}
                      className="font-ui font-medium text-[14px] py-2 text-ref-body hover:text-ref-accent transition-colors"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <Link to="/contact" className="btn-ref-accent !text-[13px] self-start mb-2" onClick={() => setOpen(false)}>
              Request a quote
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
