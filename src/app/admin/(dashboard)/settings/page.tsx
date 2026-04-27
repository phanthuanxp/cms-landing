import { TenantMemberRole } from "@prisma/client";

import { updateSiteSettingsAction } from "@/features/settings/actions";
import { AdminFormSection } from "@/components/admin/form-section";
import { AdminPageHeader } from "@/components/admin/page-header";
import { TenantPicker } from "@/components/admin/tenant-picker";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { getLocaleFromCookie, getTranslations } from "@/lib/i18n";
import { requireAuth } from "@/server/auth/session";
import { requireTenantAccess } from "@/server/auth/permissions";
import { resolveAdminTenant as resolveTenantList } from "@/server/queries/admin";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SettingsPage({ searchParams }: Props) {
  const user = await requireAuth("/admin/settings");
  const locale = await getLocaleFromCookie();
  const t = getTranslations(locale);
  const params = await searchParams;
  const tenantId = typeof params.tenantId === "string" ? params.tenantId : undefined;
  const { tenants, selectedTenant } = await resolveTenantList(user, tenantId);

  if (!selectedTenant) {
    return <EmptyState description={t.pages.noTenantDescription} title={t.pages.noTenant} />;
  }

  const access = await requireTenantAccess(selectedTenant.id, {
    roles: [TenantMemberRole.TENANT_ADMIN],
    nextPath: `/admin/settings?tenantId=${selectedTenant.id}`
  });

  const settings = access.tenant.siteSettings;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        actions={<TenantPicker selectedTenantId={selectedTenant.id} tenants={tenants} />}
        description={t.settings.description}
        eyebrow={t.settings.eyebrow}
        title={t.settings.title}
      />
      <AdminFormSection title={settings?.siteName ?? access.tenant.slug}>
        <form action={updateSiteSettingsAction} className="grid gap-4 lg:grid-cols-2">
          <input name="tenantId" type="hidden" value={selectedTenant.id} />

          <div className="space-y-2">
            <Label htmlFor="siteName">Site name</Label>
            <Input defaultValue={settings?.siteName ?? ""} id="siteName" name="siteName" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="siteTagline">Tagline</Label>
            <Input defaultValue={settings?.siteTagline ?? ""} id="siteTagline" name="siteTagline" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input defaultValue={settings?.logoUrl ?? ""} id="logoUrl" name="logoUrl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="faviconUrl">Favicon URL</Label>
            <Input defaultValue={settings?.faviconUrl ?? ""} id="faviconUrl" name="faviconUrl" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultSeoTitle">Default SEO title</Label>
            <Input defaultValue={settings?.defaultSeoTitle ?? ""} id="defaultSeoTitle" name="defaultSeoTitle" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultOgImageUrl">Default OG image URL</Label>
            <Input defaultValue={settings?.defaultOgImageUrl ?? ""} id="defaultOgImageUrl" name="defaultOgImageUrl" />
          </div>

          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="defaultSeoDescription">Default SEO description</Label>
            <Textarea defaultValue={settings?.defaultSeoDescription ?? ""} id="defaultSeoDescription" name="defaultSeoDescription" rows={4} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessName">Business name</Label>
            <Input defaultValue={settings?.businessName ?? ""} id="businessName" name="businessName" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessEmail">Business email</Label>
            <Input defaultValue={settings?.businessEmail ?? ""} id="businessEmail" name="businessEmail" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessPhone">Business phone</Label>
            <Input defaultValue={settings?.businessPhone ?? ""} id="businessPhone" name="businessPhone" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="locale">Locale</Label>
            <Input defaultValue={settings?.locale ?? "vi-VN"} id="locale" name="locale" />
          </div>

          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="businessAddress">Business address</Label>
            <Textarea defaultValue={settings?.businessAddress ?? ""} id="businessAddress" name="businessAddress" rows={3} />
          </div>
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="businessDescription">Business description</Label>
            <Textarea defaultValue={settings?.businessDescription ?? ""} id="businessDescription" name="businessDescription" rows={4} />
          </div>

          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="socialLinks">Social links JSON</Label>
            <Textarea
              defaultValue={JSON.stringify(settings?.socialLinks ?? {}, null, 2)}
              id="socialLinks"
              name="socialLinks"
              rows={6}
            />
          </div>
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="themeSettings">Theme settings JSON</Label>
            <Textarea
              defaultValue={JSON.stringify(settings?.themeSettings ?? { accent: "#0f766e", muted: "#f5f5f4", heroPattern: "grid" }, null, 2)}
              id="themeSettings"
              name="themeSettings"
              rows={6}
            />
          </div>

          <div className="lg:col-span-2">
            <SubmitButton>{t.common.save}</SubmitButton>
          </div>
        </form>
      </AdminFormSection>
    </div>
  );
}
