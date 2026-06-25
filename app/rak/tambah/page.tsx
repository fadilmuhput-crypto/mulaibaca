import { redirect } from "next/navigation";

// Discovery page moved to /jelajah
export default function TambahBukuRedirect() {
  redirect("/jelajah");
}
