"use server";

import { TenantMemberRole } from "@prisma/client";
import { redirect } from "next/navigation";

import { requireRole } from "@/server/auth/permissions";

export async function updateLeadStatusAction() {
  await requireRole([TenantMemberRole.TENANT_ADMIN, TenantMemberRole.EDITOR], "/admin/leads");
  redirect("/admin/leads?error=Lead-status-updates-are-disabled-in-this-release");
}
