import { SUPABASE_URL } from "./supabase";
import type { Product } from "./types";

export const cn = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(" ");

export const slugify = (s: string) =>
  (s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const imgUrl = (path?: string | null) =>
  path ? `${SUPABASE_URL}/storage/v1/object/public/product-images/${path}` : null;

export function placeholder(name: string, code?: string | null): string {
  const init =
    (name || "LX").replace(/[^A-Za-z0-9 ]/g, "").split(/\s+/).slice(0, 2).map((w) => w[0] || "").join("").toUpperCase() || "LX";
  const grid =
    Array.from({ length: 9 }, (_, i) => `<line x1='${i * 70}' y1='0' x2='${i * 70}' y2='450'/>`).join("") +
    Array.from({ length: 7 }, (_, i) => `<line x1='0' y1='${i * 70}' x2='600' y2='${i * 70}'/>`).join("");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='450'>
    <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#1B2738'/><stop offset='1' stop-color='#0E1726'/></linearGradient></defs>
    <rect width='600' height='450' fill='url(#g)'/>
    <g stroke='rgba(255,255,255,.06)'>${grid}</g>
    <rect x='0' y='0' width='14' height='450' fill='#EA5A0B'/>
    <text x='50%' y='47%' fill='#fff' font-family='Archivo,sans-serif' font-weight='900' font-size='120' text-anchor='middle'>${init}</text>
    <text x='50%' y='62%' fill='#8A93A0' font-family='monospace' font-size='22' letter-spacing='3' text-anchor='middle'>${(code || "").toUpperCase()}</text>
  </svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

export function primaryImage(p: Product): string {
  const im = [...(p.images || [])].sort(
    (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order
  )[0];
  return im ? imgUrl(im.storage_path)! : placeholder(p.name, p.model);
}
