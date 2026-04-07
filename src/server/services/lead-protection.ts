import { LeadStatus } from "@prisma/client";

import { CONTACT_FORM_MIN_SUBMIT_MS, LEAD_DUPLICATE_WINDOW_MINUTES } from "@/lib/constants";
import { compactText } from "@/lib/utils";
import { db } from "@/server/db/client";

export type LeadProtectionInput = {
  tenantId: string;
  email?: string | null;
  phone?: string | null;
  message?: string | null;
  company?: string | null;
  honeypot?: string | null;
  startedAt?: number | null;
};

export async function evaluateLeadProtection(input: LeadProtectionInput) {
  const honeypotFilled = compactText(input.honeypot);
  const now = Date.now();
  const elapsed = input.startedAt ? now - input.startedAt : null;
  const suspiciousLinks = compactText(input.message).match(/https?:\/\//gi)?.length ?? 0;
  const identifiers = [
    ...(input.email ? [{ email: input.email }] : []),
    ...(input.phone ? [{ phone: input.phone }] : [])
  ];

  if (honeypotFilled) {
    return {
      drop: true,
      spam: true,
      reason: "honeypot-triggered",
      status: LeadStatus.SPAM
    } as const;
  }

  if (elapsed !== null && elapsed < CONTACT_FORM_MIN_SUBMIT_MS) {
    return {
      drop: true,
      spam: true,
      reason: "submitted-too-fast",
      status: LeadStatus.SPAM
    } as const;
  }

  const duplicateThreshold = new Date(now - LEAD_DUPLICATE_WINDOW_MINUTES * 60 * 1000);
  const duplicate = identifiers.length
    ? await db.lead.findFirst({
        where: {
          tenantId: input.tenantId,
          deletedAt: null,
          createdAt: {
            gte: duplicateThreshold
          },
          OR: identifiers
        },
        select: {
          id: true
        }
      })
    : null;

  if (duplicate) {
    return {
      drop: true,
      spam: false,
      reason: "duplicate-recent-lead",
      status: LeadStatus.NEW
    } as const;
  }

  return {
    drop: false,
    spam: suspiciousLinks >= 2,
    reason: suspiciousLinks >= 2 ? "multiple-links-detected" : "accepted",
    status: suspiciousLinks >= 2 ? LeadStatus.SPAM : LeadStatus.NEW
  } as const;
}
