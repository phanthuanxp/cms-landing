"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function getClientLocale(): "vi" | "en" {
  if (typeof document === "undefined") return "vi";
  const match = document.cookie.match(/cms_locale=(vi|en)/);
  return (match?.[1] as "vi" | "en") ?? "vi";
}

const errorText = {
  vi: {
    title: "Da co loi xay ra trong qua trinh tai trang",
    description: "He thong gap loi khong mong muon. Ban co the thu tai lai, hoac quay lai sau trong giay lat.",
    errorCode: "Ma loi:",
    retry: "Thu tai lai"
  },
  en: {
    title: "An error occurred while loading the page",
    description: "The system encountered an unexpected error. You can try reloading, or come back later.",
    errorCode: "Error code:",
    retry: "Try again"
  }
};

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = getClientLocale();
  const t = errorText[locale];

  return (
    <html lang={locale}>
      <body className="bg-stone-100">
        <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16">
          <Card className="w-full rounded-[2rem] border-stone-200 shadow-sm">
            <CardHeader className="space-y-4">
              <Badge className="w-fit bg-amber-50 text-amber-800">
                <AlertTriangle className="mr-1 h-3.5 w-3.5" />
                500
              </Badge>
              <CardTitle>{t.title}</CardTitle>
              <CardDescription>{t.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-stone-600">
              {error.digest ? <p>{t.errorCode} {error.digest}</p> : null}
              <Button onClick={reset}>{t.retry}</Button>
            </CardContent>
          </Card>
        </main>
      </body>
    </html>
  );
}
