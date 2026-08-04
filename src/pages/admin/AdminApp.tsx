import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard, Boxes, LayoutGrid, MessageSquare, PenLine, Users, ScrollText,
  Settings, ChevronLeft, ChevronRight, ExternalLink, LogOut, Menu, X, type LucideIcon,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useCatalog } from "../../hooks/useCatalog";
import { cn } from "../../lib/utils";
import type { Role } from "../../lib/types";
import Login from "./Login";
import Dashboard from "./Dashboard";
import ProductsPanel from "./ProductsPanel";
import CategoriesPanel from "./CategoriesPanel";
import InquiriesPanel from "./InquiriesPanel";
import ContentPanel from "./ContentPanel";
import UsersPanel from "./UsersPanel";
import LogsPanel from "./LogsPanel";
import SettingsPanel from "./SettingsPanel";

type Tab = "dashboard" | "products" | "categories" | "inquiries" | "content" | "users" | "logs" | "settings";
type NavItem = { key: Tab; label: string; icon: LucideIcon; adminOnly?: boolean };

// Nav in labelled groups — the section captions give the rail a scannable
// rhythm instead of one long list. adminOnly=false → visible to anyone signed
// in (read-only is fine).
const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "General",
    items: [{ key: "dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Catalog",
    items: [
      { key: "products", label: "Products", icon: Boxes },
      { key: "categories", label: "Categories", icon: LayoutGrid },
    ],
  },
  {
    label: "Content",
    items: [
      { key: "inquiries", label: "Inquiries", icon: MessageSquare },
      { key: "content", label: "Site content", icon: PenLine },
    ],
  },
  {
    label: "Administration",
    items: [
      { key: "users", label: "Users", icon: Users, adminOnly: true },
      { key: "logs", label: "Activity log", icon: ScrollText, adminOnly: true },
      { key: "settings", label: "Settings", icon: Settings, adminOnly: true },
    ],
  },
];

const ALL_NAV = NAV_GROUPS.flatMap((g) => g.items);

// Role pill, tuned for the light chrome.
const ROLE_PILL: Record<Role, string> = {
  admin: "border-accent/25 text-accent bg-accent-soft/60",
  editor: "border-[#137A43]/30 text-[#137A43] bg-[#137A43]/8",
  viewer: "border-steel/25 text-steel bg-black/[0.03]",
};

export default function AdminApp() {
  const { session, role, isAdmin, can, loading, signOut } = useAuth();
  const { catalog, reload, error } = useCatalog(true); // admin: include unpublished
  const [tab, setTab] = useState<Tab>("dashboard");
  const [navOpen, setNavOpen] = useState(false); // mobile drawer
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem("admin.sidebar.collapsed") === "1"; } catch { return false; }
  });
  useEffect(() => {
    try { localStorage.setItem("admin.sidebar.collapsed", collapsed ? "1" : "0"); } catch { /* ignore */ }
  }, [collapsed]);

  if (loading) return <div className="min-h-screen grid place-items-center font-mono text-steel">Loading…</div>;
  if (!session) return <Login />;

  // Signed in but no admin-dashboard access at all (no role row / unknown).
  if (!role) {
    return (
      <div className="admin-ui min-h-screen grid place-items-center bg-paper">
        <div className="panel max-w-md text-center">
          <h2 className="text-xl mb-2">Not authorized</h2>
          <p className="text-steel text-sm mb-4">
            This account is signed in but has no role yet. Ask an existing admin to grant access.
          </p>
          <button className="btn btn-ghost btn-sm" onClick={signOut}>Sign out</button>
        </div>
      </div>
    );
  }

  const displayName = (session.user.email?.split("@")[0] || "there")
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const currentLabel = ALL_NAV.find((n) => n.key === tab)?.label ?? "Dashboard";

  function NavButton({ n }: { n: NavItem }) {
    const Icon = n.icon;
    const active = tab === n.key;
    return (
      <button
        onClick={() => { setTab(n.key); setNavOpen(false); }}
        title={collapsed ? n.label : undefined}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 w-full rounded-xl font-medium text-[14px] transition-colors px-3 py-2.5 border",
          collapsed && "md:justify-center md:px-0",
          active
            ? "bg-accent-soft/70 border-accent/25 text-accent"
            : "border-transparent text-[#5a6270] hover:bg-black/[0.035] hover:text-ink"
        )}
      >
        <Icon className="w-[18px] h-[18px] flex-none" strokeWidth={1.8} />
        <span className={cn("truncate", collapsed && "md:hidden")}>{n.label}</span>
      </button>
    );
  }

  return (
    <div className="admin-ui min-h-screen bg-paper md:flex md:gap-3 md:p-3">
      {/* ===== Sidebar — brand, grouped nav, sign out ===== */}
      <aside
        className={cn(
          "fixed z-50 inset-y-0 left-0 w-[248px] h-screen shrink-0 bg-white flex flex-col transition-all duration-200",
          "md:sticky md:top-3 md:self-start md:h-[calc(100vh-1.5rem)] md:rounded-2xl md:ring-1 md:ring-line md:shadow-card md:translate-x-0",
          collapsed ? "md:w-[54px]" : "md:w-[228px]",
          navOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand + collapse toggle */}
        <div className={cn("flex items-center gap-2 h-[58px] flex-none px-3 border-b border-line-2", collapsed && "md:justify-center md:px-1.5")}>
          <img
            src="/lexus/lexus-logo.png"
            alt="Lexus Industrial"
            className={cn("object-contain flex-none", collapsed ? "h-8 w-auto md:w-[38px] md:h-auto" : "h-8 w-auto")}
          />
          <button
            onClick={() => setCollapsed((v) => !v)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "ml-auto flex-none hidden md:grid place-items-center w-7 h-7 rounded-lg border border-line text-steel hover:text-ink hover:bg-black/[0.035] transition-colors",
              collapsed && "md:hidden"
            )}
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2} />
          </button>
          <button
            aria-label="Close menu"
            onClick={() => setNavOpen(false)}
            className="ml-auto md:hidden grid place-items-center w-8 h-8 rounded-lg text-steel hover:bg-black/5"
          >
            <X className="w-[18px] h-[18px]" strokeWidth={1.9} />
          </button>
        </div>

        {/* Expand affordance when collapsed (the header toggle is hidden then) */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            title="Expand sidebar"
            aria-label="Expand sidebar"
            className="hidden md:grid place-items-center w-7 h-7 mx-auto mt-3 flex-none rounded-lg border border-line text-steel hover:text-ink hover:bg-black/[0.035] transition-colors"
          >
            <ChevronRight className="w-4 h-4" strokeWidth={2} />
          </button>
        )}

        <nav className={cn("flex-1 overflow-y-auto overflow-x-hidden min-h-0 py-3", collapsed ? "px-2 md:px-1.5" : "px-3")}>
          {NAV_GROUPS.map((group) => {
            const items = group.items.filter((n) => !n.adminOnly || isAdmin);
            if (!items.length) return null;
            return (
              <div key={group.label} className="mb-3 last:mb-0">
                <div
                  className={cn(
                    "font-mono text-[10px] uppercase tracking-[0.16em] text-steel-2 px-3 pb-1.5 pt-1",
                    collapsed && "md:hidden"
                  )}
                >
                  {group.label}
                </div>
                {/* Collapsed: a hairline stands in for the group caption */}
                <div className={cn("hidden mx-2 my-2 h-px bg-line-2", collapsed && "md:block")} />
                <div className="space-y-0.5">
                  {items.map((n) => <NavButton key={n.key} n={n} />)}
                </div>
              </div>
            );
          })}
        </nav>

        <div className={cn("flex-none border-t border-line-2 p-2", collapsed && "md:px-1.5")}>
          <button
            onClick={signOut}
            title={collapsed ? "Sign out" : undefined}
            className={cn(
              "flex items-center gap-3 w-full rounded-xl px-3 py-2.5 font-medium text-[14px] text-flag hover:bg-flag/8 transition-colors",
              collapsed && "md:justify-center md:px-0"
            )}
          >
            <LogOut className="w-[18px] h-[18px] flex-none" strokeWidth={1.8} />
            <span className={cn(collapsed && "md:hidden")}>Sign out</span>
          </button>
        </div>
      </aside>

      {/* backdrop for mobile drawer */}
      {navOpen && <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setNavOpen(false)} />}

      {/* ===== Main column ===== */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar — breadcrumb left, account actions right */}
        <header className="sticky top-0 md:top-3 z-30 flex-none h-[58px] bg-white ring-1 ring-line shadow-card md:rounded-2xl flex items-center gap-3 px-3 md:px-5">
          <button
            aria-label="Open menu"
            onClick={() => setNavOpen(true)}
            className="md:hidden grid place-items-center w-9 h-9 rounded-lg text-ink hover:bg-black/5 flex-none"
          >
            <Menu className="w-5 h-5" strokeWidth={1.9} />
          </button>

          <nav aria-label="Breadcrumb" className="flex items-center gap-2 min-w-0">
            <span className="hidden sm:inline text-[14px] text-steel truncate">Lexus Industrial</span>
            <ChevronRight className="hidden sm:block w-4 h-4 text-steel-2 flex-none" strokeWidth={2} />
            <span className="font-display font-semibold text-[15px] text-ink truncate">{currentLabel}</span>
          </nav>

          <div className="ml-auto flex items-center gap-2 flex-none">
            <Link
              to="/"
              className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-xl border border-line text-[13px] text-steel hover:text-ink hover:bg-black/[0.035] transition-colors"
            >
              <ExternalLink className="w-[15px] h-[15px]" strokeWidth={1.9} /> View site
            </Link>
            <Link
              to="/"
              aria-label="View site"
              className="sm:hidden grid place-items-center w-9 h-9 rounded-xl border border-line text-steel hover:text-ink"
            >
              <ExternalLink className="w-[16px] h-[16px]" strokeWidth={1.9} />
            </Link>

            <span className={cn("hidden md:inline font-mono text-[10px] uppercase tracking-[0.14em] border rounded px-1.5 py-0.5", ROLE_PILL[role])}>
              {role}
            </span>

            <span
              className="grid place-items-center w-9 h-9 rounded-full bg-accent-soft text-accent font-display font-semibold text-[14px] flex-none"
              title={session.user.email ?? undefined}
            >
              {displayName[0]?.toUpperCase() ?? "?"}
            </span>
          </div>
        </header>

        {/* One surface for every tab — left-aligned, full width of the column */}
        <main className="flex-1 mt-3 bg-white ring-1 ring-line shadow-card md:rounded-2xl px-4 md:px-6 py-5 md:py-6">
          {error && <div className="bg-[#FDECEA] border border-[#F5C2BA] text-[#B23120] px-3.5 py-3 rounded text-[13.5px] mb-4">{error}</div>}
          {!catalog ? (
            <p className="font-mono text-steel">Loading data…</p>
          ) : (
            <>
              {tab === "dashboard" && <Dashboard catalog={catalog} go={(t) => setTab(t)} />}
              {tab === "products" && <ProductsPanel catalog={catalog} reload={reload} canWrite={can("products")} />}
              {tab === "categories" && <CategoriesPanel catalog={catalog} reload={reload} canWrite={can("categories")} />}
              {tab === "inquiries" && <InquiriesPanel canWrite={can("inquiries")} canDelete={isAdmin} />}
              {tab === "content" && <ContentPanel catalog={catalog} reload={reload} canWrite={can("content")} />}
              {tab === "users" && (isAdmin ? <UsersPanel /> : <NoAccess />)}
              {tab === "logs" && (isAdmin ? <LogsPanel /> : <NoAccess />)}
              {tab === "settings" && (isAdmin ? <SettingsPanel catalog={catalog} reload={reload} /> : <NoAccess />)}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function NoAccess() {
  return (
    <div className="panel max-w-md">
      <h2 className="text-xl mb-2">Admins only</h2>
      <p className="text-steel text-sm">This section requires the <b>admin</b> role.</p>
    </div>
  );
}
