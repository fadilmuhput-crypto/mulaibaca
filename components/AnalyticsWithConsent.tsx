"use client";

import { useEffect, useRef } from "react";
import { getConsentStatus } from "./CookieConsentBanner";

const GA_ID = "G-5KPFNZF5PW";

function loadGA() {
  if (typeof window === "undefined" || (window as any).gtag) return;

  const w = window as any;
  w.dataLayer = w.dataLayer || [];
  w.gtag = function () { w.dataLayer.push(arguments); };
  w.gtag("js", new Date());
  w.gtag("config", GA_ID, { anonymize_ip: true });

  const script = document.createElement("script");
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  script.async = true;
  document.head.appendChild(script);
}

export default function AnalyticsWithConsent() {
  const loaded = useRef(false);

  useEffect(() => {
    function checkConsent() {
      if (loaded.current) return;
      const status = getConsentStatus();
      if (status === "accepted") {
        loadGA();
        loaded.current = true;
      }
    }

    checkConsent();

    window.addEventListener("consent-update", checkConsent);
    return () => window.removeEventListener("consent-update", checkConsent);
  }, []);

  return null;
}
