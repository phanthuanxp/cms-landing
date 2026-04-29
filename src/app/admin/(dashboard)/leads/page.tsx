import { LeadStatus, TenantMemberRole } from "@prisma/client";

import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTableToolbar } from "@/components/admin/data-table-toolbar";
import { PaginationLinks } from "@/components/admin/pagination-links";
import { AdminStatusBadge } from "@/components/admin/status-badge";
import { TenantPicker } from "@/components/admin/tenant-picker";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, parseEnumSearchParam, parseSearchParamsValue } from "@/lib/utils";
import { requireAuth } from "@/server/auth/session";
import { requireTenantAccess } from "@/server/auth/permissions";
import { buildPagination, parseListParams, resolveAdminTenant } from "@/server/queries/admin";
import { db } from "@/server/db/client";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LeadsPage({ searchParams }: Props) {
  const user = await requireAuth("/admin/leads");
  const rawParams = await searchParams;
  const params = parseListParams(rawParams);
  const { tenants, selectedTenant } = await resolveAdminTenant(user, params.tenantId || undefined);

  if (!selectedTenant) {
    return <EmptyState description="Tai khoan nay chua duoc gan tenant nao." title="Khong co tenant" />;
  }

  await requireTenantAccess(selectedTenant.id, {
    roles: [TenantMemberRole.TENANT_ADMIN, TenantMemberRole.EDITOR],
    nextPath: `/admin/leads?tenantId=${selectedTenant.id}`
  });

  const statusFilter = parseEnumSearchParam(params.status, Object.values(LeadStatus));
  const sourceFilter = parseSearchParamsValue(rawParams.source);
  const campaignFilter = parseSearchParamsValue(rawParams.campaign);
  const formTypeFilter = parseSearchParamsValue(rawParams.formType);

  const where = {
    tenantId: selectedTenant.id,
    deletedAt: null,
    ...(params.q
      ? {
          OR: [
            { name: { contains: params.q, mode: "insensitive" as const } },
            { email: { contains: params.q, mode: "insensitive" as const } },
            { phone: { contains: params.q, mode: "insensitive" as const } },
            { company: { contains: params.q, mode: "insensitive" as const } }
          ]
        }
      : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(sourceFilter ? { utmSource: sourceFilter } : {}),
    ...(campaignFilter ? { utmCampaign: campaignFilter } : {}),
    ...(formTypeFilter ? { formType: formTypeFilter } : {})
  };

  const total = await db.lead.count({ where });
  const pagination = buildPagination(total, params.page, params.pageSize);
  const leads = await db.lead.findMany({
    where,
    include: {
      page: true
    },
    orderBy: {
      createdAt: "desc"
    },
    skip: pagination.skip,
    take: pagination.take
  });

  const filterParams = new URLSearchParams();
  filterParams.set("tenantId", selectedTenant.id);
  if (params.q) filterParams.set("q", params.q);
  if (params.status) filterParams.set("status", params.status);
  if (sourceFilter) filterParams.set("source", sourceFilter);
  if (campaignFilter) filterParams.set("campaign", campaignFilter);
  if (formTypeFilter) filterParams.set("formType", formTypeFilter);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        actions={<TenantPicker selectedTenantId={selectedTenant.id} tenants={tenants} />}
        description="Danh sach lead voi attribution, campaign tracking va bo loc nang cao."
        eyebrow="CRM"
        title="Leads"
      />

      <DataTableToolbar
        q={params.q}
        status={params.status}
        tenantId={selectedTenant.id}
        statusOptions={Object.values(LeadStatus).map((status) => ({ value: status, label: status }))}
      />

      <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Source / Campaign</TableHead>
              <TableHead>Form Type</TableHead>
              <TableHead>Landing Page</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell className="p-0" colSpan={7}>
                  <EmptyState description="Chua co lead nao khop voi bo loc hien tai." title="Khong co lead" />
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium text-stone-950">{lead.name}</p>
                      <p className="text-xs text-stone-500">{lead.message ?? "Khong co ghi chu"}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      {lead.phone ? <p className="text-sm">{lead.phone}</p> : null}
                      {lead.email ? <p className="text-xs text-stone-500">{lead.email}</p> : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {lead.utmSource ? (
                        <Badge className="text-xs border border-stone-200">
                          {lead.utmSource}{lead.utmMedium ? ` / ${lead.utmMedium}` : ""}
                        </Badge>
                      ) : (
                        <span className="text-xs text-stone-400">Direct</span>
                      )}
                      {lead.utmCampaign ? (
                        <p className="text-xs text-stone-500">{lead.utmCampaign}</p>
                      ) : null}
                      {lead.gclid ? (
                        <Badge className="text-xs border border-blue-200 bg-blue-50 text-blue-600">Google Ads</Badge>
                      ) : null}
                      {lead.fbclid ? (
                        <Badge className="text-xs border border-indigo-200 bg-indigo-50 text-indigo-600">Meta</Badge>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    {lead.formType ? (
                      <Badge className="text-xs border border-stone-200">{lead.formType}</Badge>
                    ) : (
                      <span className="text-xs text-stone-400">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="max-w-[200px] truncate text-xs text-stone-500">
                      {lead.landingPage ?? lead.sourcePath ?? "N/A"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <AdminStatusBadge status={lead.status} />
                  </TableCell>
                  <TableCell>{formatDate(lead.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PaginationLinks basePath="/admin/leads" page={pagination.page} pageCount={pagination.pageCount} params={filterParams} />
    </div>
  );
}
