import Link from "next/link";
import { TenantMemberRole } from "@prisma/client";

import { softDeleteCategoryAction, upsertCategoryAction } from "@/features/blog/actions";
import { AdminFormSection } from "@/components/admin/form-section";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { DataTableToolbar } from "@/components/admin/data-table-toolbar";
import { PaginationLinks } from "@/components/admin/pagination-links";
import { TenantPicker } from "@/components/admin/tenant-picker";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { getLocaleFromCookie, getTranslations } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";
import { requireAuth } from "@/server/auth/session";
import { requireTenantAccess } from "@/server/auth/permissions";
import { buildPagination, parseListParams, resolveAdminTenant } from "@/server/queries/admin";
import { db } from "@/server/db/client";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BlogCategoriesPage({ searchParams }: Props) {
  const user = await requireAuth("/admin/blog/categories");
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
    nextPath: `/admin/blog/categories?tenantId=${selectedTenant.id}`
  });

  const where = {
    tenantId: selectedTenant.id,
    deletedAt: null,
    ...(params.q
      ? {
          OR: [
            { name: { contains: params.q, mode: "insensitive" as const } },
            { slug: { contains: params.q, mode: "insensitive" as const } }
          ]
        }
      : {})
  };

  const total = await db.blogCategory.count({ where });
  const pagination = buildPagination(total, params.page, params.pageSize);
  const [categories, selectedCategory] = await Promise.all([
    db.blogCategory.findMany({
      where,
      orderBy: {
        updatedAt: "desc"
      },
      skip: pagination.skip,
      take: pagination.take
    }),
    editId
      ? db.blogCategory.findFirst({
          where: {
            id: editId,
            tenantId: selectedTenant.id,
            deletedAt: null
          }
        })
      : Promise.resolve(null)
  ]);

  const filterParams = new URLSearchParams();
  filterParams.set("tenantId", selectedTenant.id);
  if (params.q) filterParams.set("q", params.q);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        actions={<TenantPicker selectedTenantId={selectedTenant.id} tenants={tenants} />}
        description={t.blog.categoriesDescription}
        eyebrow={t.blog.categoriesEyebrow}
        title={t.blog.categoriesTitle}
      />

      <DataTableToolbar q={params.q} tenantId={selectedTenant.id} searchPlaceholder={t.searchToolbar.placeholder} />

      <div className="grid gap-6 xl:grid-cols-[1.7fr,1fr]">
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.table.name}</TableHead>
                  <TableHead>{t.table.slug}</TableHead>
                  <TableHead>{t.table.description}</TableHead>
                  <TableHead>{t.table.updated}</TableHead>
                  <TableHead className="text-right">{t.table.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell className="p-0" colSpan={5}>
                      <EmptyState description={t.blog.emptyCategoriesDescription} title={t.blog.emptyCategoriesTitle} />
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>{category.name}</TableCell>
                      <TableCell>{category.slug}</TableCell>
                      <TableCell>{category.description ?? "N/A"}</TableCell>
                      <TableCell>{formatDate(category.updatedAt)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/admin/blog/categories?tenantId=${selectedTenant.id}&edit=${category.id}`}>{t.common.edit}</Link>
                          </Button>
                          <form action={softDeleteCategoryAction}>
                            <input name="tenantId" type="hidden" value={selectedTenant.id} />
                            <input name="categoryId" type="hidden" value={category.id} />
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
          <PaginationLinks basePath="/admin/blog/categories" page={pagination.page} pageCount={pagination.pageCount} params={filterParams} />
        </div>

        <AdminFormSection title={selectedCategory ? t.blog.editCategoryTitle : t.blog.createCategoryTitle}>
          <form action={upsertCategoryAction} className="space-y-4">
            <input name="tenantId" type="hidden" value={selectedTenant.id} />
            <input name="categoryId" type="hidden" value={selectedCategory?.id ?? ""} />
            <div className="space-y-2">
              <Label htmlFor="name">{t.table.name}</Label>
              <Input defaultValue={selectedCategory?.name ?? ""} id="name" name="name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">{t.table.slug}</Label>
              <Input defaultValue={selectedCategory?.slug ?? ""} id="slug" name="slug" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t.table.description}</Label>
              <Textarea defaultValue={selectedCategory?.description ?? ""} id="description" name="description" rows={5} />
            </div>
            <div className="flex items-center gap-2">
              <SubmitButton>{t.common.save}</SubmitButton>
              <Button asChild type="button" variant="ghost">
                <Link href={`/admin/blog/categories?tenantId=${selectedTenant.id}`}>{t.common.create}</Link>
              </Button>
            </div>
          </form>
        </AdminFormSection>
      </div>
    </div>
  );
}
