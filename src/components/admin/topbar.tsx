import { Badge } from "@/components/ui/badge";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AdminTopbar({
  userName,
  roleLabel
}: {
  userName: string;
  roleLabel: string;
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
        <form action="/api/admin/logout" method="post">
          <Button size="sm" type="submit" variant="outline">
            <LogOut className="h-4 w-4" />
            Dang xuat
          </Button>
        </form>
      </div>
    </header>
  );
}
