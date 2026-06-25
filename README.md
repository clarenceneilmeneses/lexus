# Lexus Industrial — Website + CMS

Production catalog website with a role-secured admin dashboard. Staff add, edit, and
remove products (with images) themselves — no developer needed.

**Stack:** Vite · React 18 · TypeScript · Tailwind CSS · React Router · Supabase
(Postgres + Auth + Storage).

```
src/
  lib/        supabase client, types, typed API layer, utils
  hooks/      useAuth (session + admin role), useCatalog
  components/ layout (Header/Footer/PublicLayout), ProductCard
  pages/      Home, Products, ProductDetail, Services, About, Contact, NotFound
  pages/admin AdminApp (auth gate + tabs), Login, Products/Categories/Inquiries/Content panels
supabase/
  schema.sql  tables, role-based RLS, storage policies, search, seed data
```

---

## ⚠️ Before anything: rotate your leaked keys

Your **secret key** and **service_role key** were exposed — rotate both in
**Supabase → Project Settings → API Keys**. Only the **publishable / anon key** goes
in this app (in `.env`). The secret/service_role keys must never appear in frontend code.

## Setup

### 1. Install
```bash
npm install
```

### 2. Database
Supabase → **SQL Editor** → paste all of `supabase/schema.sql` → **Run**.
Creates tables, Row Level Security, the `product-images` storage bucket, full-text
search, and seed products.

Then run `supabase/migrations/0001_rbac.sql` the same way to enable the 3-tier
role model (admin / editor / viewer). It's idempotent — safe to re-run.

### 3. Environment
```bash
cp .env.example .env
```
Fill in your project URL and **new** publishable/anon key:
```
VITE_SUPABASE_URL=https://apyeuocfloljuzywofqr.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxx
```

### 4. Create your admin account
1. Supabase → **Authentication → Users → Add user** (email + password, tick *Auto Confirm*).
2. SQL Editor:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```
   Valid roles are `admin`, `editor`, and `viewer`:
   - **admin** — full access, incl. user management and site settings.
   - **editor** — manage products, categories, inquiries, and content (no users/settings).
   - **viewer** — read-only access to the admin dashboard.

   You can also change roles in-app from the admin **Users** tab once you're an admin.
3. Recommended: Authentication → Providers → Email → turn **off** public sign-ups so
   only invited staff can ever exist.

### 5. Run
```bash
npm run dev      # http://localhost:5173  (admin at /admin)
npm run build    # type-check + production build into dist/
npm run preview  # preview the production build
```

## Deploy

Static SPA — deploy `dist/` anywhere.
- **Vercel:** import the repo (framework: Vite). `vercel.json` handles SPA routing.
- **Netlify:** build `npm run build`, publish `dist`. `public/_redirects` handles routing.

Set the two `VITE_…` env vars in the host’s dashboard too.

---

## Security model (why this is safe in the browser)

- The frontend only ever holds the **publishable/anon** key. Everything is enforced
  server-side by Postgres **Row Level Security**, so the key can't be abused.
- Visitors can **read published products** and **submit inquiries** — nothing else.
- Every write (products, categories, images, content, inquiry management) requires
  `profiles.role = 'admin'`, checked by a `SECURITY DEFINER` `is_admin()` function.
  A random person who signs up is a `viewer` and can do **nothing** privileged.
- Storage uploads/deletes are admin-only; the bucket is public-read for product photos.
- Inquiries have server-side length limits, plus a honeypot field on the form to deter bots.

## How staff use it

- **Add a product:** `/admin` → Products → *New product* → fill details + specs →
  *Create* → upload images and pick the main one.
- **Edit homepage / contact text:** Content tab.
- **Read customer messages:** Inquiries tab (everything from the Contact / quote forms).

## Notes

- Products without a photo render an auto-generated branded placeholder, so the catalog
  never looks broken.
- Want emails on new inquiries? That belongs in a Supabase **Edge Function** (server-side,
  using a Resend/SMTP key) — never in this frontend. Happy to add it.
