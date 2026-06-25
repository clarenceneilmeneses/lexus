import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { Role } from "../lib/types";

/** Areas an action can be gated on. `can(area)` = may this role *write/manage* it. */
export type PermArea = "products" | "categories" | "inquiries" | "content" | "users" | "settings";

// Which roles may write each area. (viewer = read-only everywhere.)
const WRITE_MATRIX: Record<PermArea, Role[]> = {
  products: ["editor", "admin"],
  categories: ["editor", "admin"],
  inquiries: ["editor", "admin"],
  content: ["editor", "admin"],
  users: ["admin"],
  settings: ["admin"],
};

interface AuthState {
  session: Session | null;
  role: Role | null;
  isAdmin: boolean;
  isStaff: boolean; // editor or admin
  can: (area: PermArea) => boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshRole(s: Session | null) {
    if (!s) { setRole(null); return; }
    const { data } = await supabase.from("profiles").select("role").eq("id", s.user.id).maybeSingle();
    setRole((data?.role as Role) ?? "viewer");
  }

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      await refreshRole(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, s) => {
      setSession(s);
      await refreshRole(s);
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }
  async function signOut() { await supabase.auth.signOut(); }

  const isAdmin = role === "admin";
  const isStaff = role === "admin" || role === "editor";
  const can = (area: PermArea) => (role ? WRITE_MATRIX[area].includes(role) : false);

  return (
    <AuthContext.Provider value={{ session, role, isAdmin, isStaff, can, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
