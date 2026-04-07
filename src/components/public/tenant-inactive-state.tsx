import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type TenantInactiveStateProps = {
  host: string;
  tenantName: string;
};

export function TenantInactiveState({ host, tenantName }: TenantInactiveStateProps) {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16">
      <Card className="w-full border-amber-200 bg-amber-50/60 shadow-sm">
        <CardHeader className="space-y-3">
          <Badge className="w-fit bg-amber-100 text-amber-800">Tenant inactive</Badge>
          <CardTitle className="text-2xl text-stone-950">{tenantName} tam thoi khong hoat dong</CardTitle>
          <CardDescription className="text-base leading-7 text-stone-600">
            Domain <span className="font-medium text-stone-900">{host}</span> da duoc gan cho tenant nay, nhung website
            hien dang o trang thai tam dung hoac chua san sang public.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-7 text-stone-600">
          <p>Neu ban la quan tri vien, hay kiem tra lai trang thai tenant trong admin CMS.</p>
          <p>Neu ban la khach truy cap, vui long quay lai sau hoac lien he don vi van hanh website.</p>
        </CardContent>
      </Card>
    </main>
  );
}
