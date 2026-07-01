"use client";

import { useState, useEffect } from "react";

const CONSENT_KEY = "mulaibaca_cookie_consent";

type ConsentStatus = "undecided" | "accepted" | "rejected";

export function getConsentStatus(): ConsentStatus {
  if (typeof window === "undefined") return "undecided";
  const val = localStorage.getItem(CONSENT_KEY);
  if (val === "accepted") return "accepted";
  if (val === "rejected") return "rejected";
  return "undecided";
}

export function setConsent(value: ConsentStatus) {
  localStorage.setItem(CONSENT_KEY, value);
}

export default function CookieConsentBanner() {
  const [status, setStatus] = useState<ConsentStatus>("undecided");

  useEffect(() => {
    setStatus(getConsentStatus());
  }, []);

  if (status !== "undecided") return null;

  function handleAccept() {
    setConsent("accepted");
    setStatus("accepted");
    window.dispatchEvent(new CustomEvent("consent-update"));
  }

  function handleReject() {
    setConsent("rejected");
    setStatus("rejected");
    window.dispatchEvent(new CustomEvent("consent-update"));
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-lg mx-auto bg-ink text-parchment rounded-xl border border-ink shadow-brutal-lg p-5 space-y-4">
        <p className="text-sm leading-relaxed">
          Kami menggunakan cookie untuk analitik (Google Analytics) guna memahami pola penggunaan dan meningkatkan aplikasi. 
          Data dikirim secara anonim. Detail lengkap di{' '}
          <a href="/kebijakan-privasi" className="underline underline-offset-2 text-lime">Kebijakan Privasi</a>.
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleAccept}
            className="flex-1 px-4 py-2 bg-lime text-ink font-semibold text-sm rounded-lg border border-ink shadow-brutal-xs hover:shadow-brutal-sm transition-shadow"
          >
            Setuju
          </button>
          <button
            onClick={handleReject}
            className="px-4 py-2 bg-transparent text-parchment/70 font-medium text-sm rounded-lg border border-parchment/20 hover:bg-parchment/5 transition-colors"
          >
            Tolak
          </button>
        </div>
      </div>
    </div>
  );
}
