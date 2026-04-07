import Link from "next/link";
import { PageType, PublishStatus, TenantMemberRole } from "@prisma/client";

import { softDeleteLandingPageAction, upsertLandingPageAction } from "@/features/pages/actions";
import { AdminFormSection } from "@/components/admin/form-section";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { DataTableToolbar } from "@/components/admin/data-table-toolbar";
import { PaginationLinks } from "@/components/admin/pagination-links";
import { AdminStatusBadge } from "@/components/admin/status-badge";
import { TenantPicker } from "@/components/admin/tenant-picker";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_PAGE_BLOCKS } from "@/lib/constants";
import { formatDate, parseEnumSearchParam } from "@/lib/utils";
import { requireTenantAccess } from "@/server/auth/permissions";
import { requireAuth } from "@/server/auth/session";
import { buildPagination, parseListParams, resolveAdminTenant } from "@/server/queries/admin";
import { db } from "@/server/db/client";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PagesPage({ searchParams }: Props) {
  const user = await requireAuth("/admin/pages");
  const rawParams = await searchParams;
  const params = parseListParams(rawParams);
  const editId = typeof rawParams.edit === "string" ? rawParams.edit : undefined;
  const { tenants, selectedTenant } = await resolveAdminTenant(user, params.tenantId || undefined);

  if (!selectedTenant) {
    return <EmptyState description="Tai khoan nay chua duoc gan tenant nao." title="Khong co tenant" />;
  }

  await requireTenantAccess(selectedTenant.id, {
    roles: [TenantMemberRole.TENANT_ADMIN, TenantMemberRole.EDITOR],
    nextPath: `/admin/pages?tenantId=${selectedTenant.id}`
  });

  const statusFilter = parseEnumSearchParam(params.status, Object.values(PublishStatus));

  const where = {
    tenantId: selectedTenant.id,
    deletedAt: null,
    ...(params.q
      ? {
          OR: [
            { title: { contains: params.q, mode: "insensitive" as const } },
            { slug: { contains: params.q, mode: "insensitive" as const } },
            { summary: { contains: params.q, mode: "insensitive" as const } }
          ]
        }
      : {}),
    ...(statusFilter ? { status: statusFilter } : {})
  };

  const total = await db.page.count({ where });
  const pagination = buildPagination(total, params.page, params.pageSize);
  const [pages, selectedPage] = await Promise.all([
    db.page.findMany({
      where,
      include: {
        blocks: {
          where: {
            deletedAt: null
          },
          orderBy: {
            position: "asc"
          }
        }
      },
      orderBy: {
        updatedAt: "desc"
      },
      skip: pagination.skip,
      take: pagination.take
    }),
    editId
      ? db.page.findFirst({
          where: {
            id: editId,
            tenantId: selectedTenant.id,
            deletedAt: null
          },
          include: {
            blocks: {
              where: {
                deletedAt: null
              },
              orderBy: {
                position: "asc"
              }
            }
          }
        })
      : Promise.resolve(null)
  ]);

  const filterParams = new URLSearchParams();
  filterParams.set("tenantId", selectedTenant.id);
  if (params.q) filterParams.set("q", params.q);
  if (params.status) filterParams.set("status", params.status);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        actions={<TenantPicker selectedTenantId={selectedTenant.id} tenants={tenants} />}
        description="Quan ly landing pages theo tenant voi blocks JSON co validation server-side."
        eyebrow="Content"
        title="Pages"
      />

      <DataTableToolbar
        q={params.q}
        status={params.status}
        tenantId={selectedTenant.id}
        statusOptions={[
          { value: PublishStatus.DRAFT, label: "Draft" },
          { value: PublishStatus.PUBLISHED, label: "Published" },
          { value: PublishStatus.ARCHIVED, label: "Archived" }
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.7fr,1fr]">
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Blocks</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.length === 0 ? (
                  <TableRow>
                    <TableCell className="p-0" colSpan={6}>
                      <EmptyState description="Chua co landing page nao khop voi bo loc hien tai." title="Khong co page" />
                    </TableCell>
                  </TableRow>
                ) : (
                  pages.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-stone-950">{page.title}</p>
                          <p className="text-xs text-stone-500">{page.pageType}</p>
                        </div>
                      </TableCell>
                      <TableCell>{page.slug}</TableCell>
                      <TableCell>
                        <AdminStatusBadge status={page.status} />
                      </TableCell>
                      <TableCell>{page.blocks.length}</TableCell>
                      <TableCell>{formatDate(page.updatedAt)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/admin/pages?tenantId=${selectedTenant.id}&edit=${page.id}`}>Sua</Link>
                          </Button>
                          <form action={softDeleteLandingPageAction}>
                            <input name="tenantId" type="hidden" value={selectedTenant.id} />
                            <input name="pageId" type="hidden" value={page.id} />
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

          <PaginationLinks basePath="/admin/pages" page={pagination.page} pageCount={pagination.pageCount} params={filterParams} />
        </div>

        <AdminFormSection
          description="Blocks dung JSON array theo schema cac block co ban. Ban co the bat dau tu mau mac dinh roi tinh chinh dan."
          title={selectedPage ? "Chinh sua page" : "Tao page moi"}
        >
          <form action={upsertLandingPageAction} className="space-y-4">
            <input name="tenantId" type="hidden" value={selectedTenant.id} />
            <input name="pageId" type="hidden" value={selectedPage?.id ?? ""} />

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input defaultValue={selectedPage?.title ?? ""} id="title" name="title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input defaultValue={selectedPage?.slug ?? ""} id="slug" name="slug" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="summary">Summary</Label>
              <Textarea defaultValue={selectedPage?.summary ?? ""} id="summary" name="summary" rows={3} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pageType">Page type</Label>
                <Select defaultValue={selectedPage?.pageType ?? PageType.LANDING} id="pageType" name="pageType">
                  {Object.values(PageType).map((pageType) => (
                    <option key={pageType} value={pageType}>
                      {pageType}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select defaultValue={selectedPage?.status ?? PublishStatus.DRAFT} id="status" name="status">
                  {Object.values(PublishStatus).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="seoTitle">SEO title</Label>
              <Input defaultValue={selectedPage?.seoTitle ?? ""} id="seoTitle" name="seoTitle" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seoDescription">SEO description</Label>
              <Textarea defaultValue={selectedPage?.seoDescription ?? ""} id="seoDescription" name="seoDescription" rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ogImageUrl">OG image URL</Label>
              <Input defaultValue={selectedPage?.ogImageUrl ?? ""} id="ogImageUrl" name="ogImageUrl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blocks">Blocks JSON</Label>
              <Textarea
                defaultValue={JSON.stringify(
                  selectedPage?.blocks.map((block) => block.payload) ?? DEFAULT_PAGE_BLOCKS,
                  null,
                  2
                )}
                id="blocks"
                name="blocks"
                rows={16}
              />
            </div>
            <div className="flex items-center gap-2">
              <SubmitButton>Luu page</SubmitButton>
              <Button asChild type="button" variant="ghost">
                <Link href={`/admin/pages?tenantId=${selectedTenant.id}`}>Tao moi</Link>
              </Button>
            </div>
          </form>
        </AdminFormSection>
      </div>
    </div>
  );
}
