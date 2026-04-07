import { LeadStatus, TenantMemberRole } from "@prisma/client";

import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTableToolbar } from "@/components/admin/data-table-toolbar";
import { PaginationLinks } from "@/components/admin/pagination-links";
import { AdminStatusBadge } from "@/components/admin/status-badge";
import { TenantPicker } from "@/components/admin/tenant-picker";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, parseEnumSearchParam } from "@/lib/utils";
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
    ...(statusFilter ? { status: statusFilter } : {})
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

  return (
    <div className="space-y-6">
      <AdminPageHeader
        actions={<TenantPicker selectedTenantId={selectedTenant.id} tenants={tenants} />}
        description="Danh sach lead chi doc, co search, filter va pagination theo tenant scope."
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
              <TableHead>Company</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell className="p-0" colSpan={6}>
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
                  <TableCell>{lead.email ?? lead.phone ?? "N/A"}</TableCell>
                  <TableCell>{lead.company ?? "N/A"}</TableCell>
                  <TableCell>{lead.page?.title ?? lead.sourcePath ?? lead.sourceHost ?? "N/A"}</TableCell>
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
