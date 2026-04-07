"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="vi">
      <body className="bg-stone-100">
        <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16">
          <Card className="w-full rounded-[2rem] border-stone-200 shadow-sm">
            <CardHeader className="space-y-4">
              <Badge className="w-fit bg-amber-50 text-amber-800">
                <AlertTriangle className="mr-1 h-3.5 w-3.5" />
                500
              </Badge>
              <CardTitle>Da co loi xay ra trong qua trinh tai trang</CardTitle>
              <CardDescription>
                He thong gap loi khong mong muon. Ban co the thu tai lai, hoac quay lai sau trong giay lat.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-stone-600">
              {error.digest ? <p>Ma loi: {error.digest}</p> : null}
              <Button onClick={reset}>Thu tai lai</Button>
            </CardContent>
          </Card>
        </main>
      </body>
    </html>
  );
}
