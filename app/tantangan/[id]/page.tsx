import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function TantanganDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/masuk");
  redirect(`/komunitas/tantangan/${id}`);
}
