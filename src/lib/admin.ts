import { z } from "zod";

import { slugify } from "@/lib/slug";

export function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function getOptionalString(formData: FormData, key: string) {
  const value = getString(formData, key);
  return value.length > 0 ? value : undefined;
}

export function getBoolean(formData: FormData, key: string) {
  const value = formData.get(key);
  return value === "on" || value === "true" || value === "1";
}

export function getInt(formData: FormData, key: string, fallback = 0) {
  const value = Number.parseInt(getString(formData, key), 10);
  return Number.isNaN(value) ? fallback : value;
}

export function getSlug(formData: FormData, key: string, fallbackKey: string) {
  const explicit = getString(formData, key);

  if (explicit) {
    return slugify(explicit);
  }

  return slugify(getString(formData, fallbackKey));
}

export function parseJsonField<T>(value: string | undefined, schema: z.ZodType<T>) {
  if (!value) {
    return schema.parse(undefined);
  }

  return schema.parse(JSON.parse(value));
}

export function getJsonField<T>(formData: FormData, key: string, schema: z.ZodType<T>) {
  return parseJsonField(getOptionalString(formData, key), schema);
}

export function formatZodError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Du lieu khong hop le";
}

export function buildAdminPath(
  pathname: string,
  params: Record<string, string | number | undefined | null>
) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}
