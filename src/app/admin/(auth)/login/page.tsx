import { redirect } from "next/navigation";
import { z } from "zod";

import { loginAction } from "@/features/auth/actions";
import { getCurrentUser } from "@/server/auth/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const loginSearchParamsSchema = z.object({
  next: z.preprocess((value) => {
    const raw = Array.isArray(value) ? value[0] : value;
    if (typeof raw !== "string" || !raw.startsWith("/admin")) {
      return "/admin/dashboard";
    }

    return raw;
  }, z.string()),
  error: z.preprocess((value) => {
    const raw = Array.isArray(value) ? value[0] : value;
    return typeof raw === "string" ? raw : "";
  }, z.string())
});

export default async function LoginPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  const params = loginSearchParamsSchema.parse(await searchParams);
  const nextPath = params.next;

  if (user) {
    redirect(nextPath);
  }

  const error = params.error ? params.error.replace(/-/g, " ") : null;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(28,25,23,0.08),transparent_32%)]" />
      <Card className="relative w-full max-w-md border-stone-200/80 bg-white/95 shadow-2xl">
        <CardHeader>
          <CardTitle>Dang nhap admin CMS</CardTitle>
          <CardDescription>Secure cookie session, email/password va role-based access control.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
          <form action={loginAction} className="space-y-4">
            <input name="next" type="hidden" value={nextPath} />
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" placeholder="superadmin@example.com" type="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" placeholder="Admin@123" type="password" />
            </div>
            <Button className="w-full" type="submit">
              Dang nhap
            </Button>
          </form>
          <div className="rounded-xl bg-stone-50 p-4 text-xs leading-6 text-stone-500">
            Test accounts se duoc seed san cho `super_admin`, `tenant_admin`, va `editor`.
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
