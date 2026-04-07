import { createHash, randomBytes } from "node:crypto";

import { type GlobalRole, type TenantMemberRole } from "@prisma/client";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { env } from "@/lib/env";
import { db } from "@/server/db/client";

const SESSION_TTL_DAYS = 30;
const SESSION_ACTIVITY_UPDATE_MS = 15 * 60 * 1000;

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  globalRole: GlobalRole;
  isActive: boolean;
  lastLoginAt: Date | null;
  tenantMemberships: Array<{
    id: string;
    tenantId: string;
    role: TenantMemberRole;
    isDefault: boolean;
    tenant: {
      id: string;
      slug: string;
      status: string;
      deletedAt: Date | null;
      siteSettings: {
        siteName: string;
      } | null;
      domains: Array<{
        host: string;
        isPrimary: boolean;
        isActive: boolean;
      }>;
    };
  }>;
};

function hashToken(token: string) {
  return createHash("sha256").update(`${token}:${env.SESSION_SECRET}`).digest("hex");
}

function buildLoginRedirect(nextPath?: string) {
  const pathname = nextPath ? encodeURIComponent(nextPath) : encodeURIComponent("/admin/dashboard");
  return `/admin/login?next=${pathname}`;
}

export async function createSession(
  userId: string,
  options?: {
    tenantId?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
  }
) {
  const rawToken = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  await db.authSession.create({
    data: {
      userId,
      tenantId: options?.tenantId ?? null,
      tokenHash: hashToken(rawToken),
      expiresAt,
      ipAddress: options?.ipAddress ?? undefined,
      userAgent: options?.userAgent ?? undefined
    }
  });

  const cookieStore = await cookies();
  cookieStore.set(env.SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.APP_ENV === "production",
    path: "/",
    expires: expiresAt
  });
}

export async function getRawSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(env.SESSION_COOKIE_NAME)?.value ?? null;
}

export async function destroySession(rawToken?: string | null) {
  const token = rawToken ?? (await getRawSessionToken());

  if (token) {
    await db.authSession.updateMany({
      where: {
        tokenHash: hashToken(token),
        revokedAt: null
      },
      data: {
        revokedAt: new Date()
      }
    });
  }

  const cookieStore = await cookies();
  cookieStore.delete(env.SESSION_COOKIE_NAME);
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const rawToken = await getRawSessionToken();

  if (!rawToken) {
    return null;
  }

  const session = await db.authSession.findFirst({
    where: {
      tokenHash: hashToken(rawToken),
      revokedAt: null,
      expiresAt: {
        gt: new Date()
      }
    },
    include: {
      user: {
        include: {
          tenantMemberships: {
            where: {
              deletedAt: null,
              tenant: {
                deletedAt: null
              }
            },
            include: {
              tenant: {
                include: {
                  siteSettings: {
                    select: {
                      siteName: true
                    }
                  },
                  domains: {
                    where: {
                      deletedAt: null
                    },
                    select: {
                      host: true,
                      isPrimary: true,
                      isActive: true
                    }
                  }
                }
              }
            },
            orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }]
          }
        }
      }
    }
  });

  if (!session || session.user.deletedAt || !session.user.isActive) {
    return null;
  }

  if (Date.now() - session.lastSeenAt.getTime() >= SESSION_ACTIVITY_UPDATE_MS) {
    await db.authSession.update({
      where: {
        id: session.id
      },
      data: {
        lastSeenAt: new Date()
      }
    });
  }

  return session.user;
}

export async function requireAuth(nextPath = "/admin/dashboard") {
  const user = await getCurrentUser();

  if (!user) {
    redirect(buildLoginRedirect(nextPath));
  }

  return user;
}

export const requireUser = requireAuth;

export async function getRequestAuthContext() {
  const [user, headerStore] = await Promise.all([getCurrentUser(), headers()]);

  return {
    user,
    headerStore
  };
}
