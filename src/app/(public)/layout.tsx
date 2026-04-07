import { notFound } from "next/navigation";

import { SiteShell } from "@/components/public/site-shell";
import { TenantInactiveState } from "@/components/public/tenant-inactive-state";
import { getTenantShell } from "@/server/queries/public";
import { getRequestHost } from "@/server/tenant/request";

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
      {children}
    </SiteShell>
  );
}
