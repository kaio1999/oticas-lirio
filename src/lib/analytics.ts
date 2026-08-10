export type AnalyticsEvent =
  | "clique_whatsapp"
  | "clique_contato"
  | "clique_telefone";

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (
      command: "config" | "event" | "js",
      targetId: string | Date,
      params?: EventParams,
    ) => void;
    dataLayer?: unknown[];
  }
}

/** Dispara evento no GA4 (no-op se o script não estiver carregado). */
export function trackEvent(name: AnalyticsEvent, params?: EventParams) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}

export function trackWhatsApp(place: string) {
  trackEvent("clique_whatsapp", { place });
}

export function trackContact(place: string) {
  trackEvent("clique_contato", { place });
}

export function trackPhone(place: string) {
  trackEvent("clique_telefone", { place });
}
