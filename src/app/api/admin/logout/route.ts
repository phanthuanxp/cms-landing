import { AuditAction } from "@prisma/client";
import { NextResponse } from "next/server";

import { getCurrentUser } from "@/server/auth/session";
import { destroySession } from "@/server/auth/session";
import { createAuditLog } from "@/server/services/audit";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  await destroySession();

  if (user) {
    await createAuditLog({
      tenantId: user.tenantMemberships[0]?.tenantId ?? null,
      actorUserId: user.id,
      action: AuditAction.LOGOUT,
      entityType: "AuthSession",
      entityId: user.id,
      summary: "Admin user logged out",
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent")
    });
  }

  return NextResponse.redirect(new URL("/admin/login", request.url));
}
