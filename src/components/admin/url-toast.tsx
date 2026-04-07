"use client";

import { useSearchParams } from "next/navigation";

import { AdminToast } from "@/components/admin/toast";

export function AdminUrlToast() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success") ?? undefined;
  const error = searchParams.get("error") ?? undefined;

  return <AdminToast message={success ?? error} type={success ? "success" : error ? "error" : undefined} />;
}
