// =============================================================================
// Edge Function: admin-users
// Secure server-side user management for the admin "Users" tab.
//
// Why a function?  Creating / deleting auth accounts requires the Supabase
// SERVICE_ROLE key, which bypasses RLS and must NEVER be shipped to the browser.
// This function runs on Supabase's servers, holds the service-role key as a
// secret, and only acts after verifying the *caller* is an admin.
//
// Deploy (one-time):
//   supabase functions deploy admin-users
//   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<your service_role key>
//   # SUPABASE_URL is provided automatically by the platform.
//
// Actions (POST JSON body):
//   { action: "create", email, password, role }   -> creates a confirmed user
//   { action: "delete", id }                       -> deletes an auth user
// =============================================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ROLES = ["viewer", "editor", "admin"] as const;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const url = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !serviceKey) return json({ error: "Function is not configured (missing service-role secret)." }, 500);

    // Admin client — bypasses RLS, used only after we confirm the caller is an admin.
    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

    // ---- Authenticate the caller from their JWT ----
    const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    if (!jwt) return json({ error: "Missing authorization." }, 401);

    const { data: caller, error: callerErr } = await admin.auth.getUser(jwt);
    if (callerErr || !caller.user) return json({ error: "Invalid or expired session." }, 401);

    // ---- Authorize: caller must be an admin ----
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", caller.user.id)
      .maybeSingle();
    if (profile?.role !== "admin") return json({ error: "Admins only." }, 403);

    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const action = String(body.action ?? "");

    // ---- Create ----
    if (action === "create") {
      const email = String(body.email ?? "").trim().toLowerCase();
      const password = String(body.password ?? "");
      const role = ROLES.includes(body.role as never) ? (body.role as string) : "viewer";

      if (!/^\S+@\S+\.\S+$/.test(email)) return json({ error: "Enter a valid email address." }, 400);
      if (password.length < 8) return json({ error: "Password must be at least 8 characters." }, 400);

      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // account is usable immediately, no confirmation email
      });
      if (createErr || !created.user) return json({ error: createErr?.message ?? "Could not create user." }, 400);

      // The handle_new_user trigger inserts a 'viewer' profile; set the chosen role + email.
      const { error: roleErr } = await admin
        .from("profiles")
        .upsert({ id: created.user.id, email, role }, { onConflict: "id" });
      if (roleErr) return json({ error: roleErr.message }, 400);

      return json({ ok: true, id: created.user.id, email, role });
    }

    // ---- Delete ----
    if (action === "delete") {
      const id = String(body.id ?? "");
      if (!id) return json({ error: "Missing user id." }, 400);
      if (id === caller.user.id) return json({ error: "You can't delete your own account." }, 400);

      const { error: delErr } = await admin.auth.admin.deleteUser(id);
      if (delErr) return json({ error: delErr.message }, 400);
      return json({ ok: true });
    }

    return json({ error: `Unknown action: ${action || "(none)"}.` }, 400);
  } catch (e) {
    return json({ error: (e as Error)?.message ?? "Server error." }, 500);
  }
});
