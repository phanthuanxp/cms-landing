"use server";

import { Prisma, TenantMemberRole } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { buildAdminPath, formatZodError, getOptionalString, getString, parseJsonField } from "@/lib/admin";
import { socialLinksSchema, themeSettingsSchema } from "@/types/cms";
import { requireTenantAccess } from "@/server/auth/permissions";
import { db } from "@/server/db/client";

const settingsSchema = z.object({
  tenantId: z.string().min(1),
  siteName: z.string().min(2, "Ten website bat buoc nhap."),
  siteTagline: z.string().optional(),
  logoUrl: z.string().url("Logo URL khong hop le.").optional().or(z.literal("")),
  faviconUrl: z.string().url("Favicon URL khong hop le.").optional().or(z.literal("")),
  defaultSeoTitle: z.string().min(2, "SEO title bat buoc nhap."),
  defaultSeoDescription: z.string().min(10, "SEO description toi thieu 10 ky tu."),
  defaultOgImageUrl: z.string().url("OG image URL khong hop le.").optional().or(z.literal("")),
  businessName: z.string().optional(),
  businessEmail: z.string().email("Email doanh nghiep khong hop le.").optional().or(z.literal("")),
  businessPhone: z.string().optional(),
  businessAddress: z.string().optional(),
  businessDescription: z.string().optional(),
  locale: z.string().min(2),
  socialLinks: socialLinksSchema,
  themeSettings: themeSettingsSchema.optional()
});

function getSettingsPath(tenantId: string, message?: string, type: "success" | "error" = "success") {
  return buildAdminPath("/admin/settings", { tenantId, [type]: message });
}

export async function updateSiteSettingsAction(formData: FormData) {
  const tenantId = getString(formData, "tenantId");
  const access = await requireTenantAccess(tenantId, {
    roles: [TenantMemberRole.TENANT_ADMIN],
    nextPath: `/admin/settings?tenantId=${tenantId}`
  });

  let socialLinks;
  let themeSettings;

  try {
    socialLinks = parseJsonField(getOptionalString(formData, "socialLinks"), socialLinksSchema);
    themeSettings = parseJsonField(getOptionalString(formData, "themeSettings"), themeSettingsSchema.optional());
  } catch {
    redirect(getSettingsPath(tenantId, "JSON-cau-hinh-khong-hop-le", "error"));
  }

  const parsed = settingsSchema.safeParse({
    tenantId,
    siteName: getString(formData, "siteName"),
    siteTagline: getOptionalString(formData, "siteTagline"),
    logoUrl: getOptionalString(formData, "logoUrl") ?? "",
    faviconUrl: getOptionalString(formData, "faviconUrl") ?? "",
    defaultSeoTitle: getString(formData, "defaultSeoTitle"),
    defaultSeoDescription: getString(formData, "defaultSeoDescription"),
    defaultOgImageUrl: getOptionalString(formData, "defaultOgImageUrl") ?? "",
    businessName: getOptionalString(formData, "businessName"),
    businessEmail: getOptionalString(formData, "businessEmail") ?? "",
    businessPhone: getOptionalString(formData, "businessPhone"),
    businessAddress: getOptionalString(formData, "businessAddress"),
    businessDescription: getOptionalString(formData, "businessDescription"),
    locale: getString(formData, "locale") || "vi-VN",
    socialLinks,
    themeSettings
  });

  if (!parsed.success) {
    redirect(getSettingsPath(tenantId, formatZodError(parsed.error), "error"));
  }

  await db.siteSettings.upsert({
    where: {
      tenantId
    },
    update: {
      siteName: parsed.data.siteName,
      siteTagline: parsed.data.siteTagline,
      logoUrl: parsed.data.logoUrl || null,
      faviconUrl: parsed.data.faviconUrl || null,
      defaultSeoTitle: parsed.data.defaultSeoTitle,
      defaultSeoDescription: parsed.data.defaultSeoDescription,
      defaultOgImageUrl: parsed.data.defaultOgImageUrl || null,
      businessName: parsed.data.businessName,
      businessEmail: parsed.data.businessEmail || null,
      businessPhone: parsed.data.businessPhone,
      businessAddress: parsed.data.businessAddress,
      businessDescription: parsed.data.businessDescription,
      locale: parsed.data.locale,
      socialLinks: parsed.data.socialLinks,
      themeSettings: parsed.data.themeSettings ?? Prisma.JsonNull,
      updatedById: access.user.id,
      deletedAt: null
    },
    create: {
      tenantId,
      siteName: parsed.data.siteName,
      siteTagline: parsed.data.siteTagline,
      logoUrl: parsed.data.logoUrl || null,
      faviconUrl: parsed.data.faviconUrl || null,
      defaultSeoTitle: parsed.data.defaultSeoTitle,
      defaultSeoDescription: parsed.data.defaultSeoDescription,
      defaultOgImageUrl: parsed.data.defaultOgImageUrl || null,
      businessName: parsed.data.businessName,
      businessEmail: parsed.data.businessEmail || null,
      businessPhone: parsed.data.businessPhone,
      businessAddress: parsed.data.businessAddress,
      businessDescription: parsed.data.businessDescription,
      locale: parsed.data.locale,
      socialLinks: parsed.data.socialLinks,
      themeSettings: parsed.data.themeSettings ?? Prisma.JsonNull,
      createdById: access.user.id,
      updatedById: access.user.id
    }
  });

  revalidateTag("tenant", "max");
  revalidatePath("/admin/settings");
  redirect(getSettingsPath(tenantId, "Da-cap-nhat-site-settings"));
}
