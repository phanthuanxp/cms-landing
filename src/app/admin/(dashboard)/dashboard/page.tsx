import { AdminPageHeader } from "@/components/admin/page-header";
import { TenantPicker } from "@/components/admin/tenant-picker";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLocaleFromCookie, getTranslations } from "@/lib/i18n";
import { requireAuth } from "@/server/auth/session";
import { getDashboardStats, resolveAdminTenant } from "@/server/queries/admin";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPage({ searchParams }: Props) {
  const user = await requireAuth("/admin/dashboard");
  const locale = await getLocaleFromCookie();
  const t = getTranslations(locale);
  const params = await searchParams;
  const tenantId = typeof params.tenantId === "string" ? params.tenantId : undefined;
  const { tenants, selectedTenant } = await resolveAdminTenant(user, tenantId);
  const stats = await getDashboardStats(user, selectedTenant?.id);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        actions={tenants.length > 0 ? <TenantPicker selectedTenantId={selectedTenant?.id} tenants={tenants} /> : null}
        description={t.dashboard.description}
        eyebrow={t.dashboard.eyebrow}
        title={t.dashboard.title}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {([
          [t.dashboard.tenants, stats.tenantCount],
          [t.dashboard.publishedPages, stats.pageCount],
          [t.dashboard.publishedPosts, stats.postCount],
          [t.dashboard.leads, stats.leadCount]
        ] as const).map(([label, value]) => (
          <Card key={label}>
            <CardHeader>
              <CardTitle className="text-base">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-stone-950">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t.dashboard.currentScope}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-stone-600">
          <p>
            {t.dashboard.loggedInAs} <strong className="text-stone-900">{user.email}</strong>
          </p>
          <div className="flex flex-wrap gap-2">
            {user.tenantMemberships.map((membership) => (
              <Badge key={membership.id}>
                {membership.tenant.siteSettings?.siteName ?? membership.tenant.slug}: {membership.role.toLowerCase()}
              </Badge>
            ))}
          </div>
          {selectedTenant ? (
            <p>
              {t.dashboard.viewingTenant} <strong className="text-stone-900">{selectedTenant.siteName}</strong>
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
