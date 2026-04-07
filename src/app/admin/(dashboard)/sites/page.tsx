import Link from "next/link";
import { GlobalRole, TenantStatus } from "@prisma/client";

import { addDomainAction, setPrimaryDomainAction, softDeleteDomainAction, softDeleteTenantAction, upsertTenantAction } from "@/features/sites/actions";
import { AdminFormSection } from "@/components/admin/form-section";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { DataTableToolbar } from "@/components/admin/data-table-toolbar";
import { PaginationLinks } from "@/components/admin/pagination-links";
import { AdminStatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { requireRole } from "@/server/auth/permissions";
import { parseListParams, buildPagination } from "@/server/queries/admin";
import { db } from "@/server/db/client";
import { formatDate, parseEnumSearchParam } from "@/lib/utils";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SitesPage({ searchParams }: Props) {
  await requireRole(GlobalRole.SUPER_ADMIN, "/admin/sites");
  const rawParams = await searchParams;
  const params = parseListParams(rawParams);
  const editId = typeof rawParams.edit === "string" ? rawParams.edit : undefined;
  const statusFilter = parseEnumSearchParam(params.status, Object.values(TenantStatus));

  const where = {
    deletedAt: null,
    ...(params.q
      ? {
          OR: [
            { slug: { contains: params.q, mode: "insensitive" as const } },
            { siteSettings: { siteName: { contains: params.q, mode: "insensitive" as const } } }
          ]
        }
      : {}),
    ...(statusFilter ? { status: statusFilter } : {})
  };

  const total = await db.tenant.count({ where });
  const pagination = buildPagination(total, params.page, params.pageSize);

  const [tenants, allTenants] = await Promise.all([
    db.tenant.findMany({
      where,
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
        createdAt: "desc"
      },
      skip: pagination.skip,
      take: pagination.take
    }),
    db.tenant.findMany({
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
        createdAt: "desc"
      }
    })
  ]);

  const selectedTenant = allTenants.find((tenant) => tenant.id === editId) ?? allTenants[0] ?? null;
  const search = new URLSearchParams();

  if (params.q) search.set("q", params.q);
  if (params.status) search.set("status", params.status);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        description="Super admin quan ly tenants, domains va pham vi he thong tai mot noi. Domain primary/secondary deu duoc kiem soat tai day."
        eyebrow="System"
        title="Tenants & Domains"
      />

      <DataTableToolbar
        q={params.q}
        status={params.status}
        statusOptions={[
          { value: TenantStatus.ACTIVE, label: "Active" },
          { value: TenantStatus.INACTIVE, label: "Inactive" },
          { value: TenantStatus.SUSPENDED, label: "Suspended" }
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.7fr,1fr]">
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Primary Domain</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.length === 0 ? (
                  <TableRow>
                    <TableCell className="p-0" colSpan={6}>
                      <EmptyState description="Chua co tenant nao khop voi bo loc hien tai." title="Khong co tenant" />
                    </TableCell>
                  </TableRow>
                ) : (
                  tenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-stone-950">{tenant.siteSettings?.siteName ?? tenant.slug}</p>
                          <p className="text-xs text-stone-500">{tenant.domains.length} domains</p>
                        </div>
                      </TableCell>
                      <TableCell>{tenant.slug}</TableCell>
                      <TableCell>
                        <AdminStatusBadge status={tenant.status} />
                      </TableCell>
                      <TableCell>{tenant.domains.find((domain) => domain.isPrimary)?.host ?? "N/A"}</TableCell>
                      <TableCell>{formatDate(tenant.updatedAt)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/admin/sites?edit=${tenant.id}`}>Sua</Link>
                          </Button>
                          <form action={softDeleteTenantAction}>
                            <input name="tenantId" type="hidden" value={tenant.id} />
                            <ConfirmSubmitButton size="sm" variant="destructive">
                              Xoa
                            </ConfirmSubmitButton>
                          </form>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <PaginationLinks basePath="/admin/sites" page={pagination.page} pageCount={pagination.pageCount} params={search} />
        </div>

        <div className="space-y-6">
          <AdminFormSection
            description="Form tao/sua tenant toi thieu. Site settings chi tiet hon duoc cap nhat tai module Settings."
            title={selectedTenant ? "Chinh sua tenant" : "Tao tenant moi"}
          >
            <form action={upsertTenantAction} className="space-y-4">
              <input name="tenantId" type="hidden" value={selectedTenant?.id ?? ""} />
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site name</Label>
                  <Input defaultValue={selectedTenant?.siteSettings?.siteName ?? ""} id="siteName" name="siteName" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input defaultValue={selectedTenant?.slug ?? ""} id="slug" name="slug" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select defaultValue={selectedTenant?.status ?? TenantStatus.ACTIVE} id="status" name="status">
                    {Object.values(TenantStatus).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultSeoTitle">Default SEO title</Label>
                  <Input
                    defaultValue={selectedTenant?.siteSettings?.defaultSeoTitle ?? ""}
                    id="defaultSeoTitle"
                    name="defaultSeoTitle"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultSeoDescription">Default SEO description</Label>
                  <Textarea
                    defaultValue={selectedTenant?.siteSettings?.defaultSeoDescription ?? ""}
                    id="defaultSeoDescription"
                    name="defaultSeoDescription"
                    rows={4}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <SubmitButton>Luu tenant</SubmitButton>
                <Button asChild type="button" variant="ghost">
                  <Link href="/admin/sites">Tao moi</Link>
                </Button>
              </div>
            </form>
          </AdminFormSection>

          <AdminFormSection
            description="Them, xoa va chon primary domain cho tenant dang duoc mo."
            title="Domain manager"
          >
            {selectedTenant ? (
              <div className="space-y-4">
                <form action={addDomainAction} className="flex gap-2">
                  <input name="tenantId" type="hidden" value={selectedTenant.id} />
                  <Input name="host" placeholder="alpha.lvh.me" />
                  <SubmitButton>Them</SubmitButton>
                </form>
                <div className="space-y-2">
                  {selectedTenant.domains.length === 0 ? (
                    <EmptyState description="Tenant nay chua co domain nao." title="Chua co domain" />
                  ) : (
                    selectedTenant.domains.map((domain) => (
                      <div
                        className="flex items-center justify-between rounded-xl border border-stone-200 px-3 py-3 text-sm"
                        key={domain.id}
                      >
                        <div className="space-y-1">
                          <p className="font-medium text-stone-950">{domain.host}</p>
                          <p className="text-xs text-stone-500">{domain.isPrimary ? "Primary domain" : "Secondary domain"}</p>
                        </div>
                        <div className="flex gap-2">
                          {!domain.isPrimary ? (
                            <form action={setPrimaryDomainAction}>
                              <input name="tenantId" type="hidden" value={selectedTenant.id} />
                              <input name="domainId" type="hidden" value={domain.id} />
                              <Button size="sm" type="submit" variant="outline">
                                Dat primary
                              </Button>
                            </form>
                          ) : null}
                          <form action={softDeleteDomainAction}>
                            <input name="tenantId" type="hidden" value={selectedTenant.id} />
                            <input name="domainId" type="hidden" value={domain.id} />
                            <ConfirmSubmitButton size="sm" variant="destructive">
                              Xoa
                            </ConfirmSubmitButton>
                          </form>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <EmptyState description="Hay tao tenant truoc khi quan ly domains." title="Chua co tenant" />
            )}
          </AdminFormSection>
        </div>
      </div>
    </div>
  );
}
