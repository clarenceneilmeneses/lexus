export interface Spec { label: string; value: string; }

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_path: string | null;
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

export interface AuditEntry {
  id: number;
  actor_id: string | null;
  actor_email: string | null;
  action: "insert" | "update" | "delete";
  entity: string;          // products | categories | site_settings | profiles
  entity_id: string | null;
  label: string | null;
  changes: Record<string, any> | null;
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

/** A section's intro text: small label, heading, and lead paragraph. */
export interface SectionHeading { eyebrow: string; title: string; subtitle: string; }

export interface HeroSettings { eyebrow: string; title: string; subtitle: string; cta_label: string; video_url?: string; }
export interface AboutSettings { eyebrow: string; title: string; body: string; stats: { label: string; value: string }[]; }
export interface ServiceItem { title: string; body: string; image?: string | null; }
export interface ServicesSettings { eyebrow: string; title: string; subtitle: string; items: ServiceItem[]; }
export interface ContactSettings extends SectionHeading {
  email: string;
  phone: string;
  address: string;
  hours: string;
  branches?: Branch[];
  /** Photo beside the home-page contact form, plus its overlaid caption. */
  image?: string | null;
  image_eyebrow: string;
  image_caption: string;
}
export interface InteriorItem { eyebrow: string; title: string; image?: string | null; }
export interface InteriorsSettings { eyebrow: string; title: string; subtitle: string; items: InteriorItem[]; }
export interface CredentialStat { value: string; label: string; }
export interface CredentialsSettings { eyebrow: string; title: string; body: string; caption: string; image?: string | null; stats: CredentialStat[]; }
export interface Testimonial { quote: string; author: string; role?: string; }
export interface TestimonialsSettings { eyebrow: string; title: string; items: Testimonial[]; }
export interface PartnerLogo { name: string; image?: string | null; }
export interface PartnersSettings { eyebrow: string; title: string; items: PartnerLogo[]; }
export interface SocialSettings { facebook?: string; instagram?: string; linkedin?: string; }
export interface SeoSettings { title?: string; description?: string; }

export interface SiteSettings {
  hero: HeroSettings;
  about: AboutSettings;
  services: ServicesSettings;
  /** Intro above the home-page "Featured Products" carousel. */
  featured: SectionHeading;
  /** Intro above the home-page "Shop by Category" tiles. */
  category_section: SectionHeading;
  interiors: InteriorsSettings;
  credentials: CredentialsSettings;
  testimonials: TestimonialsSettings;
  partners: PartnersSettings;
  contact: ContactSettings;
  social: SocialSettings;
  seo: SeoSettings;
}

export interface Catalog {
  categories: Category[];
  products: Product[];
  settings: SiteSettings;
}
