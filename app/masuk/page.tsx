import { redirect } from "next/navigation";
import { getSession, getSavedFamily } from "@/lib/session";
import { createClient } from "@/lib/supabase-server";
import MasukClient from "./MasukClient";
import type { Member } from "@/lib/types";

export default async function MasukPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  const savedFamily = await getSavedFamily();
  let initialMembers: Member[] = [];
  let initialFamilyName = "";
  let initialFamilyId = "";

  if (savedFamily) {
    const supabase = await createClient();
    const { data: members } = await supabase
      .from("members")
      .select("*")
      .eq("family_id", savedFamily.familyId)
      .order("created_at");
    initialMembers = (members ?? []) as Member[];
    initialFamilyName = savedFamily.familyName;
    initialFamilyId = savedFamily.familyId;
  }

  return (
    <MasukClient
      savedFamily={savedFamily}
      initialMembers={initialMembers}
      initialFamilyName={initialFamilyName}
      initialFamilyId={initialFamilyId}
    />
  );
}
