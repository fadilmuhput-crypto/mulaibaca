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
    <section className="bg-info-soft border border-info/20 rounded-2xl p-4 flex items-start gap-3">
      <svg className="w-5 h-5 text-info flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink mb-0.5">Email belum diverifikasi</p>
        <p className="text-xs text-ink-muted truncate">{email}</p>

        {sent ? (
          <p className="text-xs text-success mt-2 font-medium">✓ Link verifikasi terkirim — cek emailmu</p>
        ) : error ? (
          <p className="text-xs text-error mt-2">{error}</p>
        ) : (
          <button
            onClick={sendVerification}
            disabled={loading}
            className="mt-2.5 btn-ghost-ink min-h-[36px] px-0 text-xs text-info hover:text-info/80"
          >
            {loading ? "Mengirim…" : "Kirim email verifikasi →"}
          </button>
        )}
      </div>
    </section>
  );
}
