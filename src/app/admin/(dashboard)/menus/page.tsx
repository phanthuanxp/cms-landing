import Link from "next/link";
import { MenuLocation, TenantMemberRole } from "@prisma/client";

import { softDeleteMenuAction, upsertMenuAction } from "@/features/menu/actions";
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
import { Select } from "@/components/ui/select";
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

export default async function MenusPage({ searchParams }: Props) {
  const user = await requireAuth("/admin/menus");
  const locale = await getLocaleFromCookie();
  const t = getTranslations(locale);
  const rawParams = await searchParams;
  const params = parseListParams(rawParams);
  const editId = typeof rawParams.edit === "string" ? rawParams.edit : undefined;
  const { tenants, selectedTenant } = await resolveAdminTenant(user, params.tenantId || undefined);

  const sampleMenuItems = [
    { label: t.menus.defaultHomeLabel, href: "/", sortOrder: 1 },
    { label: t.menus.defaultBlogLabel, href: "/blog", sortOrder: 2 }
  ];

  if (!selectedTenant) {
    return <EmptyState description={t.pages.noTenantDescription} title={t.pages.noTenant} />;
  }

  await requireTenantAccess(selectedTenant.id, {
    roles: [TenantMemberRole.TENANT_ADMIN, TenantMemberRole.EDITOR],
    nextPath: `/admin/menus?tenantId=${selectedTenant.id}`
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

  const total = await db.menu.count({ where });
  const pagination = buildPagination(total, params.page, params.pageSize);
  const [menus, selectedMenu] = await Promise.all([
    db.menu.findMany({
      where,
      include: {
        items: {
          where: {
            deletedAt: null
          },
          orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }]
        }
      },
      orderBy: {
        updatedAt: "desc"
      },
      skip: pagination.skip,
      take: pagination.take
    }),
    editId
      ? db.menu.findFirst({
          where: {
            id: editId,
            tenantId: selectedTenant.id,
            deletedAt: null
          },
          include: {
            items: {
              where: {
                deletedAt: null
              },
              orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }]
            }
          }
        })
      : Promise.resolve(null)
  ]);

  const filterParams = new URLSearchParams();
  filterParams.set("tenantId", selectedTenant.id);
  if (params.q) filterParams.set("q", params.q);

  const selectedMenuItems = selectedMenu
    ? selectedMenu.items
        .filter((item) => !item.parentId)
        .map((item) => ({
          label: item.label,
          href: item.href,
          target: item.target ?? undefined,
          sortOrder: item.sortOrder,
          children: selectedMenu.items
            .filter((child) => child.parentId === item.id)
            .map((child) => ({
              label: child.label,
              href: child.href,
              target: child.target ?? undefined,
              sortOrder: child.sortOrder
            }))
        }))
    : sampleMenuItems;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        actions={<TenantPicker selectedTenantId={selectedTenant.id} tenants={tenants} />}
        description={t.menus.description}
        eyebrow={t.menus.eyebrow}
        title={t.menus.title}
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
                  <TableHead>Location</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>{t.table.updated}</TableHead>
                  <TableHead className="text-right">{t.table.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {menus.length === 0 ? (
                  <TableRow>
                    <TableCell className="p-0" colSpan={6}>
                      <EmptyState description={t.menus.emptyDescription} title={t.menus.emptyTitle} />
                    </TableCell>
                  </TableRow>
                ) : (
                  menus.map((menu) => (
                    <TableRow key={menu.id}>
                      <TableCell>{menu.name}</TableCell>
                      <TableCell>{menu.slug}</TableCell>
                      <TableCell>{menu.location}</TableCell>
                      <TableCell>{menu.items.filter((item) => !item.parentId).length}</TableCell>
                      <TableCell>{formatDate(menu.updatedAt)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/admin/menus?tenantId=${selectedTenant.id}&edit=${menu.id}`}>{t.common.edit}</Link>
                          </Button>
                          <form action={softDeleteMenuAction}>
                            <input name="tenantId" type="hidden" value={selectedTenant.id} />
                            <input name="menuId" type="hidden" value={menu.id} />
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
          <PaginationLinks basePath="/admin/menus" page={pagination.page} pageCount={pagination.pageCount} params={filterParams} />
        </div>

        <AdminFormSection
          description={t.menus.formDescription}
          title={selectedMenu ? t.menus.editTitle : t.menus.createTitle}
        >
          <form action={upsertMenuAction} className="space-y-4">
            <input name="tenantId" type="hidden" value={selectedTenant.id} />
            <input name="menuId" type="hidden" value={selectedMenu?.id ?? ""} />
            <div className="space-y-2">
              <Label htmlFor="name">{t.table.name}</Label>
              <Input defaultValue={selectedMenu?.name ?? ""} id="name" name="name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">{t.table.slug}</Label>
              <Input defaultValue={selectedMenu?.slug ?? ""} id="slug" name="slug" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select defaultValue={selectedMenu?.location ?? MenuLocation.PRIMARY} id="location" name="location">
                {Object.values(MenuLocation).map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t.table.description}</Label>
              <Textarea defaultValue={selectedMenu?.description ?? ""} id="description" name="description" rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="items">Menu items JSON</Label>
              <Textarea defaultValue={JSON.stringify(selectedMenuItems, null, 2)} id="items" name="items" rows={16} />
            </div>
            <div className="flex items-center gap-2">
              <SubmitButton>{t.common.save}</SubmitButton>
              <Button asChild type="button" variant="ghost">
                <Link href={`/admin/menus?tenantId=${selectedTenant.id}`}>{t.common.create}</Link>
              </Button>
            </div>
          </form>
        </AdminFormSection>
      </div>
    </div>
  );
}
