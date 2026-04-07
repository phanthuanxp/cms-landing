import { Inbox } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <Inbox className="h-8 w-8 text-stone-400" />
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-stone-900">{title}</h3>
          <p className="text-sm text-stone-500">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
