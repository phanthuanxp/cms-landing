import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { MAX_EXCERPT_LENGTH } from "@/lib/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined, locale = "vi-VN") {
  if (!date) {
    return "N/A";
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(typeof date === "string" ? new Date(date) : date);
}

export function formatNumber(value: number, locale = "vi-VN") {
  return new Intl.NumberFormat(locale).format(value);
}

export function absoluteUrl(host: string, path = "/") {
  const normalizedHost = host.startsWith("http") ? host : `https://${host}`;
  return new URL(path, normalizedHost).toString();
}

export function canonicalUrl(host: string, path = "/") {
  return absoluteUrl(host, path);
}

export function compactText(value: string | null | undefined) {
  return value?.trim() ?? "";
}

export function stripHtml(input: string | null | undefined) {
  return compactText(input).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function createExcerpt(input: string | null | undefined, maxLength = MAX_EXCERPT_LENGTH) {
  const normalized = stripHtml(input);

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}

export function estimateReadingTimeMinutes(input: string | null | undefined, wordsPerMinute = 220) {
  const content = stripHtml(input);

  if (!content) {
    return 1;
  }

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export function parseSearchParamsValue(
  value: string | string[] | undefined,
  fallback = ""
) {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

export function parseEnumSearchParam<T extends string>(
  value: string | string[] | undefined,
  allowedValues: readonly T[]
) {
  const resolved = parseSearchParamsValue(value);
  return allowedValues.includes(resolved as T) ? (resolved as T) : undefined;
}
