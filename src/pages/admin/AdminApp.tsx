import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard, Boxes, LayoutGrid, MessageSquare, PenLine, Users, ScrollText,
  Settings, ChevronLeft, ExternalLink, LogOut, Menu, type LucideIcon,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useCatalog } from "../../hooks/useCatalog";
import { Brand } from "../../components/layout/Header";
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

// adminOnly=false → visible to everyone signed in (read-only ok).
const NAV: { key: Tab; label: string; icon: LucideIcon; adminOnly?: boolean }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "products", label: "Products", icon: Boxes },
  { key: "categories", label: "Categories", icon: LayoutGrid },
  { key: "inquiries", label: "Inquiries", icon: MessageSquare },
  { key: "content", label: "Content", icon: PenLine },
  { key: "users", label: "Users", icon: Users, adminOnly: true },
  { key: "logs", label: "Activity log", icon: ScrollText, adminOnly: true },
  { key: "settings", label: "Settings", icon: Settings, adminOnly: true },
];

const ROLE_PILL: Record<Role, string> = {
  admin: "border-accent-glow/50 text-accent-glow",
  editor: "border-[#137A43]/50 text-[#5fd49a]",
  viewer: "border-white/30 text-[#aeb6c2]",
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

  const visibleNav = NAV.filter((n) => !n.adminOnly || isAdmin);
  const displayName = (session.user.email?.split("@")[0] || "there")
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  function NavButton({ n }: { n: (typeof NAV)[number] }) {
    const Icon = n.icon;
    return (
      <button
        onClick={() => { setTab(n.key); setNavOpen(false); }}
        title={collapsed ? n.label : undefined}
        className={cn(
          "flex items-center gap-3 w-full rounded-xl font-medium text-[14px] transition-colors",
          collapsed ? "md:justify-center md:px-0 px-3.5 py-2.5" : "px-3.5 py-2.5",
          tab === n.key ? "bg-accent-glow text-corp-navy" : "text-[#c3cad6] hover:bg-white/10 hover:text-white"
        )}
      >
        <Icon className="w-[18px] h-[18px] flex-none" strokeWidth={1.8} />
        <span className={cn(collapsed && "md:hidden")}>{n.label}</span>
      </button>
    );
  }

  return (
    <div className="admin-ui min-h-screen bg-paper md:flex">
      {/* ===== Floating sidebar pill ===== */}
      <aside
        className={cn(
          "fixed z-40 inset-y-0 left-0 w-[256px] h-screen shrink-0 bg-corp-navy text-white flex flex-col transition-all duration-200",
          "md:sticky md:top-3 md:self-start md:my-3 md:ml-3 md:h-[calc(100vh-1.5rem)] md:rounded-2xl md:shadow-2xl md:ring-1 md:ring-white/10 md:translate-x-0",
          collapsed ? "md:w-[76px]" : "md:w-[244px]",
          navOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand row + collapse toggle */}
        <div className={cn("h-[64px] flex items-center gap-2 border-b border-white/10 flex-none", collapsed ? "md:justify-center md:px-2 px-4 justify-between" : "justify-between px-4")}>
          <div className={cn("min-w-0", collapsed && "md:hidden")}>
            <Brand className="h-6" />
          </div>
          <button
            onClick={() => setCollapsed((v) => !v)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex-none hidden md:grid place-items-center w-8 h-8 rounded-lg text-[#c3cad6] hover:bg-white/10 hover:text-white transition-colors"
          >
            <ChevronLeft className={cn("w-[18px] h-[18px] transition-transform", collapsed && "rotate-180")} strokeWidth={1.9} />
          </button>
        </div>

        {/* Greeting + live clock */}
        <div className={cn("border-b border-white/10 flex-none", collapsed ? "md:px-2 md:py-3 px-5 py-3.5" : "px-5 py-3.5")}>
          <div className={cn(collapsed && "md:hidden")}>
            <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-accent-glow border border-accent-glow/40 rounded px-1.5 py-0.5">Admin</span>
            <div className="font-display font-semibold text-[14.5px] leading-tight mt-2">{greeting()}, {displayName}</div>
          </div>
          <Clock collapsed={collapsed} />
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1 min-h-0">
          {visibleNav.map((n) => <NavButton key={n.key} n={n} />)}
        </nav>

        <div className={cn("border-t border-white/10 flex-none", collapsed ? "md:p-2 p-3" : "p-3")}>
          {/* Expanded footer */}
          <div className={cn(collapsed && "md:hidden")}>
            <div className="flex items-center gap-2 px-2 mb-2">
              <span className={cn("font-mono text-[10px] uppercase tracking-[0.14em] border rounded px-1.5 py-0.5", ROLE_PILL[role])}>{role}</span>
              <span className="font-mono text-[11px] text-[#aeb6c2] truncate">{session.user.email}</span>
            </div>
            <Link to="/" className="flex items-center gap-1.5 px-2 font-mono text-[12px] text-[#aeb6c2] hover:text-accent-glow mb-2.5">
              View site <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.8} />
            </Link>
            <button className="btn btn-sm bg-white text-corp-navy w-full justify-center" onClick={signOut}>Sign out</button>
          </div>
          {/* Collapsed footer — icons only (desktop) */}
          <div className={cn("flex-col items-center gap-2 hidden", collapsed && "md:flex")}>
            <span className={cn("font-mono text-[10px] uppercase w-8 h-8 grid place-items-center rounded-lg", ROLE_PILL[role])} title={`Role: ${role}`}>{role[0]}</span>
            <Link to="/" title="View site" className="grid place-items-center w-9 h-9 rounded-lg text-[#aeb6c2] hover:bg-white/10 hover:text-white">
              <ExternalLink className="w-[18px] h-[18px]" strokeWidth={1.8} />
            </Link>
            <button onClick={signOut} title="Sign out" className="grid place-items-center w-9 h-9 rounded-lg bg-white text-corp-navy">
              <LogOut className="w-[18px] h-[18px]" strokeWidth={1.9} />
            </button>
          </div>
        </div>
      </aside>

      {/* backdrop for mobile drawer */}
      {navOpen && <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setNavOpen(false)} />}

      {/* ===== Main ===== */}
      <div className="flex-1 min-w-0">
        {/* mobile top bar */}
        <div className="md:hidden h-[56px] bg-corp-navy text-white flex items-center justify-between px-4">
          <button aria-label="Open menu" onClick={() => setNavOpen(true)}>
            <Menu className="w-6 h-6" strokeWidth={1.8} />
          </button>
          <span className="font-semibold">Admin</span>
          <button className="font-mono text-[12px] flex items-center gap-1.5" onClick={signOut}>
            <LogOut className="w-4 h-4" strokeWidth={1.8} /> Sign out
          </button>
        </div>

        <div className="max-w-[1100px] mx-auto px-5 lg:px-8 py-7">
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
        </div>
      </div>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function Clock({ collapsed = false }: { collapsed?: boolean }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className={cn("font-mono leading-relaxed", collapsed ? "mt-0 md:mt-0" : "mt-1.5")}>
      {/* Compact: time only, centered (desktop collapsed). */}
      <div className={cn("text-[#aeb6c2] tabular-nums text-center text-[10.5px] hidden", collapsed && "md:block")}>
        {now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
      </div>
      {/* Full: weekday/date + ticking time. */}
      <div className={cn("text-[11px]", collapsed && "md:hidden")}>
        <div className="text-accent-glow">{now.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</div>
        <div className="text-[#aeb6c2] tabular-nums">{now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</div>
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
