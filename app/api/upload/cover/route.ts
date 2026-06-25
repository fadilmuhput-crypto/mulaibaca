import { NextRequest, NextResponse } from "next/server";
import { createRouteClient, createAdminClient } from "@/lib/supabase-route";

const BUCKET = "book-covers";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: "Format tidak didukung. Gunakan JPG, PNG, atau WebP." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Ukuran file maksimal 5 MB" }, { status: 400 });

  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const filename = `${user.id}-${Date.now()}.${ext}`;
  const bytes = await file.arrayBuffer();

  const admin = createAdminClient();
  const { error: uploadError } = await admin.storage
    .from(BUCKET)
    .upload(filename, bytes, { contentType: file.type, upsert: false });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: { publicUrl } } = admin.storage.from(BUCKET).getPublicUrl(filename);
  return NextResponse.json({ url: publicUrl });
}
