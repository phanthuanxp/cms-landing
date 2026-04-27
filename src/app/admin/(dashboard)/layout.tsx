import { headers } from "next/headers";

import { AdminUrlToast } from "@/components/admin/url-toast";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";
import { getLocaleFromCookie } from "@/lib/i18n";
import { isSuperAdmin } from "@/server/auth/permissions";
import { requireAuth } from "@/server/auth/session";

export default async function AdminDashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth("/admin/dashboard");
  const locale = await getLocaleFromCookie();
  const headerList = await headers();
  const currentPath = headerList.get("x-current-path") ?? "/admin/dashboard";
  const roleLabel = isSuperAdmin(user)
    ? "super_admin"
    : user.tenantMemberships.some((membership) => membership.role === "TENANT_ADMIN")
      ? "tenant_admin"
      : "editor";

  return (
    <div className="min-h-screen bg-stone-100">
      <AdminUrlToast />
      <div className="flex min-h-screen">
        <AdminSidebar locale={locale} user={user} />
        <div className="flex min-h-screen flex-1 flex-col">
          <AdminTopbar currentPath={currentPath} locale={locale} roleLabel={roleLabel} userName={user.name} />
          <div className="flex-1 px-4 py-6 sm:px-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
