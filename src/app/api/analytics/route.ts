import { TenantStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/server/db/client";

const eventSchema = z.object({
  tenantId: z.string().min(1),
  siteId: z.string().optional(),
  eventName: z.string().min(1).max(100),
  path: z.string().max(2000).optional(),
  locale: z.string().max(10).optional(),
  referrer: z.string().max(2000).optional(),
  utmSource: z.string().max(200).nullable().optional(),
  utmMedium: z.string().max(200).nullable().optional(),
  utmCampaign: z.string().max(200).nullable().optional(),
  utmTerm: z.string().max(200).nullable().optional(),
  utmContent: z.string().max(200).nullable().optional(),
  gclid: z.string().max(200).nullable().optional(),
  metadata: z.record(z.unknown()).optional()
});

export async function POST(request: Request) {
  try {
    const payload = eventSchema.parse(await request.json());

    const tenant = await db.tenant.findFirst({
      where: {
        id: payload.tenantId,
        deletedAt: null,
        status: TenantStatus.ACTIVE
      },
      select: { id: true }
    });

    if (!tenant) {
      return NextResponse.json({ success: false }, { status: 404 });
    }

    await db.analyticsEvent.create({
      data: {
        tenantId: payload.tenantId,
        siteId: payload.siteId,
        eventName: payload.eventName,
        path: payload.path,
        locale: payload.locale,
        referrer: payload.referrer,
        utmSource: payload.utmSource ?? null,
        utmMedium: payload.utmMedium ?? null,
        utmCampaign: payload.utmCampaign ?? null,
        utmTerm: payload.utmTerm ?? null,
        utmContent: payload.utmContent ?? null,
        gclid: payload.gclid ?? null,
        metadata: payload.metadata ? (payload.metadata as Record<string, string>) : undefined,
        ipAddress: request.headers.get("x-forwarded-for"),
        userAgent: request.headers.get("user-agent")
      }
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
