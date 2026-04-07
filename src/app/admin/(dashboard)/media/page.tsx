import { TenantMemberRole } from "@prisma/client";

import { AdminPageHeader } from "@/components/admin/page-header";
import { TenantPicker } from "@/components/admin/tenant-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAuth } from "@/server/auth/session";
import { requireTenantAccess } from "@/server/auth/permissions";
import { resolveAdminTenant } from "@/server/queries/admin";
import { db } from "@/server/db/client";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MediaPage({ searchParams }: Props) {
  const user = await requireAuth("/admin/media");
  const params = await searchParams;
  const tenantId = typeof params.tenantId === "string" ? params.tenantId : undefined;
  const { tenants, selectedTenant } = await resolveAdminTenant(user, tenantId);

  if (!selectedTenant) {
    return <EmptyState description="Tai khoan nay chua duoc gan tenant nao." title="Khong co tenant" />;
  }

  await requireTenantAccess(selectedTenant.id, {
    roles: [TenantMemberRole.TENANT_ADMIN, TenantMemberRole.EDITOR],
    nextPath: `/admin/media?tenantId=${selectedTenant.id}`
  });

  const assets = await db.mediaAsset.findMany({
    where: {
      tenantId: selectedTenant.id,
      deletedAt: null
    },
    orderBy: {
      updatedAt: "desc"
    }
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        actions={<TenantPicker selectedTenantId={selectedTenant.id} tenants={tenants} />}
        description="editor va tenant_admin co the xem media assets trong tenant cua minh."
        eyebrow="Assets"
        title="Media"
      />
      <Card>
        <CardHeader>
          <CardTitle>Media assets</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>MIME</TableHead>
                <TableHead>Dimensions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell>{asset.name}</TableCell>
                  <TableCell>{asset.status}</TableCell>
                  <TableCell>{asset.mimeType ?? "N/A"}</TableCell>
                  <TableCell>
                    {asset.width ?? 0} x {asset.height ?? 0}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
