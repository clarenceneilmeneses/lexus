export interface Spec { label: string; value: string; }

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
}

export interface ProductImage {
  id: string;
  product_id: string;
  storage_path: string;
  alt: string | null;
  is_primary: boolean;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  brand: string | null;
  model: string | null;
  short_description: string | null;
  description: string | null;
  specs: Spec[];
  price_text: string | null;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  images: ProductImage[];
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  product_id: string | null;
  subject: string | null;
  message: string;
  status: "new" | "read" | "archived";
  created_at: string;
}

export type Role = "viewer" | "editor" | "admin";

export interface Profile {
  id: string;
  email: string | null;
  role: Role;
  created_at: string;
}

export interface Branch {
  city: string;
  address: string;
  phone?: string;
  email?: string;
}

export interface HeroSettings { eyebrow: string; title: string; subtitle: string; cta_label: string; }
export interface AboutSettings { title: string; body: string; stats: { label: string; value: string }[]; }
export interface ServicesSettings { title: string; items: { title: string; body: string }[]; }
export interface ContactSettings { email: string; phone: string; address: string; hours: string; branches?: Branch[]; }
export interface SocialSettings { facebook?: string; instagram?: string; linkedin?: string; }
export interface SeoSettings { title?: string; description?: string; }

export interface SiteSettings {
  hero: HeroSettings;
  about: AboutSettings;
  services: ServicesSettings;
  contact: ContactSettings;
  social: SocialSettings;
  seo: SeoSettings;
}

export interface Catalog {
  categories: Category[];
  products: Product[];
  settings: SiteSettings;
}
