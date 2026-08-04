/**
 * Writes dist/sitemap.xml after a build.
 *
 * Pulls the published products and categories straight from Supabase over the
 * REST API with the anon key, so the sitemap always matches what's live. If the
 * env vars are missing or the fetch fails, it still writes the static pages
 * rather than failing the build — a partial sitemap beats none.
 *
 * Env:
 *   VITE_SITE_URL        canonical origin (default https://lexusindustrial.com.ph)
 *   VITE_SUPABASE_URL    project URL
 *   VITE_SUPABASE_ANON_KEY  publishable/anon key
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// Minimal .env reader — no dependency, and Vite has already consumed it anyway.
function loadEnv() {
  const file = resolve(root, ".env");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnv();

const SITE = (process.env.VITE_SITE_URL || "https://lexusindustrial.com.ph").replace(/\/$/, "");
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const ANON = process.env.VITE_SUPABASE_ANON_KEY;

const STATIC_PAGES = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/products", changefreq: "weekly", priority: "0.9" },
  { path: "/services", changefreq: "monthly", priority: "0.8" },
  { path: "/about", changefreq: "monthly", priority: "0.7" },
  { path: "/contact", changefreq: "monthly", priority: "0.7" },
];

async function table(name, query) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${name}?${query}`, {
    headers: { apikey: ANON, Authorization: `Bearer ${ANON}` },
  });
  if (!res.ok) throw new Error(`${name}: ${res.status} ${res.statusText}`);
  return res.json();
}

const escape = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const urlEntry = ({ path, changefreq, priority, lastmod }) =>
  [
    "  <url>",
    `    <loc>${escape(SITE + (path === "/" ? "/" : path))}</loc>`,
    lastmod ? `    <lastmod>${lastmod.slice(0, 10)}</lastmod>` : null,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ].filter(Boolean).join("\n");

const entries = [...STATIC_PAGES];

if (SUPABASE_URL && ANON) {
  try {
    const [categories, products] = await Promise.all([
      table("categories", "select=slug&order=sort_order"),
      table("products", "select=slug,updated_at&is_published=eq.true&order=sort_order"),
    ]);

    for (const c of categories) {
      if (c.slug) entries.push({ path: `/products?cat=${c.slug}`, changefreq: "weekly", priority: "0.8" });
    }
    for (const p of products) {
      if (p.slug) entries.push({ path: `/products/${p.slug}`, changefreq: "monthly", priority: "0.7", lastmod: p.updated_at });
    }
    console.log(`sitemap: ${categories.length} categories, ${products.length} published products`);
  } catch (e) {
    console.warn(`sitemap: could not reach Supabase (${e.message}) — writing static pages only`);
  }
} else {
  console.warn("sitemap: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set — writing static pages only");
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(urlEntry).join("\n")}
</urlset>
`;

writeFileSync(resolve(root, "dist/sitemap.xml"), xml, "utf8");
console.log(`sitemap: wrote ${entries.length} URLs → dist/sitemap.xml (${SITE})`);

// Keep robots.txt's Sitemap line pointing at whatever origin we just built for.
const robots = `User-agent: *
Allow: /
Disallow: /admin

Sitemap: ${SITE}/sitemap.xml
`;
writeFileSync(resolve(root, "dist/robots.txt"), robots, "utf8");
