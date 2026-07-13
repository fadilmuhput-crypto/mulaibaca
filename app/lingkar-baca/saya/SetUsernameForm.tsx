"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Check, AtSign } from "lucide-react";

export default function SetUsernameForm({ memberId }: { memberId: string }) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const checkRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!username.trim()) { setStatus("idle"); return; }
    if (!/^[a-z0-9_]{3,30}$/.test(username)) { setStatus("invalid"); return; }
    setStatus("checking");
    if (checkRef.current) clearTimeout(checkRef.current);
    checkRef.current = setTimeout(async () => {
      const res = await fetch(`/api/profil/username-check?u=${encodeURIComponent(username)}`);
      const data = await res.json();
      setStatus(data.available ? "available" : "taken");
    }, 400);
  }, [username]);

  async function handleSave() {
    if (status !== "available") return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/keluarga/anggota", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, username }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-[10px] text-amber hover:text-amber/80 transition-colors mt-0.5 inline-block"
      >
        + Atur username
      </button>
    );
  }

  return (
    <div className="mt-1.5 flex items-center gap-1.5">
      <div className="relative flex-1">
        <AtSign size={11} strokeWidth={2} className="absolute left-2 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
        <input
          autoFocus
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
          placeholder="username"
          className="w-full pl-6 pr-6 py-1 text-[11px] rounded-lg border border-border bg-parchment focus:outline-none focus:border-amber"
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        />
        {username && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px]">
            {status === "checking" && <span className="text-ink-muted">…</span>}
            {status === "available" && <Check size={11} strokeWidth={2.5} className="text-forest" />}
            {(status === "taken" || status === "invalid") && <span className="text-error">✕</span>}
          </span>
        )}
      </div>
      <button
        onClick={handleSave}
        disabled={saving || status !== "available"}
        className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-amber text-white disabled:opacity-40 transition-opacity"
      >
        {saving ? "…" : "Simpan"}
      </button>
      <button onClick={() => setOpen(false)} className="text-[11px] text-ink-muted hover:text-ink px-1">✕</button>
      {error && <p className="text-[10px] text-error">{error}</p>}
    </div>
  );
}
