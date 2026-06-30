export type Book = {
  id?: string;
  title: string;
  author: string;
  cover_url: string | null;
  open_library_id: string | null;
  isbn?: string | null;
  total_pages: number | null;
  description: string;
  categories: string[];
  tags: string[];
  publisher?: string | null;
  published_year?: number | null;
  language?: string;
  is_curated?: boolean;
  enrichment_status?: string;
  is_active?: boolean;
  sort_order?: number;
};
