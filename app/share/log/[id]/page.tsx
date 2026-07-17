import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import SharePreview from "./SharePreview";

export default async function ShareLogPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/masuk");

  const { id } = await params;
  return <SharePreview logId={id} />;
}
