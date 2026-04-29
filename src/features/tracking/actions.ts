"use server";

import { TenantMemberRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { buildAdminPath, formatZodError, getString, getOptionalString } from "@/lib/admin";
import { requireTenantAccess } from "@/server/auth/permissions";
import { db } from "@/server/db/client";

const googleAdsLabelsSchema = z.record(z.string(), z.string()).default({});

const trackingConfigSchema = z.object({
  tenantId: z.string().min(1),
  ga4MeasurementId: z.string().regex(/^G-[A-Z0-9]+$/, "GA4 ID phai co dinh dang G-XXXXXXX").optional().or(z.literal("")),
  gtmId: z.string().regex(/^GTM-[A-Z0-9]+$/, "GTM ID phai co dinh dang GTM-XXXXXXX").optional().or(z.literal("")),
  googleAdsConversionId: z.string().regex(/^AW-[A-Z0-9]+$/, "Google Ads Conversion ID phai co dinh dang AW-XXXXXXX").optional().or(z.literal("")),
  googleAdsConversionLabels: googleAdsLabelsSchema,
  metaPixelId: z.string().optional().or(z.literal("")),
  tiktokPixelId: z.string().optional().or(z.literal("")),
  customHeadScript: z.string().max(5000, "Custom head script toi da 5000 ky tu").optional().or(z.literal("")),
  customBodyScript: z.string().max(5000, "Custom body script toi da 5000 ky tu").optional().or(z.literal("")),
  enableInternalAnalytics: z.boolean().default(true)
});

function sanitizeScript(script: string | undefined | null): string | null {
  if (!script || script.trim().length === 0) return null;
  const dangerous = /<script[^>]*src\s*=\s*["'](?!https:\/\/)/gi;
  if (dangerous.test(script)) return null;
  return script.trim();
}

function getTrackingPath(tenantId: string, message?: string, type: "success" | "error" = "success") {
  return buildAdminPath("/admin/tracking", { tenantId, [type]: message });
}

export async function updateTrackingConfigAction(formData: FormData) {
  const tenantId = getString(formData, "tenantId");
  const access = await requireTenantAccess(tenantId, {
    roles: [TenantMemberRole.TENANT_ADMIN],
    nextPath: `/admin/tracking?tenantId=${tenantId}`
  });

  let googleAdsConversionLabels: Record<string, string> = {};
  const labelsRaw = getOptionalString(formData, "googleAdsConversionLabels");
  if (labelsRaw) {
    try {
      googleAdsConversionLabels = googleAdsLabelsSchema.parse(JSON.parse(labelsRaw));
    } catch {
      redirect(getTrackingPath(tenantId, "Google-Ads-labels-JSON-khong-hop-le", "error"));
    }
  }

  const parsed = trackingConfigSchema.safeParse({
    tenantId,
    ga4MeasurementId: getOptionalString(formData, "ga4MeasurementId") ?? "",
    gtmId: getOptionalString(formData, "gtmId") ?? "",
    googleAdsConversionId: getOptionalString(formData, "googleAdsConversionId") ?? "",
    googleAdsConversionLabels,
    metaPixelId: getOptionalString(formData, "metaPixelId") ?? "",
    tiktokPixelId: getOptionalString(formData, "tiktokPixelId") ?? "",
    customHeadScript: getOptionalString(formData, "customHeadScript") ?? "",
    customBodyScript: getOptionalString(formData, "customBodyScript") ?? "",
    enableInternalAnalytics: formData.get("enableInternalAnalytics") === "on"
  });

  if (!parsed.success) {
    redirect(getTrackingPath(tenantId, formatZodError(parsed.error), "error"));
  }

  await db.trackingConfig.upsert({
    where: { tenantId },
    update: {
      ga4MeasurementId: parsed.data.ga4MeasurementId || null,
      gtmId: parsed.data.gtmId || null,
      googleAdsConversionId: parsed.data.googleAdsConversionId || null,
      googleAdsConversionLabels: Object.keys(parsed.data.googleAdsConversionLabels).length > 0
        ? parsed.data.googleAdsConversionLabels
        : undefined,
      metaPixelId: parsed.data.metaPixelId || null,
      tiktokPixelId: parsed.data.tiktokPixelId || null,
      customHeadScript: sanitizeScript(parsed.data.customHeadScript),
      customBodyScript: sanitizeScript(parsed.data.customBodyScript),
      enableInternalAnalytics: parsed.data.enableInternalAnalytics,
      updatedById: access.user.id
    },
    create: {
      tenantId,
      ga4MeasurementId: parsed.data.ga4MeasurementId || null,
      gtmId: parsed.data.gtmId || null,
      googleAdsConversionId: parsed.data.googleAdsConversionId || null,
      googleAdsConversionLabels: Object.keys(parsed.data.googleAdsConversionLabels).length > 0
        ? parsed.data.googleAdsConversionLabels
        : undefined,
      metaPixelId: parsed.data.metaPixelId || null,
      tiktokPixelId: parsed.data.tiktokPixelId || null,
      customHeadScript: sanitizeScript(parsed.data.customHeadScript),
      customBodyScript: sanitizeScript(parsed.data.customBodyScript),
      enableInternalAnalytics: parsed.data.enableInternalAnalytics,
      createdById: access.user.id
    }
  });

  revalidatePath("/admin/tracking");
  revalidatePath("/", "layout");
  redirect(getTrackingPath(tenantId, "Cau-hinh-tracking-da-duoc-luu"));
}
