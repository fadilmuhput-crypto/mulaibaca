"use client";

import { useState, useCallback } from "react";
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Trash2, BookCopy } from "lucide-react";

type Group = {
  key: string;
  keeper: { id: string; title: string; author: string };
  duplicates: { id: string; title: string; author: string }[];
};

export default function DedupPage() {
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [result, setResult] = useState<{ resolved: number; errors: string[] } | null>(null);

  const scan = useCallback(async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/dedup");
      const json = await res.json();
      if (res.ok) {
        setGroups(json.groups ?? []);
      } else {
        alert(json.error ?? "Gagal scan");
      }
    } catch {
      alert("Gagal fetch");
    } finally {
      setLoading(false);
    }
  }, []);

  const resolve = useCallback(async () => {
    if (!groups || groups.length === 0) return;
    if (!confirm("Yakin mau resolve semua duplikat? Tindakan ini tidak bisa dibatalkan.")) return;
    setResolving(true);
    try {
      const res = await fetch("/api/admin/dedup", { method: "POST", body: "{}" });
      const json = await res.json();
      setResult(json);
      if (res.ok) setGroups(null);
    } catch {
      alert("Gagal resolve");
    } finally {
      setResolving(false);
    }
  }, [groups]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Deduplikasi Buku</h1>
          <p className="text-sm text-ink-muted mt-1">Temukan dan gabungkan buku duplikat di database</p>
        </div>
        <button
          onClick={scan}
          disabled={loading}
          className="btn-primary-sm flex items-center gap-1.5"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "Memindai…" : "Scan Duplikat"}
        </button>
      </div>

      {result && (
        <div className={`rounded-2xl p-4 mb-6 border ${result.errors.length > 0 ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
          <div className="flex items-center gap-2 font-semibold text-sm mb-1">
            {result.errors.length > 0 ? <XCircle size={16} className="text-red-500" /> : <CheckCircle size={16} className="text-green-600" />}
            {result.errors.length > 0 ? "Ada error" : "Selesai"}
          </div>
          <p className="text-sm text-ink-muted">{result.resolved} buku di-merge</p>
          {result.errors.length > 0 && (
            <ul className="mt-2 text-xs text-red-600 space-y-0.5">
              {result.errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          )}
        </div>
      )}

      {groups === null && !result && (
        <div className="text-center py-20 text-ink-muted">
          <BookCopy size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Klik &quot;Scan Duplikat&quot; untuk memulai</p>
        </div>
      )}

      {groups !== null && groups.length === 0 && (
        <div className="text-center py-20 text-ink-muted">
          <CheckCircle size={40} className="mx-auto mb-3 text-green-400" />
          <p className="text-sm font-semibold text-ink">Tidak ada duplikat ditemukan</p>
        </div>
      )}

      {groups && groups.length > 0 && (
        <>
          <div className="space-y-4 mb-6">
            {groups.map((g) => (
              <div key={g.key} className="bg-surface border border-border rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={14} className="text-amber" />
                  <span className="text-xs font-mono text-ink-muted">{g.key}</span>
                </div>
                <div className="text-sm mb-2">
                  <span className="font-semibold text-ink">Keep:</span> {g.keeper.title} — {g.keeper.author}
                </div>
                <div className="text-xs text-ink-muted mb-1.5">Duplikat ({g.duplicates.length}):</div>
                <ul className="space-y-1">
                  {g.duplicates.map((d) => (
                    <li key={d.id} className="text-xs text-ink-secondary flex items-center gap-1.5">
                      <Trash2 size={10} className="text-red-400" />
                      {d.title} — {d.author}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <button
            onClick={resolve}
            disabled={resolving}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            {resolving ? "Menggabungkan…" : `Resolve ${groups.reduce((s, g) => s + g.duplicates.length, 0)} Duplikat`}
          </button>
        </>
      )}
    </div>
  );
}
