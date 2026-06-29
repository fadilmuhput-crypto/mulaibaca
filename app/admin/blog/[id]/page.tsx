import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-route";
import BlogForm from "../BlogForm";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditBlogPage({ params }: PageProps) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data: post } = await admin.from("blog_posts").select("*").eq("id", id).maybeSingle();

  if (!post) notFound();

  return (
    <div>
      <h1 className="text-h1 mb-6">Edit Artikel</h1>
      <BlogForm
        initial={{
          id: post.id,
          title: post.title,
          content: post.content,
          excerpt: post.excerpt,
          author_name: post.author_name,
          cover_image: post.cover_image,
          category: post.category,
          is_published: post.is_published,
        }}
      />
    </div>
  );
}
