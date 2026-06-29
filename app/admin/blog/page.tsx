import Link from "next/link";
import { createAdminClient } from "@/lib/supabase-route";
import BlogAdminClient from "./BlogAdminClient";

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author_name: string;
  cover_image: string | null;
  published_at: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export default async function AdminBlogPage() {
  const admin = createAdminClient();
  const { data: posts } = await admin
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-h1">Blog</h1>
          <p className="text-sm text-ink-muted mt-0.5">{(posts ?? []).length} artikel</p>
        </div>
        <Link href="/admin/blog/tambah" className="btn-primary">
          + Artikel Baru
        </Link>
      </div>

      <BlogAdminClient initialPosts={(posts ?? []) as BlogPost[]} />
    </div>
  );
}
