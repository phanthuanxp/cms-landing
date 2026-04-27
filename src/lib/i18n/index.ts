import { cookies } from "next/headers";

import type { Locale, TranslationDictionary } from "./types";
import { vi } from "./translations/vi";
import { en } from "./translations/en";

export type { Locale, TranslationDictionary };

const dictionaries: Record<Locale, TranslationDictionary> = { vi, en };

export const SUPPORTED_LOCALES: Locale[] = ["vi", "en"];
export const DEFAULT_LOCALE: Locale = "vi";
export const LOCALE_COOKIE = "cms_locale";

export function isLocale(value: string): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}

export function getTranslations(locale: Locale): TranslationDictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

export function resolveLocale(raw: string | undefined | null): Locale {
  if (raw && isLocale(raw)) return raw;
  const short = raw?.split("-")[0];
  if (short && isLocale(short)) return short;
  return DEFAULT_LOCALE;
}

export async function getLocaleFromCookie(): Promise<Locale> {
  const jar = await cookies();
  const raw = jar.get(LOCALE_COOKIE)?.value;
  return resolveLocale(raw);
}

export function getLocaleLabel(locale: Locale): string {
  return locale === "vi" ? "Tieng Viet" : "English";
}
