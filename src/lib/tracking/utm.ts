"use client";

import {
  ALL_ATTRIBUTION_PARAMS,
  ATTRIBUTION_COOKIE,
  ATTRIBUTION_FIRST_TOUCH_COOKIE,
  ATTRIBUTION_MAX_AGE_DAYS,
  ATTRIBUTION_SESSION_KEY
} from "@/lib/tracking/constants";
import type { AttributionData } from "@/lib/tracking/types";

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match && match[1] ? decodeURIComponent(match[1]) : null;
}

function getAttribution(cookieName: string): Partial<AttributionData> | null {
  const raw = getCookie(cookieName);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Partial<AttributionData>;
  } catch {
    return null;
  }
}

export function captureAttribution(): void {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const attribution: Record<string, string> = {};

  for (const param of ALL_ATTRIBUTION_PARAMS) {
    const value = params.get(param);
    if (value) {
      const key = param.replace(/^utm_/, "utm").replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
      const camelKey = param === "utm_source" ? "utmSource"
        : param === "utm_medium" ? "utmMedium"
        : param === "utm_campaign" ? "utmCampaign"
        : param === "utm_term" ? "utmTerm"
        : param === "utm_content" ? "utmContent"
        : param;
      attribution[camelKey] = value;
    }
  }

  if (Object.keys(attribution).length === 0 && !document.referrer) return;

  if (document.referrer && !attribution.utmSource) {
    try {
      const ref = new URL(document.referrer);
      if (ref.hostname !== window.location.hostname) {
        attribution.utmSource = attribution.utmSource ?? ref.hostname;
        attribution.utmMedium = attribution.utmMedium ?? "referral";
      }
    } catch {
      // invalid referrer URL
    }
  }

  attribution.landingPage = window.location.pathname;

  // Last-touch: always overwrite
  setCookie(ATTRIBUTION_COOKIE, JSON.stringify(attribution), ATTRIBUTION_MAX_AGE_DAYS);

  // First-touch: only set if not exists
  if (!getCookie(ATTRIBUTION_FIRST_TOUCH_COOKIE)) {
    setCookie(ATTRIBUTION_FIRST_TOUCH_COOKIE, JSON.stringify(attribution), ATTRIBUTION_MAX_AGE_DAYS);
  }

  // Session attribution
  try {
    sessionStorage.setItem(ATTRIBUTION_SESSION_KEY, JSON.stringify(attribution));
  } catch {
    // sessionStorage not available
  }
}

export function getAttributionData(): AttributionData {
  const empty: AttributionData = {
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    utmTerm: null,
    utmContent: null,
    gclid: null,
    gbraid: null,
    wbraid: null,
    fbclid: null,
    ttclid: null,
    landingPage: null
  };

  if (typeof window === "undefined") return empty;

  const lastTouch = getAttribution(ATTRIBUTION_COOKIE);
  const firstTouch = getAttribution(ATTRIBUTION_FIRST_TOUCH_COOKIE);
  const source = lastTouch ?? firstTouch;

  if (!source) return empty;

  return {
    utmSource: source.utmSource ?? null,
    utmMedium: source.utmMedium ?? null,
    utmCampaign: source.utmCampaign ?? null,
    utmTerm: source.utmTerm ?? null,
    utmContent: source.utmContent ?? null,
    gclid: source.gclid ?? null,
    gbraid: source.gbraid ?? null,
    wbraid: source.wbraid ?? null,
    fbclid: source.fbclid ?? null,
    ttclid: source.ttclid ?? null,
    landingPage: source.landingPage ?? null
  };
}

export function getFirstTouchData(): AttributionData | null {
  if (typeof window === "undefined") return null;
  const ft = getAttribution(ATTRIBUTION_FIRST_TOUCH_COOKIE);
  if (!ft) return null;
  return {
    utmSource: ft.utmSource ?? null,
    utmMedium: ft.utmMedium ?? null,
    utmCampaign: ft.utmCampaign ?? null,
    utmTerm: ft.utmTerm ?? null,
    utmContent: ft.utmContent ?? null,
    gclid: ft.gclid ?? null,
    gbraid: ft.gbraid ?? null,
    wbraid: ft.wbraid ?? null,
    fbclid: ft.fbclid ?? null,
    ttclid: ft.ttclid ?? null,
    landingPage: ft.landingPage ?? null
  };
}
