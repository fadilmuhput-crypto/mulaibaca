import type { CuratedBook } from "@/lib/curated-books";

export type SectionType = "featured" | "grid_v" | "grid_h" | "banner";

export type BannerItem = {
  image_url: string;
  title?: string;
  subtitle?: string;
  cta_text?: string;
  link_url?: string;
};

export type BannerConfig = {
  layout: 1 | 2 | 4;
  items: BannerItem[];
};

export type JelajahSection = {
  id: string;
  title: string;
  subtitle: string | null;
  type: SectionType;
  config: BannerConfig | Record<string, never>;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  books?: CuratedBook[];
};

export const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  featured: "Featured (carousel)",
  grid_v:   "Grid Vertikal",
  grid_h:   "Grid Horizontal (scroll)",
  banner:   "Banner Gambar",
};

export const SECTION_TYPE_DESC: Record<SectionType, string> = {
  featured: "1–4 buku besar dengan deskripsi, swipe kiri/kanan",
  grid_v:   "Grid 3 kolom, tampil 9 buku + load more",
  grid_h:   "Scroll horizontal, lihat semua ekspand ke grid",
  banner:   "Gambar penuh dengan CTA — layout 1, 2, atau 4 slot",
};
