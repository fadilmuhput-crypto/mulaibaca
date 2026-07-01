import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-parchment flex items-center justify-center px-4">
      <div className="max-w-sm text-center space-y-6">
        <div className="text-8xl font-display font-black text-ink leading-none opacity-20">404</div>
        <div>
          <h1 className="text-h1">Halaman tidak ditemukan</h1>
          <p className="text-sm text-ink-muted mt-2">
            Mungkin halaman ini belum ditulis, atau sudah pindah tempat.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center px-5 py-2.5 bg-amber text-white font-semibold text-sm border-2 border-ink rounded-lg shadow-brutal-sm hover:shadow-brutal transition-shadow"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
