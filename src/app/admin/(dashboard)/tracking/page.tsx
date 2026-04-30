import { TenantMemberRole } from "@prisma/client";

import { updateTrackingConfigAction } from "@/features/tracking/actions";
import { AdminFormSection } from "@/components/admin/form-section";
import { AdminPageHeader } from "@/components/admin/page-header";
import { TenantPicker } from "@/components/admin/tenant-picker";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { requireAuth } from "@/server/auth/session";
import { requireTenantAccess } from "@/server/auth/permissions";
import { resolveAdminTenant as resolveTenantList } from "@/server/queries/admin";
import { db } from "@/server/db/client";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TrackingSettingsPage({ searchParams }: Props) {
  const user = await requireAuth("/admin/tracking");
  const params = await searchParams;
  const tenantId = typeof params.tenantId === "string" ? params.tenantId : undefined;
  const { tenants, selectedTenant } = await resolveTenantList(user, tenantId);

  if (!selectedTenant) {
    return <EmptyState description="Tai khoan nay chua duoc gan tenant nao." title="Khong co tenant" />;
  }

  await requireTenantAccess(selectedTenant.id, {
    roles: [TenantMemberRole.TENANT_ADMIN],
    nextPath: `/admin/tracking?tenantId=${selectedTenant.id}`
  });

  const config = await db.trackingConfig.findUnique({
    where: { tenantId: selectedTenant.id }
  });

  const successMsg = typeof params.success === "string" ? params.success.replace(/-/g, " ") : null;
  const errorMsg = typeof params.error === "string" ? params.error.replace(/-/g, " ") : null;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        actions={<TenantPicker selectedTenantId={selectedTenant.id} tenants={tenants} />}
        description="Cau hinh GA4, GTM, Google Ads, Meta Pixel, TikTok Pixel va custom scripts cho tenant hien tai."
        eyebrow="Tracking"
        title="Tracking & Conversion"
      />

      {successMsg ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMsg}
        </div>
      ) : null}

      {errorMsg ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errorMsg}
        </div>
      ) : null}

      <form action={updateTrackingConfigAction} className="space-y-6">
        <input name="tenantId" type="hidden" value={selectedTenant.id} />

        <AdminFormSection description="Google Analytics 4 va Google Tag Manager." title="Google Analytics">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ga4MeasurementId">GA4 Measurement ID</Label>
              <Input
                defaultValue={config?.ga4MeasurementId ?? ""}
                id="ga4MeasurementId"
                name="ga4MeasurementId"
                placeholder="G-XXXXXXXXXX"
              />
              <p className="text-xs text-stone-500">Dinh dang: G-XXXXXXXXXX</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gtmId">Google Tag Manager ID</Label>
              <Input
                defaultValue={config?.gtmId ?? ""}
                id="gtmId"
                name="gtmId"
                placeholder="GTM-XXXXXXX"
              />
              <p className="text-xs text-stone-500">Dinh dang: GTM-XXXXXXX. Neu co GTM, events se push vao dataLayer.</p>
            </div>
          </div>
        </AdminFormSection>

        <AdminFormSection description="Cau hinh Google Ads conversion tracking." title="Google Ads Conversion">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="googleAdsConversionId">Conversion ID</Label>
              <Input
                defaultValue={config?.googleAdsConversionId ?? ""}
                id="googleAdsConversionId"
                name="googleAdsConversionId"
                placeholder="AW-XXXXXXXXXX"
              />
              <p className="text-xs text-stone-500">Dinh dang: AW-XXXXXXXXXX</p>
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="googleAdsConversionLabels">Conversion Labels (JSON)</Label>
              <Textarea
                defaultValue={JSON.stringify(
                  (config?.googleAdsConversionLabels as Record<string, string>) ?? {
                    phone_click: "",
                    form_submit: "",
                    zalo_click: ""
                  },
                  null,
                  2
                )}
                id="googleAdsConversionLabels"
                name="googleAdsConversionLabels"
                rows={5}
              />
              <p className="text-xs text-stone-500">
                Map event type → conversion label. Vi du: {`{"phone_click": "AbCdEf123", "form_submit": "XyZ789"}`}
              </p>
            </div>
          </div>
        </AdminFormSection>

        <AdminFormSection description="Meta Pixel va TikTok Pixel." title="Social Pixels">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="metaPixelId">Meta Pixel ID</Label>
              <Input
                defaultValue={config?.metaPixelId ?? ""}
                id="metaPixelId"
                name="metaPixelId"
                placeholder="123456789012345"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tiktokPixelId">TikTok Pixel ID</Label>
              <Input
                defaultValue={config?.tiktokPixelId ?? ""}
                id="tiktokPixelId"
                name="tiktokPixelId"
                placeholder="XXXXXXXXXXXXXXXXX"
              />
            </div>
          </div>
        </AdminFormSection>

        <AdminFormSection
          description="Custom HTML/JS cho head va body. Chi cho phep HTTPS scripts. Toi da 5000 ky tu."
          title="Custom Scripts"
        >
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="customHeadScript">Custom Head Script</Label>
              <Textarea
                defaultValue={config?.customHeadScript ?? ""}
                id="customHeadScript"
                name="customHeadScript"
                placeholder="<!-- Custom tracking code for <head> -->"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customBodyScript">Custom Body Script</Label>
              <Textarea
                defaultValue={config?.customBodyScript ?? ""}
                id="customBodyScript"
                name="customBodyScript"
                placeholder="<!-- Custom tracking code for <body> -->"
                rows={4}
              />
            </div>
          </div>
        </AdminFormSection>

        <AdminFormSection description="Luu su kien vao CMS database de hien thi tren dashboard." title="Internal Analytics">
          <div className="flex items-center gap-3">
            <input
              defaultChecked={config?.enableInternalAnalytics ?? true}
              id="enableInternalAnalytics"
              name="enableInternalAnalytics"
              type="checkbox"
              className="h-4 w-4 rounded border-stone-300"
            />
            <Label htmlFor="enableInternalAnalytics">
              Bat Internal Analytics (luu events vao CMS DB)
            </Label>
          </div>
        </AdminFormSection>

        <div>
          <SubmitButton>Luu cau hinh tracking</SubmitButton>
        </div>
      </form>
    </div>
  );
}
