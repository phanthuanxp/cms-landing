"use server";

import { AuditAction } from "@prisma/client";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createSession } from "@/server/auth/session";
import { db } from "@/server/db/client";
import { createAuditLog } from "@/server/services/audit";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  next: z
    .string()
    .optional()
    .transform((value) => (value && value.startsWith("/admin") ? value : "/admin/dashboard"))
});

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next")
  });

  if (!parsed.success) {
    redirect("/admin/login?error=Thong-tin-dang-nhap-khong-hop-le");
  }

  const user = await db.user.findUnique({
    where: {
      email: parsed.data.email
    },
    include: {
      tenantMemberships: {
        where: {
          deletedAt: null,
          tenant: {
            deletedAt: null
          }
        },
        orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }]
      }
    }
  });

  if (!user || user.deletedAt || !user.isActive) {
    redirect("/admin/login?error=Tai-khoan-khong-ton-tai-hoac-bi-khoa");
  }

  const matched = await bcrypt.compare(parsed.data.password, user.passwordHash);

  if (!matched) {
    redirect("/admin/login?error=Sai-email-hoac-mat-khau");
  }

  const headerStore = await headers();
  const defaultTenantId = user.tenantMemberships[0]?.tenantId ?? null;

  await createSession(user.id, {
    tenantId: defaultTenantId,
    ipAddress: headerStore.get("x-forwarded-for"),
    userAgent: headerStore.get("user-agent")
  });

  await db.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });

  await createAuditLog({
    tenantId: defaultTenantId,
    actorUserId: user.id,
    action: AuditAction.LOGIN,
    entityType: "AuthSession",
    entityId: user.id,
    summary: "Admin user logged in",
    ipAddress: headerStore.get("x-forwarded-for"),
    userAgent: headerStore.get("user-agent")
  });

  redirect(parsed.data.next);
}
