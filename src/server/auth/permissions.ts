import { GlobalRole, TenantMemberRole } from "@prisma/client";
import { redirect } from "next/navigation";

import { db } from "@/server/db/client";
import { type CurrentUser, requireAuth } from "@/server/auth/session";

export type AdminRole = GlobalRole | TenantMemberRole;

function toRoleSet(roles: AdminRole | AdminRole[]) {
  return new Set(Array.isArray(roles) ? roles : [roles]);
}

export function isSuperAdmin(user: CurrentUser) {
  return user.globalRole === GlobalRole.SUPER_ADMIN;
}

export function getMembership(user: CurrentUser, tenantId: string) {
  return user.tenantMemberships.find((membership) => membership.tenantId === tenantId) ?? null;
}

export async function getAccessibleTenants(user: CurrentUser) {
  if (isSuperAdmin(user)) {
    return db.tenant.findMany({
      where: {
        deletedAt: null
      },
      include: {
        siteSettings: true,
        domains: {
          where: {
            deletedAt: null
          },
          orderBy: [{ isPrimary: "desc" }, { host: "asc" }]
        }
      },
      orderBy: {
        slug: "asc"
      }
    });
  }

  return user.tenantMemberships.map((membership) => membership.tenant);
}

export async function requireRole(roles: AdminRole | AdminRole[], nextPath = "/admin/dashboard") {
  const user = await requireAuth(nextPath);
  if (isSuperAdmin(user)) {
    return user;
  }

  const allowedRoles = toRoleSet(roles);
  const hasTenantRole = user.tenantMemberships.some((membership) => allowedRoles.has(membership.role));

  if (!hasTenantRole) {
    redirect("/admin/dashboard?error=Ban-khong-co-quyen-truy-cap-khu-vuc-nay");
  }

  return user;
}

export async function requireTenantAccess(
  tenantId: string,
  options?: {
    roles?: TenantMemberRole[];
    nextPath?: string;
  }
) {
  const user = await requireAuth(options?.nextPath ?? `/admin/dashboard?tenantId=${tenantId}`);

  if (isSuperAdmin(user)) {
    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
      include: {
        siteSettings: true,
        domains: {
          where: {
            deletedAt: null
          }
        }
      }
    });

    if (!tenant || tenant.deletedAt) {
      redirect("/admin/dashboard?error=Tenant-khong-ton-tai");
    }

    return {
      user,
      tenant,
      membership: null
    };
  }

  const membership = getMembership(user, tenantId);

  if (!membership || membership.tenant.deletedAt) {
    redirect("/admin/dashboard?error=Ban-khong-co-quyen-vao-tenant-nay");
  }

  if (options?.roles && !options.roles.includes(membership.role)) {
    redirect("/admin/dashboard?error=Ban-khong-co-du-quyen-thao-tac");
  }

  const tenant = await db.tenant.findUnique({
    where: {
      id: tenantId
    },
    include: {
      siteSettings: true,
      domains: {
        where: {
          deletedAt: null
        },
        orderBy: [{ isPrimary: "desc" }, { host: "asc" }]
      }
    }
  });

  if (!tenant || tenant.deletedAt) {
    redirect("/admin/dashboard?error=Tenant-khong-ton-tai-hoac-da-bi-an");
  }

  return {
    user,
    tenant,
    membership
  };
}

export function canManageSystem(user: CurrentUser) {
  return isSuperAdmin(user);
}

export function canManageTenantSettings(user: CurrentUser, tenantId: string) {
  if (isSuperAdmin(user)) {
    return true;
  }

  return getMembership(user, tenantId)?.role === TenantMemberRole.TENANT_ADMIN;
}

export function canEditTenantContent(user: CurrentUser, tenantId: string) {
  if (isSuperAdmin(user)) {
    return true;
  }

  const role = getMembership(user, tenantId)?.role;
  return role === TenantMemberRole.TENANT_ADMIN || role === TenantMemberRole.EDITOR;
}
