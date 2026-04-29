export type TrackingConfigPublic = {
  tenantId: string;
  ga4MeasurementId: string | null;
  gtmId: string | null;
  googleAdsConversionId: string | null;
  googleAdsConversionLabels: Record<string, string>;
  metaPixelId: string | null;
  tiktokPixelId: string | null;
  enableInternalAnalytics: boolean;
};

export type AttributionData = {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  gclid: string | null;
  gbraid: string | null;
  wbraid: string | null;
  fbclid: string | null;
  ttclid: string | null;
  landingPage: string | null;
};

export type TrackingEvent = {
  tenantId: string;
  eventName: string;
  path?: string;
  locale?: string;
  referrer?: string;
  metadata?: Record<string, unknown>;
  attribution?: AttributionData;
};
