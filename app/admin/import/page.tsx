"use client";

import { useState, useCallback } from "react";
import { Upload, CheckCircle, XCircle, AlertCircle, Download } from "lucide-react";

type ImportBook = {
  title: string;
  author: string;
  status: "imported" | "skipped" | "error";
  error?: string;
  enrichment_status?: string;
};

type ImportResult = {
  imported: number;
  skipped: number;
  errors: string[];
  books: ImportBook[];
};

export default function ImportPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const urls = input
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const validCount = urls.filter((u) =>
    /^https?:\/\/(www\.)?goodreads\.com\/book\/show\//.test(u) || /^\d{10}(\d{3})?$/.test(u)
  ).length;

  const handleImport = useCallback(async () => {
    if (urls.length === 0) return;
    if (!confirm(`Import ${urls.length} buku dari Goodreads? Proses ini membutuhkan beberapa menit.`)) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/import-goodreads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls }),
      });
      const json = await res.json();
      if (res.ok) {
        setResult(json);
      } else {
        alert(json.error ?? "Gagal import");
      }
    } catch {
      alert("Gagal menghubungi server");
    } finally {
      setLoading(false);
    }
  }, [urls]);

  const downloadReport = useCallback(() => {
    if (!result) return;
    const lines = [
      "Status,Title,Author,Source,Enrichment,Error",
      ...result.books.map((b) =>
        `"${b.status}","${b.title}","${b.author}","import","${b.enrichment_status ?? ""}","${b.error ?? ""}"`
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `import-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [result]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-ink">Import dari Goodreads</h1>
        <p className="text-sm text-ink-muted mt-1">
          Paste link Goodreads atau ISBN, sistem akan otomatis mencari dan menambahkan buku ke catalog.
        </p>
      </div>

      {!result && (
        <div className="space-y-4">
          <div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={"https://www.goodreads.com/book/show/12345-book-title\nhttps://www.goodreads.com/book/show/67890-another-book\n9781234567890"}
              rows={12}
              className="w-full px-4 py-3 rounded-xl border-2 border-border bg-surface text-sm font-mono placeholder:text-ink-muted/50 focus:outline-none focus:border-amber resize-none"
              disabled={loading}
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-ink-muted">
                {urls.length} URL terdeteksi
                {validCount < urls.length && (
                  <span className="text-amber ml-1">
                    ({urls.length - validCount} tidak valid)
                  </span>
                )}
              </p>
              <p className="text-xs text-ink-muted">Maksimal 100 URL</p>
            </div>
          </div>

          <button
            onClick={handleImport}
            disabled={loading || urls.length === 0}
            className="btn-primary flex items-center gap-2"
          >
            <Upload size={16} />
            {loading ? "Mengimpor…" : `Import ${urls.length} Buku`}
          </button>

          {loading && (
            <div className="space-y-2">
              <div className="w-full h-1 bg-border/50 rounded-full overflow-hidden">
                <div className="h-full bg-amber rounded-full animate-pulse" style={{ width: "30%" }} />
              </div>
              <p className="text-xs text-ink-muted text-center">
                Sedang memproses… setiap buku membutuhkan ~1-2 detik
              </p>
            </div>
          )}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className={`rounded-2xl p-4 border ${result.errors.length > 0 ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"}`}>
            <div className="flex items-center gap-2 font-semibold text-sm mb-2">
              {result.errors.length > 0 ? (
                <AlertCircle size={16} className="text-amber" />
              ) : (
                <CheckCircle size={16} className="text-green-600" />
              )}
              Import Selesai
            </div>
            <div className="flex gap-4 text-sm">
              <span className="text-green-600 font-semibold">{result.imported} ditambahkan</span>
              <span className="text-ink-muted">{result.skipped} dilewati</span>
              <span className="text-red-500">{result.errors.length} error</span>
            </div>
          </div>

          {result.books.length > 0 && (
            <div className="bg-surface border border-border rounded-2xl overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-parchment border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-ink-muted">Status</th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-ink-muted">Judul</th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-ink-muted">Penulis</th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-ink-muted">Sumber</th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-ink-muted">Enrichment</th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-ink-muted">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {result.books.map((b, i) => (
                      <tr key={i} className="hover:bg-parchment/50">
                        <td className="px-4 py-2">
                          {b.status === "imported" && <CheckCircle size={14} className="text-green-500" />}
                          {b.status === "skipped" && <AlertCircle size={14} className="text-amber" />}
                          {b.status === "error" && <XCircle size={14} className="text-red-500" />}
                        </td>
                        <td className="px-4 py-2 text-ink font-medium truncate max-w-[200px]">{b.title}</td>
                        <td className="px-4 py-2 text-ink-muted truncate max-w-[150px]">{b.author}</td>
                        <td className="px-4 py-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200">
                            Import
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          {b.status === "imported" && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              b.enrichment_status === "pending"
                                ? "bg-amber-soft text-amber border border-amber/20"
                                : "bg-error-soft text-error border border-error/20"
                            }`}>
                              {b.enrichment_status === "pending" ? "Pending" : "Failed"}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-xs text-ink-muted">{b.error ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={downloadReport} className="btn-secondary flex items-center gap-2">
              <Download size={14} />
              Download Report
            </button>
            <button
              onClick={() => { setResult(null); setInput(""); }}
              className="btn-ghost-ink"
            >
              Import Lagi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
