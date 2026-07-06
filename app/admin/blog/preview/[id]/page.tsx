import { notFound, redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-route";
import { getSession } from "@/lib/session";
import Link from "next/link";
import { ArrowLeft, Eye } from "lucide-react";

export default async function BlogPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.isCmsAdmin) redirect("/masuk");

  const { id } = await params;
  const admin = createAdminClient();
  const { data: post } = await admin.from("blog_posts").select("*").eq("id", id).maybeSingle();
  if (!post) notFound();

  const content = (post.content ?? "")
    .replace(/<img /g, '<img loading="lazy" ');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Admin bar */}
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border">
        <Link href={`/admin/blog/${id}`} className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors">
          <ArrowLeft size={16} strokeWidth={1.5} />
          Kembali ke edit
        </Link>
        <div className="flex-1" />
        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-soft text-amber px-2 py-0.5 rounded-full flex items-center gap-1">
          <Eye size={10} strokeWidth={2.5} />
          Pratinjau
        </span>
        {!post.is_published && (
          <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
            Draft
          </span>
        )}
      </div>

      {/* Blog post layout matching public page */}
      <article>
        {post.cover_image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full aspect-video object-cover rounded-2xl mb-8"
          />
        )}

        <div className="flex items-center gap-3 text-sm text-ink-muted mb-4">
          {post.category && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-soft text-amber px-2 py-0.5 rounded-full">
              {post.category}
            </span>
          )}
          <span>{post.author_name || "Tim Mulaibaca"}</span>
          {post.published_at && (
            <span>
              {new Date(post.published_at).toLocaleDateString("id-ID", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </span>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-display font-bold text-ink leading-tight mb-4">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-lg text-ink-secondary leading-relaxed mb-8">
            {post.excerpt}
          </p>
        )}

        <div
          className="prose-blog max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </article>
    </div>
  );
}
