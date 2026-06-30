"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { trackSignup } from "@/lib/analytics";

export default function CobaPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function start() {
      try {
        const supabase = createClient();

        // If already logged in as a real user, go to dashboard
        const { data: { user } } = await supabase.auth.getUser();
        if (user && !user.is_anonymous) {
          router.replace("/dashboard");
          return;
        }

        // If already anonymous, just set up (idempotent) and go
        if (!user) {
          const { error } = await supabase.auth.signInAnonymously();
          if (error) throw error;
        }

        // Create family + member if needed
        const res = await fetch("/api/auth/anonymous-setup", { method: "POST" });
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error ?? "Setup gagal");
        }

        trackSignup("anonymous");
        router.replace("/dashboard");
      } catch (e) {
        setErrorMsg(e instanceof Error ? e.message : "Terjadi kesalahan");
        setStatus("error");
      }
    }
    start();
  }, [router]);

  if (status === "error") {
    return (
      <div className="min-h-dvh bg-parchment flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="font-semibold text-ink mb-2">Gagal memulai mode tamu</p>
          <p className="text-sm text-ink-muted mb-4">{errorMsg}</p>
          <p className="text-xs text-ink-muted mb-4">
            Pastikan <strong>Anonymous Sign-ins</strong> sudah diaktifkan di Supabase Dashboard → Authentication → Settings.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setStatus("loading"); setErrorMsg(""); }} className="btn-primary">
              Coba lagi
            </button>
            <Link href="/daftar" className="btn-secondary">Daftar biasa</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-parchment flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-amber border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-semibold text-ink">Menyiapkan ruang bacamu…</p>
        <p className="text-sm text-ink-muted mt-1">Sebentar ya</p>
      </div>
    </div>
  );
}
