import { LogOut } from "lucide-react";

import { LocaleSwitcher } from "@/components/admin/locale-switcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n";

export function AdminTopbar({
  userName,
  roleLabel,
  locale,
  currentPath
}: {
  userName: string;
  roleLabel: string;
  locale: Locale;
  currentPath: string;
}) {
  return (
    <header className="border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Admin workspace</p>
          <div className="flex items-center gap-3">
            <p className="text-sm font-medium text-stone-900">{userName}</p>
            <Badge>{roleLabel}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LocaleSwitcher currentLocale={locale} currentPath={currentPath} />
          <form action="/api/admin/logout" method="post">
            <Button size="sm" type="submit" variant="outline">
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
