import Link from "next/link";
import { FolderTree, Globe, ImageIcon, Inbox, LayoutDashboard, MenuSquare, Newspaper, Settings, FileText, Users } from "lucide-react";

import { type Locale, getTranslations } from "@/lib/i18n";
import { isSuperAdmin } from "@/server/auth/permissions";
import type { CurrentUser } from "@/server/auth/session";

type NavAccess = "ALL" | "SUPER_ADMIN" | "TENANT_ADMIN" | "CONTENT";

type NavKey = "dashboard" | "sites" | "users" | "landingPages" | "blogCategories" | "blogPosts" | "menus" | "leads" | "media" | "settings";

const navGroups: Array<{ href: string; key: NavKey; icon: typeof LayoutDashboard; roles: NavAccess[] }> = [
  { href: "/admin/dashboard", key: "dashboard", icon: LayoutDashboard, roles: ["ALL"] },
  { href: "/admin/sites", key: "sites", icon: Globe, roles: ["SUPER_ADMIN"] },
  { href: "/admin/users", key: "users", icon: Users, roles: ["SUPER_ADMIN"] },
  { href: "/admin/pages", key: "landingPages", icon: FileText, roles: ["CONTENT"] },
  { href: "/admin/blog/categories", key: "blogCategories", icon: FolderTree, roles: ["CONTENT"] },
  { href: "/admin/blog/posts", key: "blogPosts", icon: Newspaper, roles: ["CONTENT"] },
  { href: "/admin/menus", key: "menus", icon: MenuSquare, roles: ["CONTENT"] },
  { href: "/admin/leads", key: "leads", icon: Inbox, roles: ["CONTENT"] },
  { href: "/admin/media", key: "media", icon: ImageIcon, roles: ["CONTENT"] },
  { href: "/admin/settings", key: "settings", icon: Settings, roles: ["TENANT_ADMIN"] }
];

function canViewItem(user: CurrentUser, item: (typeof navGroups)[number]) {
  if (item.roles.some((role) => role === "ALL")) {
    return true;
  }

  if (item.roles.some((role) => role === "SUPER_ADMIN") && isSuperAdmin(user)) {
    return true;
  }

  if (item.roles.some((role) => role === "TENANT_ADMIN")) {
    return isSuperAdmin(user) || user.tenantMemberships.some((membership) => membership.role === "TENANT_ADMIN");
  }

  if (item.roles.some((role) => role === "CONTENT")) {
    return isSuperAdmin(user) || user.tenantMemberships.some((membership) => membership.role === "TENANT_ADMIN" || membership.role === "EDITOR");
  }

  return false;
}

export function AdminSidebar({ user, locale }: { user: CurrentUser; locale: Locale }) {
  const t = getTranslations(locale);
  const items = navGroups.filter((item) => canViewItem(user, item));

  return (
    <aside className="hidden w-72 border-r border-stone-200 bg-stone-950 text-stone-200 lg:block">
      <div className="sticky top-0 flex min-h-screen flex-col p-6">
        <div className="space-y-2 border-b border-stone-800 pb-6">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">{t.sidebar.title}</p>
          <h1 className="text-xl font-semibold text-white">{t.sidebar.subtitle}</h1>
        </div>
        <nav className="mt-6 flex flex-col gap-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-stone-300 transition hover:bg-stone-900 hover:text-white"
                href={item.href}
                key={item.href}
              >
                <Icon className="h-4 w-4" />
                {t.sidebar[item.key]}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
