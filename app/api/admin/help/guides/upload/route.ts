import { NextRequest, NextResponse } from "next/server";
import { createRouteClient, createAdminClient } from "@/lib/supabase-route";
import { getSession } from "@/lib/session";

const BUCKET = "help-guides";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const session = await getSession();
  if (!session?.isCmsAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: "Format tidak didukung. Gunakan JPG, PNG, atau WebP." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Ukuran file maksimal 5 MB" }, { status: 400 });

  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const filename = `guide-${Date.now()}.${ext}`;
  const bytes = await file.arrayBuffer();

  const admin = createAdminClient();
  const { error } = await admin.storage
    .from(BUCKET)
    .upload(filename, bytes, { contentType: file.type, upsert: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: { publicUrl } } = admin.storage.from(BUCKET).getPublicUrl(filename);
  return NextResponse.json({ url: publicUrl });
}
