import { redirect } from "next/navigation";

// Manual form moved to /jelajah/manual
export default function ManualRedirect() {
  redirect("/jelajah/manual");
}
