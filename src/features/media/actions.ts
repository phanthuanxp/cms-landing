"use server";

import { TenantMemberRole } from "@prisma/client";
import { redirect } from "next/navigation";

import { requireRole } from "@/server/auth/permissions";

export async function upsertMediaAction() {
  await requireRole([TenantMemberRole.TENANT_ADMIN, TenantMemberRole.EDITOR], "/admin/media");
  redirect("/admin/media?error=Media-manager-is-read-only-in-this-release");
}

export async function softDeleteMediaAction() {
  await requireRole([TenantMemberRole.TENANT_ADMIN, TenantMemberRole.EDITOR], "/admin/media");
  redirect("/admin/media?error=Media-delete-is-disabled-in-this-release");
}
