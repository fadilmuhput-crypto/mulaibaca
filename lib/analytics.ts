type EventParams = Record<string, string | number | boolean>;

export function trackEvent(action: string, params?: EventParams) {
  if (typeof window === "undefined" || !(window as any).gtag) return;
  try {
    (window as any).gtag("event", action, params);
  } catch {
    // silent
  }
}

export function trackClick(label: string, category = "engagement") {
  trackEvent("click", { event_category: category, event_label: label });
}

export function trackSignup(method: "email" | "google" | "anonymous" | "invite") {
  trackEvent("signup", { method });
}

export function trackOnboarding(step: number, action: "start" | "complete" | "skip") {
  trackEvent("onboarding", { step, action });
}

export function trackUpgrade() {
  trackEvent("upgrade", { from: "anonymous", to: "registered" });
}
