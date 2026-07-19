import Link from "next/link";

export default function FeedNotFound() {
  return (
    <div className="min-h-dvh bg-parchment flex items-center justify-center px-4">
      <div className="max-w-sm text-center space-y-6">
        <div className="text-6xl font-display font-black text-ink leading-none opacity-20">:(</div>
        <div>
          <h1 className="text-h1">Aktivitas tidak ditemukan</h1>
          <p className="text-sm text-ink-muted mt-2">
            Aktivitas ini mungkin sudah dihapus atau tidak tersedia.
          </p>
        </div>
        <Link
          href="/feed"
          className="inline-flex items-center px-5 py-2.5 bg-amber text-white font-semibold text-sm border-2 border-ink rounded-lg shadow-brutal-sm hover:shadow-brutal transition-shadow"
        >
          Lihat Timeline
        </Link>
      </div>
    </div>
  );
}
