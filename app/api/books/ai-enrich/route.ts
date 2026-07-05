import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-route";
import { CATEGORY_TREE } from "@/lib/category-tree";

export const maxDuration = 120;

const CATEGORY_LIST = CATEGORY_TREE.flatMap((root) =>
  root.children.map((sub) => `"${sub.key}" — ${sub.label}`)
).join("\n");

const SYSTEM_PROMPT = `Kamu adalah asisten kurator konten mulaibaca (mulaibaca.id), platform membaca keluarga Indonesia.

Tugasmu: melengkapi data buku yang belum punya deskripsi, kategori, dan tags.

Aturan:
- Deskripsi: tulis 2-3 paragraf dalam Bahasa Indonesia yang mengundang minat baca — ceritakan sedikit tentang isi buku, kenapa buku ini menarik, dan apa yang bisa pembaca dapatkan. Gaya: hangat, mengalir, kayak rekomendasi teman. JANGAN copy dari sumber lain — tulis dengan kata-katamu sendiri.
- Kategori: pilih dari daftar sub-kategori yang tersedia di bawah. Pilih 1-3 yang paling sesuai. Output dalam bentuk array of strings.
- Tags: 3-8 tag pendek dalam Bahasa Indonesia (bisa kata/frasa 1-2 kata) yang merepresentasikan isi buku. Misal: ["petualangan", "persahabatan", "keluarga", "self-discovery"].
- Jika buku sudah punya data di suatu field, KOSONGKAN string/array — jangan timpa data yang sudah ada.
- HANYA output JSON valid, tanpa markdown fence, tanpa penjelasan.

Daftar sub-kategori yang tersedia:
${CATEGORY_LIST}

JSON output:
{
  "description": "deskripsi dalam Bahasa Indonesia (2-3 paragraf) ATAU string kosong jika sudah ada deskripsi",
  "categories": ["sub-key-1", "sub-key-2"] ATAU [] jika sudah punya kategori,
  "tags": ["tag1", "tag2", "tag3"] ATAU [] jika sudah punya tags
}`;

export async function POST(request: NextRequest) {
  const { bookId } = await request.json();
  if (!bookId) {
    return NextResponse.json({ error: "bookId diperlukan" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: book, error } = await admin
    .from("books")
    .select("id, title, author, description, categories, tags, open_library_id, enrichment_status")
    .eq("id", bookId)
    .maybeSingle();

  if (error || !book) {
    return NextResponse.json({ error: "Buku tidak ditemukan" }, { status: 404 });
  }

  const hasDescription = book.description && book.description.trim().length > 0;
  const hasCategories = (book.categories ?? []).length > 0 && !(book.categories ?? []).every((c: string) => c === "lainnya");
  const hasTags = (book.tags ?? []).length > 0;

  if (hasDescription && hasCategories && hasTags) {
    return NextResponse.json({ message: "Buku sudah lengkap, tidak perlu AI enrich" });
  }

  const olContext = book.open_library_id
    ? `Open Library ID: ${book.open_library_id}`
    : "Belum ada Open Library ID";

  const userPrompt = `Lengkapi data buku berikut:

Judul: "${book.title}"
Penulis: "${book.author}"
${olContext}
${book.description ? `Deskripsi (sudah ada — biarkan): ${book.description.slice(0, 100)}` : "Deskripsi (belum ada — buatkan)"}
Kategori sekarang: ${JSON.stringify(book.categories ?? [])}
Tags sekarang: ${JSON.stringify(book.tags ?? [])}

HANYA output JSON, tanpa markdown fence.`;

  const apiKey = process.env.OPENCODE_ZEN_API_KEY || process.env.ANTHROPIC_API_KEY;
  const isOpenCodeZen = !!process.env.OPENCODE_ZEN_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI API key tidak dikonfigurasi" }, { status: 500 });
  }

  const endpoint = isOpenCodeZen
    ? "https://opencode.ai/zen/v1/messages"
    : "https://api.anthropic.com/v1/messages";
  const model = isOpenCodeZen
    ? process.env.THREADS_AI_MODEL || "nemotron-3-ultra-free"
    : "claude-haiku-4-5-20251001";
  let maxTokens = 1500;
  if (isOpenCodeZen) maxTokens += 4000;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: [{ type: "text", text: userPrompt }] }],
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { error: result.error?.message || "API error" },
        { status: 500 }
      );
    }

    const textBlock = (result.content as Array<{ type: string; text?: string }>)
      .filter((b) => b.type === "text" && b.text)
      .map((b) => b.text)
      .join("\n");

    if (!textBlock) {
      return NextResponse.json({ error: "AI tidak mengembalikan teks" }, { status: 500 });
    }

    const jsonStr = textBlock.match(/\{[\s\S]*\}/)?.[0];
    if (!jsonStr) {
      return NextResponse.json({ error: "Format respons AI tidak valid" }, { status: 500 });
    }

    const parsed = JSON.parse(jsonStr);
    const updates: Record<string, unknown> = {};

    if (!hasDescription && parsed.description && typeof parsed.description === "string") {
      updates.description = parsed.description.trim();
    }
    if (!hasCategories && Array.isArray(parsed.categories) && parsed.categories.length > 0) {
      const valid = parsed.categories.filter((k: string) =>
        CATEGORY_TREE.some((root) => root.children.some((sub) => sub.key === k))
      );
      if (valid.length > 0) updates.categories = valid;
    }
    if (!hasTags && Array.isArray(parsed.tags) && parsed.tags.length > 0) {
      updates.tags = parsed.tags.slice(0, 20).map((t: string) => t.toLowerCase().trim()).filter(Boolean);
    }

    if (Object.keys(updates).length === 0) {
      await admin.from("books").update({ enrichment_status: "enriched" }).eq("id", bookId);
      return NextResponse.json({ message: "Tidak ada field baru yang perlu diisi, status diupdate" });
    }

    updates.enrichment_status = "enriched";

    const { error: updateError } = await admin
      .from("books")
      .update(updates)
      .eq("id", bookId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ message: "AI enrichment berhasil", updated: Object.keys(updates) });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Gagal terhubung ke AI" },
      { status: 500 }
    );
  }
}
