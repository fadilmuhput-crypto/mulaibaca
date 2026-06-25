"use client";

import { useRouter } from "next/navigation";
import BukuForm from "../BukuForm";

export default function TambahBukuAdminPage() {
  const router = useRouter();

  async function handleSubmit(data: Parameters<Parameters<typeof BukuForm>[0]["onSubmit"]>[0]) {
    const res = await fetch("/api/admin/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Gagal menambah buku");
    router.push("/admin/buku");
    router.refresh();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-h1">Tambah Buku Kurasi</h1>
        <p className="text-sm text-ink-muted mt-0.5">Isi detail buku atau cari di OpenLibrary untuk pre-fill otomatis</p>
      </div>
      <BukuForm onSubmit={handleSubmit} />
    </div>
  );
}
