import { notFound } from "next/navigation";

import { SiteShell } from "@/components/public/site-shell";
import { TenantInactiveState } from "@/components/public/tenant-inactive-state";
import { TrackingScripts } from "@/components/public/tracking-scripts";
import type { TrackingConfigPublic } from "@/lib/tracking/types";
import { getTenantShell } from "@/server/queries/public";
import { getRequestHost } from "@/server/tenant/request";
import { db } from "@/server/db/client";

export default async function PublicLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const host = await getRequestHost();
  const shell = await getTenantShell(host);

  if (shell.status === "not_found") {
    notFound();
  }

  if (shell.status === "inactive") {
    return (
      <TenantInactiveState
        host={shell.hostname}
        tenantName={shell.tenant.siteSettings?.siteName ?? shell.tenant.slug}
      />
    );
  }

  const trackingConfig = await db.trackingConfig.findUnique({
    where: { tenantId: shell.tenant.id }
  });

  const trackingPublic: TrackingConfigPublic | null = trackingConfig
    ? {
        tenantId: shell.tenant.id,
        ga4MeasurementId: trackingConfig.ga4MeasurementId,
        gtmId: trackingConfig.gtmId,
        googleAdsConversionId: trackingConfig.googleAdsConversionId,
        googleAdsConversionLabels:
          (trackingConfig.googleAdsConversionLabels as Record<string, string>) ?? {},
        metaPixelId: trackingConfig.metaPixelId,
        tiktokPixelId: trackingConfig.tiktokPixelId,
        enableInternalAnalytics: trackingConfig.enableInternalAnalytics
      }
    : null;

  return (
    <SiteShell
      currentHost={shell.hostname}
      footerMenu={shell.footerMenu}
      primaryMenu={shell.primaryMenu}
      tenant={{
        siteName: shell.tenant.siteSettings?.siteName ?? shell.tenant.slug,
        businessDescription: shell.tenant.siteSettings?.businessDescription,
        businessPhone: shell.tenant.siteSettings?.businessPhone,
        businessEmail: shell.tenant.siteSettings?.businessEmail
      }}
    >
      {trackingPublic ? (
        <TrackingScripts
          config={trackingPublic}
          customHeadScript={trackingConfig?.customHeadScript}
          customBodyScript={trackingConfig?.customBodyScript}
        />
      ) : null}
      {children}
    </SiteShell>
  );
}
