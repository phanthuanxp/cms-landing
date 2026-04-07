import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getRequestHost } from "@/server/tenant/request";

export default async function NotFound() {
  const host = await getRequestHost();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16">
      <Card className="w-full">
        <CardHeader className="space-y-3">
          <Badge className="w-fit bg-rose-50 text-rose-700">404</Badge>
          <CardTitle>Khong tim thay tenant hoac noi dung</CardTitle>
          <CardDescription>
            Hostname <span className="font-medium text-stone-900">{host}</span> chua duoc gan tenant, hoac duong dan ban
            truy cap khong ton tai.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-7 text-stone-600">
          <p>Hay kiem tra lai domain trong bang TenantDomain, hoac mo mot slug/page hop le cua tenant hien tai.</p>
          <Button asChild>
            <Link href="/">Quay ve trang chu</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
