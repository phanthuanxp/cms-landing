import { AuditAction, type Prisma } from "@prisma/client";

import { db } from "@/server/db/client";

type AuditInput = {
  tenantId?: string | null;
  actorUserId?: string | null;
  action: AuditAction;
  entityType: string;
  entityId: string;
  summary?: string;
  before?: Prisma.InputJsonValue | null;
  after?: Prisma.InputJsonValue | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function createAuditLog(input: AuditInput) {
  return db.auditLog.create({
    data: {
      tenantId: input.tenantId ?? null,
      actorUserId: input.actorUserId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      summary: input.summary,
      before: input.before ?? undefined,
      after: input.after ?? undefined,
      ipAddress: input.ipAddress ?? undefined,
      userAgent: input.userAgent ?? undefined
    }
  });
}
