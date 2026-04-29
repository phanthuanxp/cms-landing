"use client";

import { EVENT_NAMES, type CTAType, type FormType } from "@/lib/tracking/constants";
import type { TrackingConfigPublic } from "@/lib/tracking/types";
import { getAttributionData } from "@/lib/tracking/utm";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

let trackingConfig: TrackingConfigPublic | null = null;
const firedConversions = new Set<string>();

export function initTracking(config: TrackingConfigPublic): void {
  trackingConfig = config;
}

function pushDataLayer(event: string, data: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...data });
}

function fireGtagEvent(event: string, params: Record<string, unknown>): void {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", event, params);
}

function fireGoogleAdsConversion(label: string): void {
  if (!trackingConfig?.googleAdsConversionId || !label) return;

  const key = `${trackingConfig.googleAdsConversionId}/${label}`;
  if (firedConversions.has(key)) return;
  firedConversions.add(key);

  if (trackingConfig.gtmId) {
    pushDataLayer("conversion", {
      send_to: key
    });
  } else if (window.gtag) {
    window.gtag("event", "conversion", {
      send_to: key
    });
  }
}

async function sendInternalEvent(
  eventName: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  if (!trackingConfig?.enableInternalAnalytics || !trackingConfig.tenantId) return;

  const attribution = getAttributionData();

  try {
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId: trackingConfig.tenantId,
        eventName,
        path: window.location.pathname,
        locale: document.documentElement.lang || undefined,
        referrer: document.referrer || undefined,
        metadata,
        ...attribution
      }),
      keepalive: true
    });
  } catch {
    // silently fail — internal analytics is supplementary
  }
}

function getConversionLabel(eventType: string): string | undefined {
  if (!trackingConfig?.googleAdsConversionLabels) return undefined;
  const labels = trackingConfig.googleAdsConversionLabels;
  return labels[eventType] ?? undefined;
}

export function trackEvent(
  eventName: string,
  data: Record<string, unknown> = {}
): void {
  if (!trackingConfig) return;

  const eventData = {
    ...data,
    tenant_id: trackingConfig.tenantId,
    page_path: typeof window !== "undefined" ? window.location.pathname : undefined,
    page_locale: typeof document !== "undefined" ? document.documentElement.lang : undefined
  };

  if (trackingConfig.gtmId) {
    pushDataLayer(eventName, eventData);
  } else if (trackingConfig.ga4MeasurementId && window.gtag) {
    fireGtagEvent(eventName, eventData);
  }

  sendInternalEvent(eventName, data);
}

export function trackPageView(): void {
  trackEvent(EVENT_NAMES.PAGE_VIEW, {
    referrer: typeof document !== "undefined" ? document.referrer : undefined
  });
}

export function trackPhoneClick(phoneNumber: string): void {
  trackEvent(EVENT_NAMES.PHONE_CLICK, {
    phone_number: phoneNumber
  });

  const label = getConversionLabel("phone_click");
  if (label) fireGoogleAdsConversion(label);
}

export function trackZaloClick(zaloTarget: string): void {
  trackEvent(EVENT_NAMES.ZALO_CLICK, {
    zalo_target: zaloTarget
  });

  const label = getConversionLabel("zalo_click");
  if (label) fireGoogleAdsConversion(label);
}

export function trackWhatsAppClick(target: string): void {
  trackEvent(EVENT_NAMES.WHATSAPP_CLICK, {
    whatsapp_target: target
  });

  const label = getConversionLabel("whatsapp_click");
  if (label) fireGoogleAdsConversion(label);
}

export function trackLeadSubmit(formType: FormType, campaignParams?: Record<string, string>): void {
  trackEvent(EVENT_NAMES.LEAD_SUBMIT, {
    form_type: formType,
    ...campaignParams
  });

  const label = getConversionLabel("form_submit");
  if (label) fireGoogleAdsConversion(label);
}

export function trackBookingIntent(fieldName?: string): void {
  trackEvent(EVENT_NAMES.BOOKING_INTENT, {
    field_name: fieldName
  });
}

export function trackCTAClick(ctaType: CTAType, target?: string): void {
  trackEvent(EVENT_NAMES.CTA_CLICK, {
    cta_type: ctaType,
    cta_target: target
  });
}
