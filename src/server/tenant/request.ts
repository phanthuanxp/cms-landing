import { TenantStatus, type Prisma } from "@prisma/client";
import { headers } from "next/headers";
import { unstable_cache } from "next/cache";

import { env } from "@/lib/env";
import { compactText } from "@/lib/utils";
import { db } from "@/server/db/client";

const tenantDomainInclude = {
  tenant: {
    include: {
      siteSettings: true,
      domains: {
        where: {
          deletedAt: null,
          isActive: true
        },
        orderBy: [{ isPrimary: "desc" }, { host: "asc" }]
      }
    }
  }
} satisfies Prisma.TenantDomainInclude;

type TenantDomainRecord = Prisma.TenantDomainGetPayload<{
  include: typeof tenantDomainInclude;
}>;

type ActiveTenantResolution = {
  status: "active";
  hostname: string;
  tenant: TenantDomainRecord["tenant"];
  domain: TenantDomainRecord;
};

type InactiveTenantResolution = {
  status: "inactive";
  hostname: string;
  tenant: TenantDomainRecord["tenant"];
  domain: TenantDomainRecord;
};

type MissingTenantResolution = {
  status: "not_found";
  hostname: string;
  tenant: null;
  domain: null;
};

export type TenantResolution =
  | ActiveTenantResolution
  | InactiveTenantResolution
  | MissingTenantResolution;

export function normalizeHost(host: string) {
  return compactText(host).replace(/^https?:\/\//, "").replace(/\/$/, "").split(":")[0] ?? "";
}

const getCachedTenantResolution = unstable_cache(
  async (host: string) => {
    const normalizedHost = normalizeHost(host);

    if (!normalizedHost) {
      return {
        status: "not_found",
        hostname: normalizedHost,
        tenant: null,
        domain: null
      } satisfies MissingTenantResolution;
    }

    const domain = await db.tenantDomain.findFirst({
      where: {
        host: normalizedHost,
        deletedAt: null,
        isActive: true,
        tenant: {
          deletedAt: null
        }
      },
      include: tenantDomainInclude
    });

    if (!domain) {
      return {
        status: "not_found",
        hostname: normalizedHost,
        tenant: null,
        domain: null
      } satisfies MissingTenantResolution;
    }

    if (domain.tenant.status !== TenantStatus.ACTIVE) {
      return {
        status: "inactive",
        hostname: normalizedHost,
        tenant: domain.tenant,
        domain
      } satisfies InactiveTenantResolution;
    }

    return {
      status: "active",
      hostname: normalizedHost,
      tenant: domain.tenant,
      domain
    } satisfies ActiveTenantResolution;
  },
  ["tenant-resolution-v3"],
  {
    revalidate: 300,
    tags: ["tenant", "public-content"]
  }
);

export async function getRequestHost() {
  const headerStore = await headers();
  return normalizeHost(headerStore.get("x-tenant-host") ?? headerStore.get("host") ?? env.DEFAULT_SITE_DOMAIN);
}

export async function resolveTenantByHost(hostname: string): Promise<TenantResolution> {
  return getCachedTenantResolution(hostname);
}

export async function getCurrentTenant(): Promise<TenantResolution> {
  return resolveTenantByHost(await getRequestHost());
}

export async function getTenantFromRequest() {
  const resolution = await getCurrentTenant();

  if (resolution.status !== "active") {
    return null;
  }

  return resolution.tenant;
}
