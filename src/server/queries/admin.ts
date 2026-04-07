import { PublishStatus } from "@prisma/client";
import { z } from "zod";

import { PAGE_SIZE } from "@/lib/constants";
import { parseSearchParamsValue } from "@/lib/utils";
import type { CurrentUser } from "@/server/auth/session";
import { getAccessibleTenants, isSuperAdmin } from "@/server/auth/permissions";
import { db } from "@/server/db/client";

const listParamsSchema = z.object({
  q: z.preprocess((value) => parseSearchParamsValue(value as string | string[] | undefined).trim(), z.string()),
  status: z.preprocess((value) => parseSearchParamsValue(value as string | string[] | undefined), z.string()),
  tenantId: z.preprocess((value) => parseSearchParamsValue(value as string | string[] | undefined), z.string()),
  page: z.preprocess((value) => {
    const parsed = Number.parseInt(parseSearchParamsValue(value as string | string[] | undefined, "1"), 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }, z.number().int().min(1))
});

export async function getAdminTenants(user: CurrentUser) {
  const tenants = await getAccessibleTenants(user);

  return tenants.map((tenant) => ({
    id: tenant.id,
    slug: tenant.slug,
    siteName: tenant.siteSettings?.siteName ?? tenant.slug,
    domains: tenant.domains
  }));
}

export async function resolveAdminTenant(user: CurrentUser, requestedTenantId?: string) {
  const tenants = await getAdminTenants(user);
  const selectedTenant = tenants.find((tenant) => tenant.id === requestedTenantId) ?? tenants[0] ?? null;

  return {
    tenants,
    selectedTenant
  };
}

export function parseListParams(searchParams: Record<string, string | string[] | undefined>) {
  const parsed = listParamsSchema.parse(searchParams);

  return {
    q: parsed.q,
    status: parsed.status,
    tenantId: parsed.tenantId,
    page: parsed.page,
    pageSize: PAGE_SIZE
  };
}

export function buildPagination(total: number, page: number, pageSize = PAGE_SIZE) {
  return {
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
    skip: (page - 1) * pageSize,
    take: pageSize
  };
}

export async function getDashboardStats(user: CurrentUser, tenantId?: string) {
  const tenantIds = tenantId
    ? [tenantId]
    : isSuperAdmin(user)
      ? undefined
      : user.tenantMemberships.map((membership) => membership.tenantId);

  const tenantWhere = tenantIds ? { id: { in: tenantIds }, deletedAt: null } : { deletedAt: null };
  const scopedTenantFilter = tenantIds ? { tenantId: { in: tenantIds } } : {};

  const [tenantCount, pageCount, postCount, leadCount] = await Promise.all([
    db.tenant.count({
      where: tenantWhere
    }),
    db.page.count({
      where: {
        ...scopedTenantFilter,
        status: PublishStatus.PUBLISHED,
        deletedAt: null
      }
    }),
    db.blogPost.count({
      where: {
        ...scopedTenantFilter,
        status: PublishStatus.PUBLISHED,
        deletedAt: null
      }
    }),
    db.lead.count({
      where: {
        ...scopedTenantFilter,
        deletedAt: null
      }
    })
  ]);

  return {
    tenantCount,
    pageCount,
    postCount,
    leadCount
  };
}
