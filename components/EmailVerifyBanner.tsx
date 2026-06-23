"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

export default function EmailVerifyBanner({ email }: { email: string }) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendVerification() {
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    if (err) {
      setError(err.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <section className="bg-surface rounded-2xl border border-border p-4 flex items-start gap-3">
      <span className="text-xl mt-0.5">⚠️</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink mb-0.5">Email belum diverifikasi</p>
        <p className="text-xs text-ink-muted truncate">{email}</p>
        {sent ? (
          <p className="text-xs text-forest mt-2 font-medium">✓ Link verifikasi terkirim, cek emailmu</p>
        ) : error ? (
          <p className="text-xs text-red-500 mt-2">{error}</p>
        ) : (
          <button
            onClick={sendVerification}
            disabled={loading}
            className="mt-2 text-xs text-amber hover:text-amber-hover font-medium disabled:opacity-50"
          >
            {loading ? "Mengirim…" : "Kirim email verifikasi →"}
          </button>
        )}
      </div>
    </section>
  );
}
