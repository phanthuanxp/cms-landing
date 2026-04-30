import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLocaleFromCookie, getTranslations } from "@/lib/i18n";
import { getRequestHost } from "@/server/tenant/request";

export default async function NotFound() {
  const host = await getRequestHost();
  const locale = await getLocaleFromCookie();
  const t = getTranslations(locale);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16">
      <Card className="w-full">
        <CardHeader className="space-y-3">
          <Badge className="w-fit bg-rose-50 text-rose-700">404</Badge>
          <CardTitle>{t.errors.notFoundTitle}</CardTitle>
          <CardDescription>
            Hostname <span className="font-medium text-stone-900">{host}</span> {t.errors.notFoundDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-7 text-stone-600">
          <p>{t.errors.notFoundHelp}</p>
          <Button asChild>
            <Link href="/">{t.common.goHome}</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
