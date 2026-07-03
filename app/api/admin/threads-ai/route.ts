import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

const BRAND_VOICE = `Kamu adalah social media manager mulaibaca (mulaibaca.id), platform membaca keluarga Indonesia.

Tentang mulaibaca:
- Platform digital untuk keluarga membangun kebiasaan membaca bersama
- Fitur: rak buku bersama, log bacaan harian, review buku, undang anggota keluarga
- Target: orang tua & keluarga Indonesia yang ingin menumbuhkan cinta baca pada anak
- Gratis untuk mulai, bisa invite seluruh keluarga

Brand voice — gaya ngobrol di Threads:
- Ngobrol kayak temen, bukan customer service. Santai, hangat, gak formal
- Pakai "aku/kamu", dan kata sehari-hari: gak, banget, sih, nih, deh, wkwk (kalau konteksnya lucu)
- PENDEK. 1-2 kalimat aja. Orang di Threads gak baca paragraf
- Jangan mengulang/merangkum apa yang audiens bilang — langsung tanggapi
- Hindari kata kaku: "efektif", "langkah yang bagus", "solusi", "mengembangkan"
- Jangan pakai tanda seru berlebihan, jangan terdengar excited palsu
- Reaksi dulu (relate/kaget/ketawa), baru tanya
- Maksimal 1 emoji, sering-sering tanpa emoji
- Gak pernah jualan duluan. Kalau memang waktunya cerita soal mulaibaca, sebut sambil lalu aja

Contoh nada yang benar:
- "wah 4 tahun konsisten?? itu gak gampang lho. sekarang anaknya udah bisa milih buku sendiri?"
- "haha Doraemon emang gak pernah gagal ya. dia lebih suka baca sendiri atau dibacain?"
- "relate banget, anakku juga gitu dulu. terus akhirnya gimana?"`;

const STAGE_CONTEXT: Record<string, string> = {
  new: "Audiens baru saja membalas. Tujuan: kenali mereka dulu, buat mereka merasa didengar, ajukan 1 pertanyaan lanjutan yang genuine.",
  chatting: "Percakapan sudah berjalan. Tujuan: jaga momentum, gali lebih dalam cerita mereka, bangun koneksi personal.",
  warm: "Audiens sudah terbuka dan antusias. Tujuan: dalami lebih jauh, identifikasi apakah ada kebutuhan yang bisa mulaibaca bantu.",
  ready: "Audiens menunjukkan sinyal kuat bahwa mereka butuh solusi. Tujuan: perkenalkan mulaibaca secara natural sebagai solusi, tanpa terkesan hard sell.",
  pitched: "mulaibaca sudah diperkenalkan. Tujuan: follow up ringan, jawab pertanyaan jika ada, dorong untuk coba.",
};

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.isCmsAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.OPENCODE_ZEN_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key belum dikonfigurasi di .env.local" },
      { status: 500 }
    );
  }
  const isOpenCodeZen = !!process.env.OPENCODE_ZEN_API_KEY;

  const { type, data } = await request.json();

  let userPrompt = "";
  let maxTokens = 500;

  if (type === "questions") {
    const { theme } = data as { theme: string };
    userPrompt = `Buatkan 5 pertanyaan untuk di-posting di Threads yang akan memancing percakapan organik dari orang tua Indonesia.

Tema: ${theme}

Kriteria:
- Mengundang cerita personal, bukan pendapat umum
- Mudah dijawab dalam 1-2 kalimat
- Relatable untuk orang tua Indonesia
- Tidak terkesan berjualan
- Punya angle emosional, nostalgia, humor, atau praktis

PENTING: Output HANYA JSON array valid, tanpa markdown fence, tanpa penjelasan.
Mulai langsung dengan karakter [ dan akhiri dengan ].
[{"question": "...", "angle": "emotional|nostalgic|practical|funny|relatable"}]`;
    maxTokens = 800;

  } else if (type === "response") {
    const { question, messages, stage } = data as {
      question: string;
      messages: Array<{ sender: string; text: string }>;
      stage: string;
    };
    const stageCtx = STAGE_CONTEXT[stage] || STAGE_CONTEXT.chatting;
    const history = messages
      .map((m) => `${m.sender === "audience" ? "AUDIENS" : "BRAND"}: ${m.text}`)
      .join("\n");

    userPrompt = `Pertanyaan yang diposting di Threads: "${question}"

Percakapan sejauh ini:
${history}

Stage percakapan: ${stage}
Konteks: ${stageCtx}

Tulis SATU balasan singkat untuk pesan terakhir audiens.
- 1-2 kalimat AJA, kayak reply Threads beneran
- ${stageCtx}
- Reaksi dulu, lalu 1 pertanyaan follow-up ringan (kecuali stage sudah pitched)
- Jika stage "ready", selipkan mulaibaca sambil lalu: platform buat keluarga yang baca bareng, bisa log bacaan harian, gratis — jangan kedengeran kayak iklan

Output: teks balasan saja, tanpa label atau penjelasan.`;

  } else if (type === "insight") {
    const { question, conversations } = data as {
      question: string;
      conversations: Array<{
        audienceName: string;
        messages: Array<{ sender: string; text: string }>;
      }>;
    };

    const convSummary = conversations
      .map((c, i) => {
        const msgs = c.messages
          .map((m) => `${m.sender === "audience" ? c.audienceName : "Brand"}: ${m.text}`)
          .join("\n");
        return `--- Percakapan ${i + 1} (${c.audienceName}) ---\n${msgs}`;
      })
      .join("\n\n");

    userPrompt = `Analisis percakapan Threads berikut.

Pertanyaan: "${question}"

${convSummary}

PENTING: Output HANYA JSON valid, tanpa markdown fence, tanpa penjelasan.
Mulai langsung dengan karakter { dan akhiri dengan }.
{
  "themes": ["tema 1", "tema 2", "tema 3"],
  "insights": ["insight 1", "insight 2", "insight 3"],
  "content_ideas": [
    {
      "type": "carousel",
      "title": "judul carousel",
      "hook": "slide 1 - hook kuat",
      "slides": ["slide 1", "slide 2", "slide 3", "slide 4", "slide 5 - CTA"],
      "cta": "CTA caption"
    },
    {
      "type": "single",
      "title": "judul post",
      "hook": "kalimat pembuka yang menarik",
      "body": "isi caption (2-3 paragraf pendek, bisa pakai line break)",
      "cta": "CTA"
    },
    {
      "type": "quote",
      "text": "quote dari percakapan nyata (parafrase boleh, jangan sebut nama asli)",
      "context": "konteks singkat quote ini",
      "cta": "CTA"
    }
  ]
}`;
    maxTokens = 1200;
  } else {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const endpoint = isOpenCodeZen
    ? "https://opencode.ai/zen/v1/messages"
    : "https://api.anthropic.com/v1/messages";
  const model = isOpenCodeZen ? "big-pickle" : "claude-haiku-4-5-20251001";
  // big-pickle (DeepSeek V4 Flash) adalah reasoning model: token reasoning
  // ikut terhitung di max_tokens — task kompleks bisa makan ribuan token
  // sebelum teks keluar, jadi buffernya harus sangat besar
  if (isOpenCodeZen) maxTokens += 8000;

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
        system: BRAND_VOICE,
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
      const reason =
        result.stop_reason === "max_tokens"
          ? "Output AI terpotong (kehabisan token) — coba generate ulang."
          : "AI tidak mengembalikan teks — coba generate ulang.";
      return NextResponse.json({ error: reason }, { status: 500 });
    }

    return NextResponse.json({ text: textBlock });
  } catch {
    return NextResponse.json({ error: "Gagal terhubung ke AI" }, { status: 500 });
  }
}
