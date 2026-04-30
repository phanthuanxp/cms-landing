import { TenantMemberRole } from "@prisma/client";

import { AdminPageHeader } from "@/components/admin/page-header";
import { TenantPicker } from "@/components/admin/tenant-picker";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAuth } from "@/server/auth/session";
import { requireTenantAccess } from "@/server/auth/permissions";
import { resolveAdminTenant as resolveTenantList } from "@/server/queries/admin";
import { db } from "@/server/db/client";
import { parseSearchParamsValue } from "@/lib/utils";
import { EVENT_NAMES } from "@/lib/tracking/constants";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getDateRange(range: string): { gte: Date; lte: Date } {
  const now = new Date();
  const lte = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  switch (range) {
    case "7d": {
      const gte = new Date(lte);
      gte.setDate(gte.getDate() - 7);
      gte.setHours(0, 0, 0, 0);
      return { gte, lte };
    }
    case "90d": {
      const gte = new Date(lte);
      gte.setDate(gte.getDate() - 90);
      gte.setHours(0, 0, 0, 0);
      return { gte, lte };
    }
    default: {
      const gte = new Date(lte);
      gte.setDate(gte.getDate() - 30);
      gte.setHours(0, 0, 0, 0);
      return { gte, lte };
    }
  }
}

export default async function AnalyticsPage({ searchParams }: Props) {
  const user = await requireAuth("/admin/analytics");
  const params = await searchParams;
  const tenantId = typeof params.tenantId === "string" ? params.tenantId : undefined;
  const { tenants, selectedTenant } = await resolveTenantList(user, tenantId);

  if (!selectedTenant) {
    return <EmptyState description="Tai khoan nay chua duoc gan tenant nao." title="Khong co tenant" />;
  }

  await requireTenantAccess(selectedTenant.id, {
    roles: [TenantMemberRole.TENANT_ADMIN, TenantMemberRole.EDITOR],
    nextPath: `/admin/analytics?tenantId=${selectedTenant.id}`
  });

  const range = parseSearchParamsValue(params.range, "30d");
  const localeFilter = parseSearchParamsValue(params.locale);
  const { gte, lte } = getDateRange(range);

  const baseWhere = {
    tenantId: selectedTenant.id,
    createdAt: { gte, lte },
    ...(localeFilter ? { locale: localeFilter } : {})
  };

  const [
    totalEvents,
    pageViews,
    phoneClicks,
    zaloClicks,
    whatsappClicks,
    formSubmits,
    bookingIntents,
    ctaClicks,
    leadsCount,
    topPages,
    topCampaigns,
    topSources
  ] = await Promise.all([
    db.analyticsEvent.count({ where: baseWhere }),
    db.analyticsEvent.count({ where: { ...baseWhere, eventName: EVENT_NAMES.PAGE_VIEW } }),
    db.analyticsEvent.count({ where: { ...baseWhere, eventName: EVENT_NAMES.PHONE_CLICK } }),
    db.analyticsEvent.count({ where: { ...baseWhere, eventName: EVENT_NAMES.ZALO_CLICK } }),
    db.analyticsEvent.count({ where: { ...baseWhere, eventName: EVENT_NAMES.WHATSAPP_CLICK } }),
    db.analyticsEvent.count({ where: { ...baseWhere, eventName: EVENT_NAMES.LEAD_SUBMIT } }),
    db.analyticsEvent.count({ where: { ...baseWhere, eventName: EVENT_NAMES.BOOKING_INTENT } }),
    db.analyticsEvent.count({ where: { ...baseWhere, eventName: EVENT_NAMES.CTA_CLICK } }),
    db.lead.count({
      where: {
        tenantId: selectedTenant.id,
        deletedAt: null,
        createdAt: { gte, lte }
      }
    }),
    db.analyticsEvent.groupBy({
      by: ["path"],
      where: { ...baseWhere, eventName: EVENT_NAMES.PAGE_VIEW, path: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10
    }),
    db.analyticsEvent.groupBy({
      by: ["utmCampaign"],
      where: { ...baseWhere, utmCampaign: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10
    }),
    db.analyticsEvent.groupBy({
      by: ["utmSource"],
      where: { ...baseWhere, utmSource: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10
    })
  ]);

  const conversionRate = pageViews > 0 ? ((leadsCount / pageViews) * 100).toFixed(2) : "0.00";

  const rangeOptions = [
    { value: "7d", label: "7 ngay" },
    { value: "30d", label: "30 ngay" },
    { value: "90d", label: "90 ngay" }
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        actions={
          <div className="flex items-center gap-3">
            <TenantPicker selectedTenantId={selectedTenant.id} tenants={tenants} />
          </div>
        }
        description="Tong quan su kien, conversion va hieu suat trang."
        eyebrow="Analytics"
        title="Analytics Dashboard"
      />

      <div className="flex items-center gap-2">
        {rangeOptions.map((opt) => (
          <a
            key={opt.value}
            href={`/admin/analytics?tenantId=${selectedTenant.id}&range=${opt.value}${localeFilter ? `&locale=${localeFilter}` : ""}`}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              range === opt.value
                ? "bg-stone-950 text-white"
                : "bg-white text-stone-600 hover:bg-stone-100"
            }`}
          >
            {opt.label}
          </a>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Tong su kien" value={totalEvents} />
        <MetricCard title="Page Views" value={pageViews} />
        <MetricCard title="Leads" value={leadsCount} />
        <MetricCard title="Conversion Rate" value={`${conversionRate}%`} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Phone Clicks" value={phoneClicks} accent="emerald" />
        <MetricCard title="Zalo Clicks" value={zaloClicks} accent="blue" />
        <MetricCard title="WhatsApp Clicks" value={whatsappClicks} accent="green" />
        <MetricCard title="Form Submissions" value={formSubmits} accent="amber" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard title="CTA Clicks" value={ctaClicks} />
        <MetricCard title="Booking Intents" value={bookingIntents} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Landing Pages</CardTitle>
          </CardHeader>
          <CardContent>
            {topPages.length === 0 ? (
              <p className="text-sm text-stone-500">Chua co du lieu.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Path</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topPages.map((row) => (
                    <TableRow key={row.path}>
                      <TableCell className="max-w-[250px] truncate text-sm">{row.path}</TableCell>
                      <TableCell className="text-right text-sm font-medium">{row._count.id}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            {topCampaigns.length === 0 ? (
              <p className="text-sm text-stone-500">Chua co du lieu.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead className="text-right">Events</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCampaigns.map((row) => (
                    <TableRow key={row.utmCampaign}>
                      <TableCell className="max-w-[250px] truncate text-sm">{row.utmCampaign}</TableCell>
                      <TableCell className="text-right text-sm font-medium">{row._count.id}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Sources</CardTitle>
          </CardHeader>
          <CardContent>
            {topSources.length === 0 ? (
              <p className="text-sm text-stone-500">Chua co du lieu.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Events</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topSources.map((row) => (
                    <TableRow key={row.utmSource}>
                      <TableCell className="max-w-[250px] truncate text-sm">{row.utmSource}</TableCell>
                      <TableCell className="text-right text-sm font-medium">{row._count.id}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  accent
}: {
  title: string;
  value: number | string;
  accent?: "emerald" | "blue" | "green" | "amber";
}) {
  const accentColors = {
    emerald: "border-emerald-200 bg-emerald-50",
    blue: "border-blue-200 bg-blue-50",
    green: "border-green-200 bg-green-50",
    amber: "border-amber-200 bg-amber-50"
  };

  const cls = accent
    ? `rounded-2xl border p-5 shadow-sm ${accentColors[accent]}`
    : "rounded-2xl border border-stone-200 bg-white p-5 shadow-sm";

  return (
    <div className={cls}>
      <p className="text-xs font-medium uppercase tracking-wider text-stone-500">{title}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-stone-950">{value}</p>
    </div>
  );
}
