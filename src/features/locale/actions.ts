"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { isLocale, LOCALE_COOKIE, type Locale } from "@/lib/i18n";

export async function switchLocaleAction(formData: FormData) {
  const locale = formData.get("locale");
  const currentPath = formData.get("currentPath");

  if (typeof locale === "string" && isLocale(locale)) {
    const jar = await cookies();
    jar.set(LOCALE_COOKIE, locale as Locale, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365
    });
  }

  const redirectTo = typeof currentPath === "string" && currentPath.startsWith("/")
    ? currentPath
    : "/admin/dashboard";

  redirect(redirectTo);
}
