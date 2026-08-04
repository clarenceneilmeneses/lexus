import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import type { Catalog, SiteSettings } from "./types";

/**
 * Head management for a client-rendered SPA.
 *
 * Google executes JS, so tags written here are picked up by the crawler. Social
 * scrapers (Facebook, Viber, LinkedIn) do NOT run JS — they only ever see the
 * static tags in index.html, which is why those carry sensible site-wide
 * defaults. Prerendering the static routes at build time is the fix if
 * per-page link previews become a requirement.
 */

/** Canonical origin. Set VITE_SITE_URL in the deploy env to the live domain. */
export const SITE_URL = (
  import.meta.env.VITE_SITE_URL ||
  (typeof window !== "undefined" ? window.location.origin : "https://lexusindustrial.com.ph")
).replace(/\/$/, "");

export const SITE_NAME = "Lexus Industrial Enterprise Corporation";

/** Fallbacks used when the admin SEO fields are blank. Kept in sync with index.html. */
const FALLBACK_TITLE = "Lexus Industrial — Interior Finishings & Building Materials, Philippines";
const FALLBACK_DESCRIPTION =
  "Lexus Industrial Enterprise Corporation — wholesale and retail supplier of modern interior finishings and building materials in Metro Manila, Philippines. Trusted by the interior design industry since 1995.";
const FALLBACK_IMAGE = `${SITE_URL}/lexus/facade.jpg`;

export interface Seo {
  /** Page title. Suffixed with the brand unless `titleExact` is set. */
  title?: string;
  titleExact?: boolean;
  description?: string;
  /** Absolute or root-relative image URL for link previews. */
  image?: string | null;
  /** Path only, e.g. "/products". Defaults to the current location. */
  path?: string;
  type?: "website" | "article" | "product";
  /** Keep the page out of the index (404s, thin pages). */
  noindex?: boolean;
}

/** Trim to a length without cutting a word in half. */
export function clamp(text: string, max: number): string {
  const t = (text || "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return t.slice(0, t.lastIndexOf(" ", max - 1) > 0 ? t.lastIndexOf(" ", max - 1) : max - 1).trimEnd() + "…";
}

const absolute = (url?: string | null) =>
  !url ? FALLBACK_IMAGE : /^https?:|^data:/.test(url) ? url : `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;

/** Create-or-update a <meta> tag, tagged so we can tell ours from index.html's. */
function meta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    el.setAttribute("data-seo", "");
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function link(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    el.setAttribute("data-seo", "");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Sets title, description, canonical and the og:/twitter: block for a page.
 * Pass the catalog so the admin's Site settings → SEO fields act as defaults.
 */
export function useSeo(seo: Seo, settings?: SiteSettings) {
  const loc = useLocation();
  const path = seo.path ?? loc.pathname;

  const siteTitle = settings?.seo?.title?.trim() || FALLBACK_TITLE;
  const siteDesc = settings?.seo?.description?.trim() || FALLBACK_DESCRIPTION;

  const title = !seo.title ? siteTitle : seo.titleExact ? seo.title : `${seo.title} | Lexus Industrial`;
  const description = clamp(seo.description?.trim() || siteDesc, 300);
  const image = absolute(seo.image);
  const url = `${SITE_URL}${path === "/" ? "" : path}`;

  useEffect(() => {
    document.title = title;
    meta("name", "description", description);
    meta("name", "robots", seo.noindex ? "noindex, follow" : "index, follow");
    link("canonical", url);

    meta("property", "og:site_name", SITE_NAME);
    meta("property", "og:type", seo.type ?? "website");
    meta("property", "og:title", title);
    meta("property", "og:description", description);
    meta("property", "og:url", url);
    meta("property", "og:image", image);
    meta("property", "og:locale", "en_PH");

    meta("name", "twitter:card", "summary_large_image");
    meta("name", "twitter:title", title);
    meta("name", "twitter:description", description);
    meta("name", "twitter:image", image);
  }, [title, description, url, image, seo.type, seo.noindex]);
}

/** Injects a JSON-LD block, replacing any previous one with the same id. */
export function useJsonLd(id: string, data: unknown | null) {
  useEffect(() => {
    const elId = `jsonld-${id}`;
    document.getElementById(elId)?.remove();
    if (!data) return;

    const el = document.createElement("script");
    el.id = elId;
    el.type = "application/ld+json";
    el.textContent = JSON.stringify(data);
    document.head.appendChild(el);

    return () => { document.getElementById(elId)?.remove(); };
  }, [id, JSON.stringify(data)]);
}

/**
 * Organization + LocalBusiness for the whole site — this is what search engines
 * read to show the address, phone and social profiles beside the result.
 */
export function organizationSchema(catalog: Catalog) {
  const c = catalog.settings.contact;
  const s = catalog.settings.social;
  const sameAs = [s.facebook, s.instagram, s.linkedin].filter((x): x is string => !!x?.trim());

  const branches = (c.branches ?? [])
    .filter((b) => b.city?.trim() || b.address?.trim())
    .map((b) => ({
      "@type": "Place",
      name: b.city || undefined,
      address: { "@type": "PostalAddress", streetAddress: b.address || undefined, addressCountry: "PH" },
      telephone: b.phone || undefined,
    }));

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: "Lexus Industrial",
    url: SITE_URL,
    logo: `${SITE_URL}/lexus/lexus-logo.png`,
    image: `${SITE_URL}/lexus/facade.jpg`,
    description: clamp(catalog.settings.seo?.description?.trim() || FALLBACK_DESCRIPTION, 300),
    email: c.email || undefined,
    telephone: c.phone || undefined,
    address: { "@type": "PostalAddress", streetAddress: c.address || undefined, addressCountry: "PH" },
    openingHours: c.hours || undefined,
    foundingDate: "1995",
    areaServed: { "@type": "Country", name: "Philippines" },
    location: branches.length ? branches : undefined,
    sameAs: sameAs.length ? sameAs : undefined,
  };
}

/** Product schema for a detail page. No price — this is a quote-based catalog. */
export function productSchema(p: {
  name: string; slug: string; brand?: string | null; model?: string | null;
  description?: string | null; image: string; category?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    sku: p.model || undefined,
    mpn: p.model || undefined,
    category: p.category || undefined,
    brand: p.brand ? { "@type": "Brand", name: p.brand } : undefined,
    description: p.description ? clamp(p.description, 300) : undefined,
    image: absolute(p.image),
    url: `${SITE_URL}/products/${p.slug}`,
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "PHP",
      url: `${SITE_URL}/products/${p.slug}`,
      seller: { "@type": "Organization", name: SITE_NAME },
    },
  };
}

/** Breadcrumb trail — renders as the path line under a search result. */
export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: `${SITE_URL}${t.path === "/" ? "" : t.path}`,
    })),
  };
}
