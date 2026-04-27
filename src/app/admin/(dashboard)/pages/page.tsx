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
import { getDefaultPageBlocks } from "@/lib/constants";
import { getLocaleFromCookie, getTranslations } from "@/lib/i18n";
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
  const locale = await getLocaleFromCookie();
  const t = getTranslations(locale);
  const rawParams = await searchParams;
  const params = parseListParams(rawParams);
  const editId = typeof rawParams.edit === "string" ? rawParams.edit : undefined;
  const { tenants, selectedTenant } = await resolveAdminTenant(user, params.tenantId || undefined);

  if (!selectedTenant) {
    return <EmptyState description={t.pages.noTenantDescription} title={t.pages.noTenant} />;
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

  const defaultBlocks = getDefaultPageBlocks(t.defaultBlocks);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        actions={<TenantPicker selectedTenantId={selectedTenant.id} tenants={tenants} />}
        description={t.pages.description}
        eyebrow={t.pages.eyebrow}
        title={t.pages.title}
      />

      <DataTableToolbar
        q={params.q}
        status={params.status}
        tenantId={selectedTenant.id}
        searchPlaceholder={t.searchToolbar.placeholder}
        statusOptions={[
          { value: PublishStatus.DRAFT, label: t.status.draft },
          { value: PublishStatus.PUBLISHED, label: t.status.published },
          { value: PublishStatus.ARCHIVED, label: t.status.archived }
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.7fr,1fr]">
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.table.title}</TableHead>
                  <TableHead>{t.table.slug}</TableHead>
                  <TableHead>{t.table.status}</TableHead>
                  <TableHead>Blocks</TableHead>
                  <TableHead>{t.table.updated}</TableHead>
                  <TableHead className="text-right">{t.table.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.length === 0 ? (
                  <TableRow>
                    <TableCell className="p-0" colSpan={6}>
                      <EmptyState description={t.pages.emptyDescription} title={t.pages.emptyTitle} />
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
                            <Link href={`/admin/pages?tenantId=${selectedTenant.id}&edit=${page.id}`}>{t.common.edit}</Link>
                          </Button>
                          <form action={softDeleteLandingPageAction}>
                            <input name="tenantId" type="hidden" value={selectedTenant.id} />
                            <input name="pageId" type="hidden" value={page.id} />
                            <ConfirmSubmitButton confirmationMessage={t.confirmDialog.defaultMessage} size="sm" variant="destructive">
                              {t.common.delete}
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
          description={t.pages.formDescription}
          title={selectedPage ? t.pages.editTitle : t.pages.createTitle}
        >
          <form action={upsertLandingPageAction} className="space-y-4">
            <input name="tenantId" type="hidden" value={selectedTenant.id} />
            <input name="pageId" type="hidden" value={selectedPage?.id ?? ""} />

            <div className="space-y-2">
              <Label htmlFor="title">{t.table.title}</Label>
              <Input defaultValue={selectedPage?.title ?? ""} id="title" name="title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">{t.table.slug}</Label>
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
                <Label htmlFor="status">{t.table.status}</Label>
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
                  selectedPage?.blocks.map((block) => block.payload) ?? defaultBlocks,
                  null,
                  2
                )}
                id="blocks"
                name="blocks"
                rows={16}
              />
            </div>
            <div className="flex items-center gap-2">
              <SubmitButton>{t.common.save}</SubmitButton>
              <Button asChild type="button" variant="ghost">
                <Link href={`/admin/pages?tenantId=${selectedTenant.id}`}>{t.common.create}</Link>
              </Button>
            </div>
          </form>
        </AdminFormSection>
      </div>
    </div>
  );
}
