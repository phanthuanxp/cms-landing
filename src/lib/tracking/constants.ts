export const UTM_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content"
] as const;

export const CLICK_ID_PARAMS = [
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "ttclid"
] as const;

export const ALL_ATTRIBUTION_PARAMS = [...UTM_PARAMS, ...CLICK_ID_PARAMS] as const;

export const ATTRIBUTION_COOKIE = "cms_attribution";
export const ATTRIBUTION_FIRST_TOUCH_COOKIE = "cms_first_touch";
export const ATTRIBUTION_MAX_AGE_DAYS = 30;
export const ATTRIBUTION_SESSION_KEY = "cms_session_attribution";

export const EVENT_NAMES = {
  PAGE_VIEW: "page_view",
  PHONE_CLICK: "phone_click",
  ZALO_CLICK: "zalo_click",
  WHATSAPP_CLICK: "whatsapp_click",
  LEAD_SUBMIT: "lead_submit",
  BOOKING_INTENT: "booking_intent",
  CTA_CLICK: "cta_click"
} as const;

export const FORM_TYPES = {
  TAXI_BOOKING: "taxi_booking",
  TOUR_INQUIRY: "tour_inquiry",
  GENERAL_CONTACT: "general_contact",
  NEWSLETTER: "newsletter"
} as const;

export const CTA_TYPES = {
  CALL: "call",
  ZALO: "zalo",
  BOOKING_FORM: "booking_form",
  WHATSAPP: "whatsapp",
  QUOTE_REQUEST: "quote_request"
} as const;

export type EventName = (typeof EVENT_NAMES)[keyof typeof EVENT_NAMES];
export type FormType = (typeof FORM_TYPES)[keyof typeof FORM_TYPES];
export type CTAType = (typeof CTA_TYPES)[keyof typeof CTA_TYPES];
