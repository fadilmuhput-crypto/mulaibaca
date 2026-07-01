function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-").slice(0, 60);
}

export function bookUrl(book: {
  slug?: string | null;
  id?: string;
  title: string;
  open_library_id?: string | null;
}): string {
  if (book.slug) return `/buku/${book.slug}`;
  if (book.open_library_id) return `/buku/${toSlug(book.title)}-${book.open_library_id.toLowerCase()}`;
  return `/buku/${book.id ?? toSlug(book.title)}`;
}
