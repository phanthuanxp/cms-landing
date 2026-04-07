"use server";

import { GlobalRole, TenantStatus } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { buildAdminPath, formatZodError, getOptionalString, getSlug, getString } from "@/lib/admin";
import { requireRole } from "@/server/auth/permissions";
import { db } from "@/server/db/client";

const tenantSchema = z.object({
  tenantId: z.string().optional(),
  slug: z.string().min(2, "Slug tenant toi thieu 2 ky tu."),
  status: z.nativeEnum(TenantStatus),
  siteName: z.string().min(2, "Ten website bat buoc nhap."),
  defaultSeoTitle: z.string().min(2, "SEO title bat buoc nhap."),
  defaultSeoDescription: z.string().min(10, "SEO description toi thieu 10 ky tu.")
});

const domainSchema = z.object({
  tenantId: z.string().min(1),
  host: z
    .string()
    .min(3, "Domain bat buoc nhap.")
    .transform((value) => value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "").split(":")[0] ?? "")
});

function getSitesPath(tenantId?: string) {
  return buildAdminPath("/admin/sites", { tenantId });
}

function handleSitesError(tenantId: string | undefined, message: string): never {
  redirect(buildAdminPath("/admin/sites", { tenantId, error: message }));
}

async function getTenantDomainOrThrow(tenantId: string, domainId: string) {
  const domain = await db.tenantDomain.findFirst({
    where: {
      id: domainId,
      tenantId,
      deletedAt: null
    }
  });

  if (!domain) {
    throw new Error("Domain-khong-thuoc-tenant-hien-tai");
  }

  return domain;
}

export async function upsertTenantAction(formData: FormData) {
  const user = await requireRole(GlobalRole.SUPER_ADMIN, "/admin/sites");
  const tenantId = getOptionalString(formData, "tenantId");

  const parsed = tenantSchema.safeParse({
    tenantId,
    slug: getSlug(formData, "slug", "siteName"),
    status: getString(formData, "status"),
    siteName: getString(formData, "siteName"),
    defaultSeoTitle: getString(formData, "defaultSeoTitle"),
    defaultSeoDescription: getString(formData, "defaultSeoDescription")
  });

  if (!parsed.success) {
    handleSitesError(tenantId, formatZodError(parsed.error));
  }

  const data = parsed.data;

  try {
    const tenant = await db.$transaction(async (tx) => {
      const savedTenant = await tx.tenant.upsert({
        where: {
          id: data.tenantId ?? "__new__"
        },
        update: {
          slug: data.slug,
          status: data.status,
          updatedById: user.id,
          deletedAt: null
        },
        create: {
          slug: data.slug,
          status: data.status,
          createdById: user.id,
          updatedById: user.id
        }
      });

      await tx.siteSettings.upsert({
        where: {
          tenantId: savedTenant.id
        },
        update: {
          siteName: data.siteName,
          defaultSeoTitle: data.defaultSeoTitle,
          defaultSeoDescription: data.defaultSeoDescription,
          updatedById: user.id,
          deletedAt: null
        },
        create: {
          tenantId: savedTenant.id,
          siteName: data.siteName,
          defaultSeoTitle: data.defaultSeoTitle,
          defaultSeoDescription: data.defaultSeoDescription,
          createdById: user.id,
          updatedById: user.id
        }
      });

      return savedTenant;
    });

    revalidateTag("tenant", "max");
    revalidatePath("/admin/sites");
    redirect(buildAdminPath("/admin/sites", { tenantId: tenant.id, success: "Da-luu-tenant-thanh-cong" }));
  } catch (error) {
    handleSitesError(tenantId, error instanceof Error ? error.message : "Khong-the-luu-tenant");
  }
}

export async function softDeleteTenantAction(formData: FormData) {
  await requireRole(GlobalRole.SUPER_ADMIN, "/admin/sites");
  const tenantId = getString(formData, "tenantId");

  if (!tenantId) {
    handleSitesError(undefined, "Khong-tim-thay-tenant-can-xoa");
  }

  await db.tenant.update({
    where: {
      id: tenantId
    },
    data: {
      deletedAt: new Date()
    }
  });

  revalidateTag("tenant", "max");
  revalidatePath("/admin/sites");
  redirect(buildAdminPath("/admin/sites", { success: "Da-xoa-mem-tenant" }));
}

export async function addDomainAction(formData: FormData) {
  const user = await requireRole(GlobalRole.SUPER_ADMIN, "/admin/sites");
  const tenantId = getString(formData, "tenantId");

  const parsed = domainSchema.safeParse({
    tenantId,
    host: getString(formData, "host")
  });

  if (!parsed.success) {
    handleSitesError(tenantId, formatZodError(parsed.error));
  }

  const data = parsed.data;

  try {
    await db.$transaction(async (tx) => {
      const existingPrimary = await tx.tenantDomain.findFirst({
        where: {
          tenantId: data.tenantId,
          deletedAt: null,
          isPrimary: true
        }
      });

      const existingDomain = await tx.tenantDomain.findUnique({
        where: {
          host: data.host
        }
      });

      if (existingDomain && existingDomain.tenantId !== data.tenantId && !existingDomain.deletedAt) {
        throw new Error("Domain-da-duoc-gan-cho-tenant-khac");
      }

      if (existingDomain) {
        await tx.tenantDomain.update({
          where: {
            id: existingDomain.id
          },
          data: {
            tenantId: data.tenantId,
            isActive: true,
            deletedAt: null,
            isPrimary: existingPrimary ? false : true,
            updatedById: user.id
          }
        });
      } else {
        await tx.tenantDomain.create({
          data: {
            tenantId: data.tenantId,
            host: data.host,
            isPrimary: existingPrimary ? false : true,
            isActive: true,
            createdById: user.id,
            updatedById: user.id
          }
        });
      }
    });

    revalidateTag("tenant", "max");
    revalidatePath("/admin/sites");
    redirect(buildAdminPath("/admin/sites", { tenantId, success: "Da-them-domain" }));
  } catch (error) {
    handleSitesError(tenantId, error instanceof Error ? error.message : "Khong-the-them-domain");
  }
}

export async function setPrimaryDomainAction(formData: FormData) {
  const user = await requireRole(GlobalRole.SUPER_ADMIN, "/admin/sites");
  const tenantId = getString(formData, "tenantId");
  const domainId = getString(formData, "domainId");

  if (!tenantId || !domainId) {
    handleSitesError(tenantId, "Thieu-thong-tin-domain");
  }

  await db.$transaction(async (tx) => {
    await getTenantDomainOrThrow(tenantId, domainId);

    await tx.tenantDomain.updateMany({
      where: {
        tenantId,
        deletedAt: null
      },
      data: {
        isPrimary: false,
        updatedById: user.id
      }
    });

    await tx.tenantDomain.update({
      where: {
        id: domainId
      },
      data: {
        isPrimary: true,
        isActive: true,
        deletedAt: null,
        updatedById: user.id
      }
    });
  });

  revalidateTag("tenant", "max");
  revalidatePath("/admin/sites");
  redirect(buildAdminPath("/admin/sites", { tenantId, success: "Da-cap-nhat-primary-domain" }));
}

export async function softDeleteDomainAction(formData: FormData) {
  const user = await requireRole(GlobalRole.SUPER_ADMIN, "/admin/sites");
  const tenantId = getString(formData, "tenantId");
  const domainId = getString(formData, "domainId");

  if (!tenantId || !domainId) {
    handleSitesError(tenantId, "Thieu-thong-tin-domain");
  }

  await db.$transaction(async (tx) => {
    const domain = await getTenantDomainOrThrow(tenantId, domainId);

    await tx.tenantDomain.update({
      where: {
        id: domainId
      },
      data: {
        deletedAt: new Date(),
        isActive: false,
        isPrimary: false,
        updatedById: user.id
      }
    });

    if (domain.isPrimary) {
      const nextPrimary = await tx.tenantDomain.findFirst({
        where: {
          tenantId,
          deletedAt: null,
          id: {
            not: domainId
          }
        },
        orderBy: {
          createdAt: "asc"
        }
      });

      if (nextPrimary) {
        await tx.tenantDomain.update({
          where: {
            id: nextPrimary.id
          },
          data: {
            isPrimary: true,
            updatedById: user.id
          }
        });
      }
    }
  });

  revalidateTag("tenant", "max");
  revalidatePath("/admin/sites");
  redirect(buildAdminPath("/admin/sites", { tenantId, success: "Da-xoa-mem-domain" }));
}
