"use client";

export default function LogError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  console.error("[log]", error.message, error.digest);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-3 max-w-sm">
        <div className="text-4xl">😵</div>
        <h1 className="text-h2">Ada yang error</h1>
        <p className="text-sm text-ink-muted">
          Halaman log gagal dimuat. Coba refresh atau hubungi kami.
        </p>
        <button
          onClick={reset}
          className="inline-block mt-2 px-5 py-2.5 bg-amber text-white font-semibold rounded-xl hover:bg-amber-hover transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
