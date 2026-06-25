import { useState, type JSX } from "react";
import { Link } from "react-router-dom";
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
import SettingsPanel from "./SettingsPanel";

type Tab = "dashboard" | "products" | "categories" | "inquiries" | "content" | "users" | "settings";

const icon = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
    <path d={d} />
  </svg>
);

// area=null → visible to everyone signed in (read-only ok). area set → admin-only items.
const NAV: { key: Tab; label: string; icon: JSX.Element; adminOnly?: boolean }[] = [
  { key: "dashboard", label: "Dashboard", icon: icon("M3 13h8V3H3v10zM13 21h8V11h-8v10zM13 3v6h8V3h-8zM3 21h8v-6H3v6z") },
  { key: "products", label: "Products", icon: icon("M21 16V8a2 2 0 00-1-1.7l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.7l7 4a2 2 0 002 0l7-4A2 2 0 0021 16zM3.3 7L12 12l8.7-5M12 22V12") },
  { key: "categories", label: "Categories", icon: icon("M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z") },
  { key: "inquiries", label: "Inquiries", icon: icon("M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z") },
  { key: "content", label: "Content", icon: icon("M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z") },
  { key: "users", label: "Users", icon: icon("M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8"), adminOnly: true },
  { key: "settings", label: "Settings", icon: icon("M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"), adminOnly: true },
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

  if (loading) return <div className="min-h-screen grid place-items-center font-mono text-steel">Loading…</div>;
  if (!session) return <Login />;

  // Signed in but no admin-dashboard access at all (no role row / unknown).
  if (!role) {
    return (
      <div className="min-h-screen grid place-items-center bg-paper">
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

  function NavButton({ n }: { n: (typeof NAV)[number] }) {
    return (
      <button
        onClick={() => { setTab(n.key); setNavOpen(false); }}
        className={cn(
          "flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg font-display font-semibold text-[14px] transition-colors",
          tab === n.key ? "bg-corp-orange text-white" : "text-[#c3cad6] hover:bg-white/10 hover:text-white"
        )}
      >
        {n.icon}
        {n.label}
      </button>
    );
  }

  return (
    <div className="min-h-screen bg-paper md:flex">
      {/* ===== Sidebar ===== */}
      <aside
        className={cn(
          "fixed md:static z-40 inset-y-0 left-0 w-[244px] bg-corp-navy text-white flex flex-col transition-transform md:translate-x-0",
          navOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-[60px] flex items-center gap-2 px-5 border-b border-white/10">
          <Brand className="h-7" />
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-accent-glow border border-accent-glow/40 rounded px-1.5 py-0.5">Admin</span>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {visibleNav.map((n) => <NavButton key={n.key} n={n} />)}
        </nav>
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-2 px-2 mb-2">
            <span className={cn("font-mono text-[10px] uppercase tracking-[0.14em] border rounded px-1.5 py-0.5", ROLE_PILL[role])}>{role}</span>
            <span className="font-mono text-[11px] text-[#aeb6c2] truncate">{session.user.email}</span>
          </div>
          <Link to="/" className="block px-2 font-mono text-[12px] text-[#aeb6c2] hover:text-accent-glow mb-2">View site ↗</Link>
          <button className="btn btn-sm bg-white text-corp-navy w-full justify-center" onClick={signOut}>Sign out</button>
        </div>
      </aside>

      {/* backdrop for mobile drawer */}
      {navOpen && <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setNavOpen(false)} />}

      {/* ===== Main ===== */}
      <div className="flex-1 min-w-0">
        {/* mobile top bar */}
        <div className="md:hidden h-[56px] bg-corp-navy text-white flex items-center justify-between px-4">
          <button className="text-2xl" aria-label="Open menu" onClick={() => setNavOpen(true)}>☰</button>
          <span className="font-display font-bold">Admin</span>
          <button className="font-mono text-[12px]" onClick={signOut}>Sign out</button>
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
              {tab === "settings" && (isAdmin ? <SettingsPanel catalog={catalog} reload={reload} /> : <NoAccess />)}
            </>
          )}
        </div>
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
