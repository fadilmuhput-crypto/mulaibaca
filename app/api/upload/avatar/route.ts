import { NextRequest, NextResponse } from "next/server";
import { createRouteClient, createAdminClient } from "@/lib/supabase-route";

export async function POST(req: NextRequest) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data: member } = await admin
    .from("members")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "Ukuran maksimal 2MB" }, { status: 400 });
  }

  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: "Format harus JPEG, PNG, atau WebP" }, { status: 400 });
  }

  // Ensure bucket exists
  const { data: buckets } = await admin.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === "avatars");
  if (!exists) {
    await admin.storage.createBucket("avatars", { public: true });
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${member.id}/${Date.now()}.${ext}`;

  const { error: uploadErr } = await admin.storage
    .from("avatars")
    .upload(path, file, { contentType: file.type, upsert: true });

  if (uploadErr) {
    return NextResponse.json({ error: "Gagal upload" }, { status: 500 });
  }

  const { data: urlData } = admin.storage.from("avatars").getPublicUrl(path);
  const publicUrl = urlData?.publicUrl;
  if (!publicUrl) return NextResponse.json({ error: "Gagal generate URL" }, { status: 500 });

  // Delete old avatar if it's an uploaded image (not an icon key)
  const { data: currentMember } = await admin
    .from("members")
    .select("avatar")
    .eq("id", member.id)
    .single();

  if (currentMember?.avatar && currentMember.avatar.includes("/")) {
    // Extract path from URL and delete
    const oldPath = currentMember.avatar.split("/avatars/")[1];
    if (oldPath) {
      await admin.storage.from("avatars").remove([oldPath]);
    }
  }

  return NextResponse.json({ url: publicUrl });
}
