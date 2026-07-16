import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function TantanganPage() {
  const session = await getSession();
  if (!session) redirect("/masuk");
  redirect("/komunitas");
}
