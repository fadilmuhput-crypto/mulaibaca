"use client";

import { useRouter } from "next/navigation";
import BukuForm from "../BukuForm";
import type { AdminBook } from "../page";

export default function EditBukuClient({ book }: { book: AdminBook }) {
  const router = useRouter();

  async function handleSubmit(data: Parameters<Parameters<typeof BukuForm>[0]["onSubmit"]>[0]) {
    const res = await fetch(`/api/admin/books/${book.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Gagal menyimpan perubahan");
    router.push("/admin/buku");
    router.refresh();
  }

  return <BukuForm book={book} onSubmit={handleSubmit} />;
}
