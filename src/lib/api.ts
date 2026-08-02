import { supabase } from "./supabase";
import type { AuditEntry, Catalog, Category, Inquiry, Product, ProductImage, Profile, Role, SiteSettings, Spec } from "./types";

const DEFAULT_SETTINGS: SiteSettings = {
  hero: {
    eyebrow: "Interior Finishings & Building Materials · Since 1995",
    title: "The premier source for your finishing and construction needs.",
    subtitle:
      "Wholesale and retail supplier of modern interior finishings and trusted international brands — boards, panels, drywall, ceiling systems, and more — from our head office in Metro Manila.",
    // Labels the hero's secondary button, which scrolls to the services band.
    cta_label: "Explore our work",
    video_url: "",
  },
  about: {
    eyebrow: "Our story",
    title: "About Lexus Industrial",
    body: "Lexus Industrial Enterprise Corporation has been a leading wholesale and retail comprehensive company with the head office located in Metro Manila, Philippines. Since 1995, the company has been known for providing reputable modern interior finishings and a selection of trusted international brands with high-grade features.",
    stats: [
      { label: "Established", value: "1995" },
      { label: "Product lines", value: "18" },
      { label: "Head office", value: "Metro Manila" },
    ],
  },
  services: {
    eyebrow: "What we do",
    title: "Our services",
    subtitle: "Everything from raw boards to ready-to-install panels — handled in-house.",
    items: [
      { title: "Supply and Distribution", body: "Wholesale and retail supply of interior finishing materials to projects nationwide." },
      { title: "Lamination Services", body: "Professional lamination of boards and panels to your required finishes and sizes." },
      { title: "Metal Production", body: "Fabrication of light steel frame and metal components for walls and ceilings." },
      { title: "Cutting & Edging", body: "Precision cut-to-size and edgebanding for ready-to-install panels." },
    ],
  },
  featured: {
    eyebrow: "The lineup",
    title: "Featured Products",
    subtitle: "A selection from the catalog — boards, panels, framing and finishes, ready to specify.",
  },
  category_section: {
    eyebrow: "Our products",
    title: "Shop by Category",
    subtitle: "From boards and panels to framing and finishes — browse the full range by category.",
  },
  interiors: {
    eyebrow: "Designed to be lived in",
    title: "Finished with Lexus.",
    subtitle: "From kitchens to facades — interiors that designers and homeowners love.",
    items: [
      { eyebrow: "Residential", title: "Kitchens & cabinetry", image: null },
      { eyebrow: "Hospitality", title: "Dining & living spaces", image: null },
      { eyebrow: "Commercial", title: "Facades & cladding", image: null },
    ],
  },
  credentials: {
    eyebrow: "Credentials",
    title: "Recognized in the industry.",
    body: "A proud exhibitor at WORLDBEX — the Philippines' biggest building & construction exposition.",
    caption: "WORLDBEX 2026 · WTC Metro Manila · Booth 1013–1014 & 1035–1036",
    image: null,
    stats: [
      { value: "2026", label: "Exhibitor" },
      { value: "WTC", label: "Metro Manila" },
      { value: "#1", label: "PH expo" },
    ],
  },
  testimonials: {
    eyebrow: "What clients say",
    title: "Trusted on the project floor.",
    items: [
      {
        quote:
          "Lexus has been our go-to supplier for finishing materials for years — consistent quality and they always come through on hard-to-find finishes.",
        author: "Project Architect",
        role: "Metro Manila design firm",
      },
      {
        quote:
          "Reliable lead times and a genuinely deep catalog. Their lamination and cut-to-size service saves us days on every fit-out.",
        author: "Fit-out Contractor",
        role: "Commercial interiors",
      },
    ],
  },
  partners: {
    eyebrow: "Brands & partners",
    title: "Trusted international brands.",
    items: [
      { name: "WORLDBEX", image: null },
      { name: "Lexus Industrial", image: null },
      { name: "Partner Brand", image: null },
      { name: "Partner Brand", image: null },
    ],
  },
  contact: {
    eyebrow: "Get in touch",
    title: "Contact Us",
    subtitle:
      "Tell us what you need — we'll respond with availability and pricing, including hard-to-find finishes.",
    email: "am.unlayao@lexusindustrial.com.ph",
    phone: "",
    address: "Metro Manila, Philippines",
    hours: "Mon to Sat, 8:00 AM to 5:00 PM",
    image: null,
    image_eyebrow: "Since 1995",
    image_caption: "Trusted by the interior design industry across the Philippines.",
    branches: [
      { city: "Metro Manila", address: "Head Office — Metro Manila, Philippines", phone: "", email: "am.unlayao@lexusindustrial.com.ph" },
    ],
  },
  social: {},
  seo: {},
};

const asSpecs = (v: unknown): Spec[] => (Array.isArray(v) ? (v as Spec[]) : []);

/** Public + admin catalog. Pass includeUnpublished=true for admin views. */
export async function fetchCatalog(includeUnpublished = false): Promise<Catalog> {
  const cats = supabase.from("categories").select("*").order("sort_order");
  let prodQ = supabase.from("products").select("*").order("sort_order");
  if (!includeUnpublished) prodQ = prodQ.eq("is_published", true);
  const imgs = supabase.from("product_images").select("*").order("sort_order");
  const sets = supabase.from("site_settings").select("*");

  const [c, p, i, s] = await Promise.all([cats, prodQ, imgs, sets]);
  if (c.error) throw c.error;
  if (p.error) throw p.error;

  const byProduct: Record<string, ProductImage[]> = {};
  (i.data ?? []).forEach((im: ProductImage) => {
    (byProduct[im.product_id] ??= []).push(im);
  });

  const products: Product[] = (p.data ?? []).map((row: any) => ({
    ...row,
    specs: asSpecs(row.specs),
    images: byProduct[row.id] ?? [],
  }));

  const settings: SiteSettings = { ...DEFAULT_SETTINGS };
  (s.data ?? []).forEach((r: { key: string; value: any }) => {
    (settings as any)[r.key] = { ...(settings as any)[r.key], ...r.value };
  });

  return { categories: (c.data ?? []) as Category[], products, settings };
}

export async function submitInquiry(input: {
  name: string; email: string; phone?: string; company?: string; subject?: string; message: string;
}): Promise<void> {
  const { error } = await supabase.from("inquiries").insert({
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone?.trim() || null,
    company: input.company?.trim() || null,
    subject: input.subject?.trim() || null,
    message: input.message.trim(),
  });
  if (error) throw error;
}

// ---------- Admin: products ----------
export type ProductInput = Omit<Product, "id" | "images" | "sort_order"> & { sort_order?: number };

export async function saveProduct(input: ProductInput, id?: string): Promise<Product> {
  const payload = {
    name: input.name,
    slug: input.slug,
    category_id: input.category_id,
    brand: input.brand,
    model: input.model,
    short_description: input.short_description,
    description: input.description,
    specs: input.specs,
    price_text: input.price_text,
    is_featured: input.is_featured,
    is_published: input.is_published,
  };
  const q = id
    ? supabase.from("products").update(payload).eq("id", id).select().single()
    : supabase.from("products").insert(payload).select().single();
  const { data, error } = await q;
  if (error) throw error;
  return { ...(data as any), specs: asSpecs((data as any).specs), images: [] };
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Admin: images ----------
export async function uploadProductImage(productId: string, file: File, makePrimary: boolean): Promise<ProductImage> {
  if (file.size > 5 * 1024 * 1024) throw new Error("Image is larger than 5 MB.");
  if (!file.type.startsWith("image/")) throw new Error("Only image files are allowed.");
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${productId}/${crypto.randomUUID()}.${ext}`;
  const up = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type });
  if (up.error) throw up.error;
  const { data, error } = await supabase
    .from("product_images")
    .insert({ product_id: productId, storage_path: path, is_primary: makePrimary })
    .select()
    .single();
  if (error) throw error;
  return data as ProductImage;
}

export async function deleteProductImage(im: ProductImage): Promise<void> {
  await supabase.storage.from("product-images").remove([im.storage_path]);
  const { error } = await supabase.from("product_images").delete().eq("id", im.id);
  if (error) throw error;
}

export async function setPrimaryImage(im: ProductImage): Promise<void> {
  await supabase.from("product_images").update({ is_primary: false }).eq("product_id", im.product_id);
  const { error } = await supabase.from("product_images").update({ is_primary: true }).eq("id", im.id);
  if (error) throw error;
}

/**
 * Upload an image used in editable site content (e.g. service cards) and return
 * its storage path. Reuses the public `product-images` bucket — resolve the
 * public URL with `imgUrl(path)`. `folder` namespaces the file (default "site").
 */
export async function uploadSiteImage(file: File, folder = "site"): Promise<string> {
  if (file.size > 5 * 1024 * 1024) throw new Error("Image is larger than 5 MB.");
  if (!file.type.startsWith("image/")) throw new Error("Only image files are allowed.");
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const up = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type });
  if (up.error) throw up.error;
  return path;
}

/** Best-effort delete of site images from storage (e.g. orphaned service images). */
export async function deleteSiteImages(paths: string[]): Promise<void> {
  if (!paths.length) return;
  await supabase.storage.from("product-images").remove(paths);
}

// ---------- Admin: categories ----------
export async function saveCategory(input: { name: string; slug: string; description: string; image_path: string | null; sort_order: number }, id?: string) {
  const q = id
    ? supabase.from("categories").update(input).eq("id", id)
    : supabase.from("categories").insert(input);
  const { error } = await q;
  if (error) throw error;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Admin: inquiries ----------
export async function fetchInquiries(): Promise<Inquiry[]> {
  const { data, error } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Inquiry[];
}

export async function setInquiryStatus(id: string, status: Inquiry["status"]): Promise<void> {
  const { error } = await supabase.from("inquiries").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function deleteInquiry(id: string): Promise<void> {
  const { error } = await supabase.from("inquiries").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Admin: settings ----------
export async function saveSettings(entries: { key: string; value: unknown }[]): Promise<void> {
  const { error } = await supabase.from("site_settings").upsert(entries.map((e) => ({ key: e.key, value: e.value })));
  if (error) throw error;
}

// ---------- Admin: audit log (admin-only; enforced by RLS) ----------
export async function fetchAuditLog(limit = 500): Promise<AuditEntry[]> {
  const { data, error } = await supabase
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as AuditEntry[];
}

// ---------- Admin: users & roles (admin-only; enforced by RLS) ----------
export async function fetchProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function setUserRole(id: string, role: Role): Promise<void> {
  const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
  if (error) throw error;
}

/**
 * Invoke the `admin-users` Edge Function. The function holds the service-role
 * key and re-verifies that the caller is an admin, so this is safe to call from
 * the browser. Surfaces the function's JSON `{ error }` body as a real Error.
 */
async function invokeAdminUsers(payload: Record<string, unknown>): Promise<any> {
  const { data, error } = await supabase.functions.invoke("admin-users", { body: payload });
  if (error) {
    // Non-2xx responses arrive as FunctionsHttpError with the body on `context`.
    let message = error.message;
    const ctx = (error as any).context;
    if (ctx && typeof ctx.json === "function") {
      try {
        const body = await ctx.json();
        if (body?.error) message = body.error;
      } catch {
        /* keep default message */
      }
    }
    if (/Failed to (send|fetch)|FunctionsFetchError|NetworkError/i.test(message)) {
      message = "Could not reach the user-management function. Has it been deployed? (supabase functions deploy admin-users)";
    }
    throw new Error(message);
  }
  if (data?.error) throw new Error(data.error);
  return data;
}

export async function adminCreateUser(input: { email: string; password: string; role: Role }): Promise<void> {
  await invokeAdminUsers({ action: "create", email: input.email, password: input.password, role: input.role });
}

export async function adminDeleteUser(id: string): Promise<void> {
  await invokeAdminUsers({ action: "delete", id });
}
