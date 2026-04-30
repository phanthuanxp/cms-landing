import { AuditAction, LeadStatus, TenantStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { createExcerpt } from "@/lib/utils";
import { db } from "@/server/db/client";
import { createAuditLog } from "@/server/services/audit";
import { evaluateLeadProtection } from "@/server/services/lead-protection";

const contactSchema = z.object({
  tenantId: z.string().min(1),
  pageId: z.string().optional(),
  sourcePath: z.string().optional(),
  sourceHost: z.string().optional(),
  honeypot: z.string().optional(),
  startedAt: z.number().int().optional(),
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(8),
  company: z.string().optional(),
  message: z.string().max(2000).optional(),
  formType: z.string().optional(),
  utmSource: z.string().max(200).nullable().optional(),
  utmMedium: z.string().max(200).nullable().optional(),
  utmCampaign: z.string().max(200).nullable().optional(),
  utmTerm: z.string().max(200).nullable().optional(),
  utmContent: z.string().max(200).nullable().optional(),
  gclid: z.string().max(200).nullable().optional(),
  gbraid: z.string().max(200).nullable().optional(),
  wbraid: z.string().max(200).nullable().optional(),
  fbclid: z.string().max(200).nullable().optional(),
  ttclid: z.string().max(200).nullable().optional(),
  landingPage: z.string().max(2000).nullable().optional(),
  conversionPage: z.string().max(2000).nullable().optional(),
  locale: z.string().max(10).nullable().optional(),
  deviceType: z.string().max(50).nullable().optional()
});

export async function POST(request: Request) {
  try {
    const payload = contactSchema.parse(await request.json());
    const sourceHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? payload.sourceHost;
    const [tenant, page, protection] = await Promise.all([
      db.tenant.findFirst({
        where: {
          id: payload.tenantId,
          deletedAt: null,
          status: TenantStatus.ACTIVE
        },
        select: {
          id: true
        }
      }),
      payload.pageId
        ? db.page.findFirst({
            where: {
              id: payload.pageId,
              tenantId: payload.tenantId,
              deletedAt: null
            },
            select: {
              id: true
            }
          })
        : Promise.resolve(null),
      evaluateLeadProtection({
        tenantId: payload.tenantId,
        email: payload.email,
        phone: payload.phone,
        message: payload.message,
        company: payload.company,
        honeypot: payload.honeypot,
        startedAt: payload.startedAt
      })
    ]);

    if (!tenant) {
      return NextResponse.json({ success: false, error: "Tenant khong hop le" }, { status: 404 });
    }

    if (payload.pageId && !page) {
      return NextResponse.json({ success: false, error: "Page khong hop le" }, { status: 404 });
    }

    if (protection.drop) {
      await createAuditLog({
        tenantId: payload.tenantId,
        action: AuditAction.CREATE,
        entityType: "Lead",
        entityId: `${payload.tenantId}:${payload.phone ?? payload.email ?? "anonymous"}`,
        summary: `Lead dropped by protection: ${protection.reason}`,
        ipAddress: request.headers.get("x-forwarded-for"),
        userAgent: request.headers.get("user-agent"),
        after: {
          sourcePath: payload.sourcePath,
          sourceHost
        }
      });

      return NextResponse.json({ success: true });
    }

    const lead = await db.lead.create({
      data: {
        tenantId: payload.tenantId,
        pageId: page?.id,
        sourcePath: payload.sourcePath,
        sourceHost,
        name: payload.name,
        email: payload.email || undefined,
        phone: payload.phone,
        company: payload.company,
        message: payload.message,
        formType: payload.formType,
        status: protection.status ?? LeadStatus.NEW,
        utmSource: payload.utmSource ?? null,
        utmMedium: payload.utmMedium ?? null,
        utmCampaign: payload.utmCampaign ?? null,
        utmTerm: payload.utmTerm ?? null,
        utmContent: payload.utmContent ?? null,
        gclid: payload.gclid ?? null,
        gbraid: payload.gbraid ?? null,
        wbraid: payload.wbraid ?? null,
        fbclid: payload.fbclid ?? null,
        ttclid: payload.ttclid ?? null,
        landingPage: payload.landingPage ?? null,
        conversionPage: payload.conversionPage ?? null,
        locale: payload.locale ?? null,
        deviceType: payload.deviceType ?? null,
        conversionEventType: payload.formType ? "lead_submit" : null,
        metadata: {
          source: "public-contact-form",
          protectionReason: protection.reason,
          messagePreview: createExcerpt(payload.message)
        }
      }
    });

    await createAuditLog({
      tenantId: payload.tenantId,
      action: AuditAction.CREATE,
      entityType: "Lead",
      entityId: lead.id,
      summary: protection.spam ? "Lead stored as spam after protection checks" : "Lead created from public contact form",
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
        after: {
          sourcePath: payload.sourcePath,
          sourceHost,
          status: lead.status
        }
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.issues[0]?.message ?? "Yeu cau lien he khong hop le"
        : "Khong the gui yeu cau lien he";

    return NextResponse.json(
      {
        success: false,
        error: message
      },
      { status: 400 }
    );
  }
}
