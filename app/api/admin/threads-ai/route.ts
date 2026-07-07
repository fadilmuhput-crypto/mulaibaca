import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

// Model AI gratis bisa lambat (insight bisa >60 detik) — perpanjang batas
// eksekusi serverless function di Vercel
export const maxDuration = 120;

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
- "relate banget, anakku juga gitu dulu. terus akhirnya gimana?"

Skill community engagement (pakai secara natural, jangan kaku):
- CALLBACK: sebut ulang detail spesifik yang mereka ceritakan (judul buku, umur anak, kebiasaan unik) — ini bukti kamu beneran baca
- MIRROR: ikuti gaya bahasa mereka. Kalau mereka bilang "gamau", kamu juga "gamau" bukan "tidak mau". Kalau mereka formal, kamu sedikit lebih rapi
- VALIDASI DULU: akui perasaan/pengalaman mereka sebelum kasih ide atau tanya lagi
- JANGAN INTEROGASI: kalau 2-3 balasan terakhir kamu sudah bertanya terus, balasan berikutnya cukup relate atau cerita singkat tanpa pertanyaan
- RECIPROCITY: sesekali bagi cerita pendek dari sisi komunitas ("banyak ortu di komunitas kami juga gitu") — orang lebih terbuka kalau gak merasa diwawancara
- HUMOR: kalau mereka bercanda, ikut ketawa dulu sebelum lanjut. Jangan langsung serius`;

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

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Body request tidak valid" }, { status: 400 });
  }
  const { type, data } = body;

  // Preferences / feedback dari user yang mempengaruhi gaya AI
  const preferences = data?.preferences as string | undefined;

  let userPrompt = "";
  let maxTokens = 500;

  // Sisipkan preferensi user dari feedback sebelumnya
  const prefBlock = preferences
    ? `\n\n--- PREFERENSI USER (dari feedback sebelumnya) ---\n${preferences}\nPerhatikan preferensi ini saat menulis respons.\n`
    : "";

  if (type === "questions") {
    const { theme, audience } = data as { theme: string; audience?: string };
    const persona =
      audience === "individu"
        ? `Target: individu Indonesia (usia 18-35) yang lagi membangun kebiasaan baca — reading slump, susah konsisten, TBR numpuk, gampang ke-distract HP. Mereka baca untuk diri sendiri, bukan untuk anak.`
        : `Target: orang tua / keluarga Indonesia yang ingin menumbuhkan kebiasaan baca bersama anak di rumah.`;

    userPrompt = `Buatkan 5 pertanyaan untuk di-posting di Threads yang akan memancing percakapan organik.

${persona}

Tema: ${theme}

Kriteria:
- Mengundang cerita personal, bukan pendapat umum
- Mudah dijawab dalam 1-2 kalimat
- Relatable untuk target di atas — pakai bahasa dan situasi sehari-hari mereka
- Tidak terkesan berjualan
- Punya angle emosional, nostalgia, humor, atau praktis

Teknik engagement Threads yang terbukti (terapkan, jangan disebut):
- Mulai dari skenario spesifik yang bikin orang mikir "ini gue banget", baru bertanya
- Barrier jawab serendah mungkin: gak perlu mikir lama, gak ada jawaban salah
- Kontras memancing cerita: dulu vs sekarang, ekspektasi vs realita, rencana vs kenyataan
- Kata pengundang cerita: "ceritain dong", "pernah gak", "apa momen", "jujur aja"
- Sesekali self-deprecating / mengakui kelemahan sendiri biar orang berani jujur
- Hindari pertanyaan yang jawabannya cuma ya/tidak

PENTING: Output HANYA JSON array valid, tanpa markdown fence, tanpa penjelasan.
Mulai langsung dengan karakter [ dan akhiri dengan ].
[{"question": "...", "angle": "emotional|nostalgic|practical|funny|relatable"}]`;
    maxTokens = 800;

  } else if (type === "response") {
    const { question, messages, stage, audience } = data as {
      question: string;
      messages: Array<{ sender: string; text: string }>;
      stage: string;
      audience?: string;
    };
    const stageCtx = STAGE_CONTEXT[stage] || STAGE_CONTEXT.chatting;
    const pitch =
      audience === "individu"
        ? "platform buat bangun kebiasaan baca — bisa log bacaan harian, pasang target mingguan, gratis"
        : "platform buat keluarga yang baca bareng, bisa log bacaan harian, gratis";
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
- Callback detail spesifik dari cerita mereka, mirror gaya bahasa mereka
- Biasanya akhiri dengan 1 pertanyaan ringan — TAPI kalau balasan brand sebelumnya sudah bertanya beruntun, kali ini cukup relate/validasi tanpa pertanyaan
- Jika stage "ready", selipkan mulaibaca sambil lalu: ${pitch} — jangan kedengeran kayak iklan

Output: teks balasan saja, tanpa label atau penjelasan.`;

  } else if (type === "engage") {
    const { handle, postContext, topic, audience } = data as {
      handle: string;
      postContext: string;
      topic?: string;
      audience?: string;
    };
    const persona =
      audience === "individu"
        ? "individu Indonesia (18-35) yang membangun kebiasaan membaca"
        : "orang tua / keluarga Indonesia yang menumbuhkan kebiasaan baca bersama anak";
    const audienceTag = audience === "individu" ? "individu" : "keluarga";

    userPrompt = `${BRAND_VOICE}

Seorang user Threads (@${handle}) baru saja posting tentang ${topic || "membaca"}:

"${postContext}"

Tugas:
1. Tulis SATU balasan singkat (1-2 kalimat) untuk komen di postingan mereka.
   - WAJIB callback detail spesifik dari postingan mereka
   - Validasi dulu apa yang mereka rasakan/ceritakan
   - Akhiri dengan 1 pertanyaan ringan yang natural
   - Hindari: interogasi, jualan, promoting mulaibaca di balasan pertama ini
   - Persona target: ${persona}

2. Tentukan 1 tema yang paling cocok untuk interaksi ini (dari: reading slump, konsistensi, rekomendasi buku, parenting literasi, rutinitas baca, review buku, distraksi HP, TBR, bonding lewat buku, milestone anak)

Output HANYA JSON valid, tanpa markdown fence, tanpa penjelasan:
{
  "draft": "teks balasan 1-2 kalimat",
  "theme": "tema yang dipilih",
  "angle": "emotional|practical|funny|relatable"
}`;
    maxTokens = 500;

  } else if (type === "insight") {
    const { question, conversations, audience, pillar } = data as {
      question: string;
      conversations: Array<{
        audienceName: string;
        messages: Array<{ sender: string; text: string }>;
      }>;
      audience?: string;
      pillar?: { name: string; description: string; goals: string; cta_style: string; temas: string[]; channels: string[] };
    };
    const insightPersona =
      audience === "individu"
        ? `Target audience diskusi ini: INDIVIDU (18-35) yang membangun kebiasaan baca untuk diri sendiri — reading slump, susah konsisten, gampang ke-distract HP. Konten Instagram yang dihasilkan harus relevan untuk pembaca individu ini, BUKAN untuk orang tua/parenting.`
        : `Target audience diskusi ini: KELUARGA — orang tua Indonesia yang menumbuhkan kebiasaan baca bersama anak. Konten Instagram yang dihasilkan harus relevan untuk konteks parenting/keluarga.`;

    const convSummary = conversations
      .map((c, i) => {
        const msgs = c.messages
          .map((m) => `${m.sender === "audience" ? c.audienceName : "Brand"}: ${m.text}`)
          .join("\n");
        return `--- Percakapan ${i + 1} (${c.audienceName}) ---\n${msgs}`;
      })
      .join("\n\n");

    const pillarBlock = pillar
      ? `\n--- PANDUAN CONTENT PILLAR ---\nPillar: ${pillar.name}\nDeskripsi: ${pillar.description}\nTujuan: ${pillar.goals}\nCTA Style: ${pillar.cta_style}\nTema: ${pillar.temas.join(", ")}\nChannel: ${pillar.channels.join(", ")}\nSemua ide konten harus selaras dengan pillar ini.`

    : "";

    userPrompt = `Analisis percakapan Threads berikut.

${insightPersona}
${pillarBlock}

Pertanyaan: "${question}"

${convSummary}

Semua insight dan ide konten harus ditulis dari sudut pandang target audience di atas — bahasa, situasi, dan CTA-nya menyesuaikan.

SKILL CONTENT WRITER — blog "Cerita dari Komunitas":
Tulis 1 artikel blog 300-500 kata dengan struktur:
- Judul: provokatif-emoinsif, maksimal 12 kata, pakai kata "Kami bertanya..." atau turunannya
- Hook (2-3 kalimat): buka dengan pertanyaan yang diposting, lalu gambarkan momen ketika jawaban mulai berdatangan
- Badan artikel:
  - Paragraf 2-3: ringkasan jawaban audiens — kutip 1-2 jawaban menarik secara anonim, pakai tanda kutip dan deskripsi singkat konteksnya
  - Paragraf 4: pola yang muncul dari percakapan — "Ternyata, dari sekian banyak jawaban, ada satu benang merah..."
  - Paragraf 5: reframe atau sudut pandang baru yang muncul
  - Paragraf 6: empowerment — mengapa ini relevan untuk pembaca
- Penutup: ajakan reflektif (bukan hard sell), 1-2 kalimat, tanpa CTA produk — cukup tutup dengan kalimat yang mengundang pembaca untuk merenung
- Nada: hangat, mengalir seperti cerita, seolah-olah kamu menulis surat untuk teman dekat. Gaya storytelling jurnalistik feature ringan
- Jangan gunakan daftar (bullet/numbered list) — semuanya paragraf naratif
- Target output panjang: 300-500 kata

SKILL SOCIAL MEDIA SPECIALIST — pola carousel "Dari Percakapan Komunitas" (WAJIB diikuti untuk carousel):
Arc cerita 7 slide, dari pertanyaan → jawaban komunitas → pola → makna → ajakan:
- Slide 1 (Hook): buka dengan "Kami bertanya..." + pertanyaan yang diposting + subheadline penasaran ("Dan jawabannya lebih [mengharukan/jujur/relate] dari yang kami bayangkan.")
- Slide 2 (Jawaban umum): "Banyak yang menjawab..." + daftar jawaban terpopuler dari percakapan NYATA, pakai emoji per item + 1 kutipan pendek anonim dari percakapan
- Slide 3 (Jawaban tak terduga): "Ada juga yang menjawab..." + jawaban unik/berbeda + penutup "Setiap perjalanan ternyata berbeda."
- Slide 4 (Pola): "Tapi ada satu pola yang terus muncul." + 1 kalimat pola dari percakapan
- Slide 5 (Reframe): "Mungkin..." + pergeseran cara pandang, singkat dan menghentak (2-3 baris pendek)
- Slide 6 (Empowerment): "Itu berarti... kita semua punya kesempatan..." + siapa saja yang bisa terdampak
- Slide 7 (CTA): emoji tunggal 🌱 + kalimat lembut penutup + soft intro mulaibaca.id + tagline pendek
Aturan penulisan slide:
- Teks per slide SEDIKIT — maksimal 4-6 baris pendek, ini teks di gambar bukan caption
- Kutipan audiens dibuat anonim, boleh parafrase, jangan sebut nama/handle asli
- CTA selalu soft selling: gak nyuruh beli/daftar, tapi mengundang ("Satu orang mulai. Kebiasaan baik menyebar.")
- Nada: hangat, reflektif, sedikit puitis di slide 5-7 — bukan listicle kering

Pola CAPTION carousel (WAJIB diikuti, arc-nya beda dari slide):
1. Recap: "Beberapa hari lalu kami bertanya:" + pertanyaan (pakai tanda kutip)
2. "Jawabannya beragam." + rangkum jenis-jenis jawaban dalam 1-2 kalimat
3. "Tapi ada satu benang merah yang kami temukan." + pola utama (frasa kunci di-bold pakai **...**)
4. Reframe singkat: "Mungkin, [kebiasaan/hal ini] memang tidak dimulai dari [X]. Melainkan dari [Y]."
5. Apresiasi komunitas: "Terima kasih untuk semua yang sudah berbagi cerita. 🤍"
6. Re-ask untuk pancing engagement baru: "Kalau belum sempat ikut menjawab, kami masih penasaran:" + ulangi pertanyaan (bold)
Tulis caption dengan line break antar bagian (baris pendek-pendek, mudah dibaca di IG), bukan paragraf padat.

PENTING: Output HANYA JSON valid, tanpa markdown fence, tanpa penjelasan.
Mulai langsung dengan karakter { dan akhiri dengan }.
{
  "themes": ["tema 1", "tema 2", "tema 3"],
  "insights": ["insight 1", "insight 2", "insight 3"],
  "content_ideas": [
    {
      "type": "carousel",
      "title": "judul internal carousel",
      "slides": [
        {"label": "Hook", "heading": "Kami bertanya...", "body": "\\"[pertanyaan]\\"\\n\\nDan jawabannya..."},
        {"label": "Jawaban umum", "heading": "Banyak yang menjawab...", "body": "..."},
        {"label": "Jawaban tak terduga", "heading": "Ada juga yang menjawab...", "body": "..."},
        {"label": "Pola", "heading": "Tapi ada satu pola yang terus muncul.", "body": "..."},
        {"label": "Reframe", "heading": "Mungkin...", "body": "..."},
        {"label": "Empowerment", "heading": "Itu berarti...", "body": "..."},
        {"label": "CTA", "heading": "🌱", "body": "... MulaiBaca — [tagline pendek]"}
      ],
      "caption": "caption IG lengkap mengikuti Pola CAPTION carousel di atas (recap → jawaban beragam → benang merah → reframe → terima kasih 🤍 → re-ask pertanyaan), baris pendek-pendek dengan line break",
      "cta": "CTA soft selling 1 kalimat"
    },
    {
      "type": "single",
      "title": "judul post",
      "hook": "kalimat pembuka yang menarik",
      "body": "isi caption (2-3 paragraf pendek, bisa pakai line break, storytelling dari percakapan nyata)",
      "cta": "CTA soft selling"
    },
    {
      "type": "quote",
      "text": "quote dari percakapan nyata (parafrase boleh, jangan sebut nama asli)",
      "context": "konteks singkat quote ini",
      "cta": "CTA soft selling"
    },
    {
      "type": "blog",
      "title": "judul artikel",
      "body": "isi artikel blog full 300-500 kata dalam satu string dengan paragraf dipisah \\n\\n. Gaya storytelling naratif. JANGAN gunakan format HTML/markdown heading — cukup paragraf.",
      "cta": "kalimat penutup reflektif, 1-2 kalimat"
    }
  ]
}`;
    maxTokens = 4000;
  } else {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const finalPrompt = prefBlock ? `${prefBlock}\n${userPrompt}` : userPrompt;

  const endpoint = isOpenCodeZen
    ? "https://opencode.ai/zen/v1/messages"
    : "https://api.anthropic.com/v1/messages";
  // nemotron-3-ultra-free: hasil test paling natural untuk bahasa santai
  // Indonesia dan bukan reasoning model (hemat token). Override via env
  // THREADS_AI_MODEL tanpa perlu ubah kode (mis. big-pickle, deepseek-v4-flash-free)
  const model = isOpenCodeZen
    ? process.env.THREADS_AI_MODEL || "nemotron-3-ultra-free"
    : "claude-haiku-4-5-20251001";
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
        messages: [{ role: "user", content: [{ type: "text", text: finalPrompt }] }],
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
