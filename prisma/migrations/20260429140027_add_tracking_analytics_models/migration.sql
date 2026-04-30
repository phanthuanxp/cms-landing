-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "conversionEventType" TEXT,
ADD COLUMN     "conversionPage" TEXT,
ADD COLUMN     "deviceType" TEXT,
ADD COLUMN     "fbclid" TEXT,
ADD COLUMN     "formType" TEXT,
ADD COLUMN     "gbraid" TEXT,
ADD COLUMN     "gclid" TEXT,
ADD COLUMN     "landingPage" TEXT,
ADD COLUMN     "locale" TEXT,
ADD COLUMN     "ttclid" TEXT,
ADD COLUMN     "utmCampaign" TEXT,
ADD COLUMN     "utmContent" TEXT,
ADD COLUMN     "utmMedium" TEXT,
ADD COLUMN     "utmSource" TEXT,
ADD COLUMN     "utmTerm" TEXT,
ADD COLUMN     "wbraid" TEXT;

-- CreateTable
CREATE TABLE "TrackingConfig" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "ga4MeasurementId" TEXT,
    "gtmId" TEXT,
    "googleAdsConversionId" TEXT,
    "googleAdsConversionLabels" JSONB,
    "metaPixelId" TEXT,
    "tiktokPixelId" TEXT,
    "customHeadScript" TEXT,
    "customBodyScript" TEXT,
    "enableInternalAnalytics" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "TrackingConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "siteId" TEXT,
    "eventName" TEXT NOT NULL,
    "path" TEXT,
    "locale" TEXT,
    "referrer" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,
    "gclid" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TrackingConfig_tenantId_key" ON "TrackingConfig"("tenantId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_tenantId_eventName_createdAt_idx" ON "AnalyticsEvent"("tenantId", "eventName", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_tenantId_createdAt_idx" ON "AnalyticsEvent"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_tenantId_utmSource_utmCampaign_idx" ON "AnalyticsEvent"("tenantId", "utmSource", "utmCampaign");

-- CreateIndex
CREATE INDEX "Lead_tenantId_utmSource_utmCampaign_idx" ON "Lead"("tenantId", "utmSource", "utmCampaign");

-- AddForeignKey
ALTER TABLE "TrackingConfig" ADD CONSTRAINT "TrackingConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
