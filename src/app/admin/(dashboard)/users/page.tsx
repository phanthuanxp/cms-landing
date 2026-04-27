import Link from "next/link";
import { GlobalRole, TenantMemberRole } from "@prisma/client";

import { removeTenantMembershipAction, softDeleteUserAction, upsertUserAction } from "@/features/users/actions";
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
import { getLocaleFromCookie, getTranslations } from "@/lib/i18n";
import { requireRole } from "@/server/auth/permissions";
import { buildPagination, parseListParams } from "@/server/queries/admin";
import { db } from "@/server/db/client";
import { formatDate } from "@/lib/utils";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function UsersPage({ searchParams }: Props) {
  await requireRole(GlobalRole.SUPER_ADMIN, "/admin/users");
  const locale = await getLocaleFromCookie();
  const t = getTranslations(locale);
  const rawParams = await searchParams;
  const params = parseListParams(rawParams);
  const editId = typeof rawParams.edit === "string" ? rawParams.edit : undefined;

  const where = {
    deletedAt: null,
    ...(params.q
      ? {
          OR: [
            { name: { contains: params.q, mode: "insensitive" as const } },
            { email: { contains: params.q, mode: "insensitive" as const } }
          ]
        }
      : {}),
    ...(params.status === "active" ? { isActive: true } : {}),
    ...(params.status === "inactive" ? { isActive: false } : {})
  };

  const total = await db.user.count({ where });
  const pagination = buildPagination(total, params.page, params.pageSize);
  const [users, selectedUser, tenants] = await Promise.all([
    db.user.findMany({
      where,
      include: {
        tenantMemberships: {
          where: {
            deletedAt: null
          },
          include: {
            tenant: {
              include: {
                siteSettings: true
              }
            }
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
      ? db.user.findFirst({
          where: {
            id: editId,
            deletedAt: null
          },
          include: {
            tenantMemberships: {
              where: {
                deletedAt: null
              },
              include: {
                tenant: {
                  include: {
                    siteSettings: true
                  }
                }
              }
            }
          }
        })
      : Promise.resolve(null),
    db.tenant.findMany({
      where: {
        deletedAt: null
      },
      include: {
        siteSettings: true
      },
      orderBy: {
        slug: "asc"
      }
    })
  ]);

  const filterParams = new URLSearchParams();
  if (params.q) filterParams.set("q", params.q);
  if (params.status) filterParams.set("status", params.status);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        description={t.users.description}
        eyebrow={t.users.eyebrow}
        title={t.users.title}
      />

      <DataTableToolbar
        q={params.q}
        status={params.status}
        searchPlaceholder={t.searchToolbar.placeholder}
        statusOptions={[
          { value: "active", label: t.status.active },
          { value: "inactive", label: t.status.inactive }
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.7fr,1fr]">
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Global role</TableHead>
                  <TableHead>{t.table.status}</TableHead>
                  <TableHead>{t.table.memberships}</TableHead>
                  <TableHead>{t.table.updated}</TableHead>
                  <TableHead className="text-right">{t.table.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell className="p-0" colSpan={6}>
                      <EmptyState description={t.users.emptyDescription} title={t.users.emptyTitle} />
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-stone-950">{user.name}</p>
                          <p className="text-xs text-stone-500">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{user.globalRole}</TableCell>
                      <TableCell>
                        <AdminStatusBadge status={user.isActive ? "ACTIVE" : "INACTIVE"} />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-xs text-stone-500">
                          {user.tenantMemberships.length === 0
                            ? t.users.noMemberships
                            : user.tenantMemberships.map((membership) => (
                                <p key={membership.id}>
                                  {membership.tenant.siteSettings?.siteName ?? membership.tenant.slug}: {membership.role}
                                </p>
                              ))}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(user.updatedAt)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/admin/users?edit=${user.id}`}>{t.common.edit}</Link>
                          </Button>
                          <form action={softDeleteUserAction}>
                            <input name="userId" type="hidden" value={user.id} />
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
          <PaginationLinks basePath="/admin/users" page={pagination.page} pageCount={pagination.pageCount} params={filterParams} />
        </div>

        <div className="space-y-6">
          <AdminFormSection
            description={t.users.formDescription}
            title={selectedUser ? t.users.editTitle : t.users.createTitle}
          >
            <form action={upsertUserAction} className="space-y-4">
              <input name="userId" type="hidden" value={selectedUser?.id ?? ""} />
              <div className="space-y-2">
                <Label htmlFor="name">{t.table.name}</Label>
                <Input defaultValue={selectedUser?.name ?? ""} id="name" name="name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t.table.email}</Label>
                <Input defaultValue={selectedUser?.email ?? ""} id="email" name="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="globalRole">Global role</Label>
                  <Select defaultValue={selectedUser?.globalRole ?? GlobalRole.USER} id="globalRole" name="globalRole">
                    {Object.values(GlobalRole).map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tenantRole">Tenant role</Label>
                  <Select defaultValue={selectedUser?.tenantMemberships[0]?.role ?? ""} id="tenantRole" name="tenantRole">
                    <option value="">—</option>
                    {Object.values(TenantMemberRole).map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenantId">Tenant</Label>
                <Select defaultValue={selectedUser?.tenantMemberships[0]?.tenantId ?? ""} id="tenantId" name="tenantId">
                  <option value="">—</option>
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.siteSettings?.siteName ?? tenant.slug}
                    </option>
                  ))}
                </Select>
              </div>
              <label className="flex items-center gap-2 text-sm text-stone-700">
                <input defaultChecked={selectedUser ? selectedUser.isActive : true} name="isActive" type="checkbox" />
                {t.status.active}
              </label>
              <div className="flex items-center gap-2">
                <SubmitButton>{t.common.save}</SubmitButton>
                <Button asChild type="button" variant="ghost">
                  <Link href="/admin/users">{t.common.create}</Link>
                </Button>
              </div>
            </form>
          </AdminFormSection>

          {selectedUser ? (
            <AdminFormSection title={t.table.memberships}>
              <div className="space-y-2">
                {selectedUser.tenantMemberships.length === 0 ? (
                  <EmptyState description={t.pages.noTenantDescription} title={t.users.noMemberships} />
                ) : (
                  selectedUser.tenantMemberships.map((membership) => (
                    <div className="flex items-center justify-between rounded-xl border border-stone-200 px-3 py-3 text-sm" key={membership.id}>
                      <div>
                        <p className="font-medium text-stone-950">{membership.tenant.siteSettings?.siteName ?? membership.tenant.slug}</p>
                        <p className="text-xs text-stone-500">{membership.role}</p>
                      </div>
                      <form action={removeTenantMembershipAction}>
                        <input name="membershipId" type="hidden" value={membership.id} />
                        <ConfirmSubmitButton confirmationMessage={t.confirmDialog.defaultMessage} size="sm" variant="destructive">
                          {t.common.delete}
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                  ))
                )}
              </div>
            </AdminFormSection>
          ) : null}
        </div>
      </div>
    </div>
  );
}
