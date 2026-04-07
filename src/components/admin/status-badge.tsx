import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const toneByStatus: Record<string, string> = {
  ACTIVE: "bg-teal-50 text-teal-700",
  PUBLISHED: "bg-teal-50 text-teal-700",
  READY: "bg-teal-50 text-teal-700",
  CONTACTED: "bg-sky-50 text-sky-700",
  QUALIFIED: "bg-sky-50 text-sky-700",
  NEW: "bg-amber-50 text-amber-700",
  DRAFT: "bg-amber-50 text-amber-700",
  INACTIVE: "bg-stone-100 text-stone-700",
  ARCHIVED: "bg-stone-100 text-stone-700",
  SUSPENDED: "bg-rose-50 text-rose-700",
  SPAM: "bg-rose-50 text-rose-700",
  WON: "bg-emerald-50 text-emerald-700"
};

export function AdminStatusBadge({ status }: { status: string }) {
  return <Badge className={cn("border-0", toneByStatus[status] ?? "bg-stone-100 text-stone-700")}>{status}</Badge>;
}
