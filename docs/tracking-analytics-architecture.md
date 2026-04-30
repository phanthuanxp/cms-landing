# CMS v1 — Tracking, Conversion & Analytics Layer

## 1. Architecture Overview

The tracking system is built as a **tenant-aware, multi-layer conversion tracking system** that supports:

- Per-tenant configuration of GA4, GTM, Google Ads, Meta Pixel, and TikTok Pixel
- Client-side event tracking with GTM dataLayer + direct gtag dual-mode support
- UTM/attribution capture with first-touch and last-touch persistence
- Lightweight internal analytics storage in CMS database
- Admin dashboard for conversion metrics
- Lead attribution showing source/medium/campaign on every lead

### Data Flow

```
User lands on page → UTM params captured (cookie + sessionStorage)
                   → Page view tracked (GA4/GTM + internal DB)
                   → User clicks phone/Zalo/CTA → event tracked
                   → User submits form → lead created with full attribution
                   → Google Ads conversion fired (if configured)
                   → Admin sees leads with source/campaign + analytics dashboard
```

## 2. Per-Site Tracking Settings

**Admin path:** `/admin/tracking?tenantId=<id>`

Each tenant can configure:
- **GA4 Measurement ID** (G-XXXXXXX)
- **Google Tag Manager ID** (GTM-XXXXXXX)
- **Google Ads Conversion ID** (AW-XXXXXXX)
- **Google Ads Conversion Labels** (JSON map: event_type → label)
- **Meta Pixel ID**
- **TikTok Pixel ID**
- **Custom head/body scripts** (max 5000 chars each, HTTPS-only enforcement)
- **Internal Analytics toggle** (enable/disable CMS DB event storage)

Settings are stored in the `TrackingConfig` model (1:1 with Tenant) and loaded at request time for the public frontend.

### Script Injection Strategy

Scripts are injected via Next.js `<Script>` component with `strategy="afterInteractive"` to avoid blocking rendering:
- GTM loads first (if configured), all events push to `window.dataLayer`
- GA4 loads only if GTM is NOT configured (to avoid double-counting)
- Meta Pixel and TikTok Pixel load independently
- Custom scripts load with `afterInteractive` (head) and `lazyOnload` (body)
- No inline `<script>` tags that block the main thread

## 3. UTM Attribution

**File:** `src/lib/tracking/utm.ts`

### Capture Logic
On every page load, the system extracts from the URL:
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`
- Click IDs: `gclid`, `gbraid`, `wbraid`, `fbclid`, `ttclid`

If no UTM params but referrer exists, referrer hostname is used as `utm_source` with `utm_medium=referral`.

### Persistence
- **Last-touch cookie** (`cms_attribution`): overwritten on every visit with attribution params. 30-day expiry.
- **First-touch cookie** (`cms_first_touch`): set only once, never overwritten. 30-day expiry.
- **Session storage** (`cms_session_attribution`): per-session attribution for immediate form submissions.

### Attachment to Leads
When a contact form is submitted, the client reads last-touch attribution from cookie and includes it in the API payload. The `/api/contact` endpoint stores all UTM fields directly on the Lead record.

## 4. Google Ads Conversion Support

### Configuration
Per-tenant in `TrackingConfig.googleAdsConversionLabels` (JSON):
```json
{
  "phone_click": "AbCdEf123",
  "form_submit": "XyZ789",
  "zalo_click": "QwErTy456"
}
```

### Firing Logic
1. When an event fires (e.g., `trackPhoneClick()`), the system checks if a conversion label exists for that event type
2. If GTM is configured: pushes `{ event: "conversion", send_to: "AW-XXX/label" }` to dataLayer
3. If direct gtag is configured: calls `gtag("event", "conversion", { send_to: "AW-XXX/label" })`
4. **Deduplication**: A `Set` tracks fired conversion keys per page load to prevent double-firing

## 5. Event Tracking

**File:** `src/lib/tracking/events.ts`

### Tracked Events
| Event Name | Trigger | Data |
|---|---|---|
| `page_view` | Page load | referrer, path, locale |
| `phone_click` | Click tel: link | phone number |
| `zalo_click` | Click Zalo link | Zalo target |
| `whatsapp_click` | Click WhatsApp link | target |
| `lead_submit` | Form submission | form type, campaign params |
| `booking_intent` | Booking field interaction | field name |
| `cta_click` | CTA button click | CTA type, target |

### Routing Logic
Each event is routed through 3 layers:
1. **GTM** (if `gtmId` configured): `window.dataLayer.push()`
2. **GA4** (if `ga4MeasurementId` configured, no GTM): `gtag("event", ...)`
3. **Internal** (if `enableInternalAnalytics`): POST to `/api/analytics`

## 6. Admin Analytics Dashboard

**Path:** `/admin/analytics?tenantId=<id>`

### Metric Cards
- Total events, Page views, Leads count, Conversion rate
- Phone clicks, Zalo clicks, WhatsApp clicks, Form submissions
- CTA clicks, Booking intents

### Tables
- Top 10 landing pages by view count
- Top 10 campaigns by event count
- Top 10 traffic sources by event count

### Filters
- Date range: 7d / 30d / 90d
- Tenant picker
- Locale filter (URL param)

## 7. Lead Attribution in Admin

**Path:** `/admin/leads?tenantId=<id>`

Lead table now shows:
- **Source / Campaign** column: utm_source, utm_medium, utm_campaign, gclid/fbclid badges
- **Form Type** column: taxi_booking, tour_inquiry, general_contact, newsletter
- **Landing Page** column: first page the user visited

Filters support: status, source, campaign, formType (via URL params).

## 8. Database Schema Changes

### New Models
- `TrackingConfig`: Per-tenant tracking configuration (1:1 with Tenant)
- `AnalyticsEvent`: Internal event storage with UTM fields, indexed for dashboard queries

### Updated Models
- `Lead`: Added 16 attribution fields (utmSource, utmMedium, utmCampaign, utmTerm, utmContent, gclid, gbraid, wbraid, fbclid, ttclid, landingPage, conversionPage, locale, deviceType, conversionEventType, formType)

## 9. Limitations

1. **Internal analytics is supplementary** — not a replacement for GA4/GTM. Best used for conversion metrics in admin.
2. **No real-time dashboard** — data refreshes on page load, no WebSocket streaming.
3. **No cross-domain tracking** — each tenant/domain tracks independently.
4. **Custom scripts** are sanitized but not sandboxed — admin responsibility to use safe scripts.
5. **No consent management** — cookie consent banner should be added per GDPR/PDPA requirements.
6. **Attribution window** is fixed at 30 days — not configurable per tenant yet.
7. **No funnel visualization** — dashboard shows counts, not flow-based funnels.

## 10. Recommended Phase 13

1. **Cookie consent banner** with configurable text per tenant/locale
2. **Conversion value tracking** (revenue per conversion for Google Ads)
3. **Real-time event stream** via SSE or WebSocket for live dashboard
4. **A/B testing integration** — track variant performance
5. **Email notification** on high-value conversions
6. **Data retention policy** — auto-cleanup old analytics events
7. **Export functionality** — CSV/Excel export of leads and analytics data
