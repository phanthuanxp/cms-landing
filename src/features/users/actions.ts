"use server";

import bcrypt from "bcryptjs";
import { GlobalRole, TenantMemberRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { buildAdminPath, formatZodError, getBoolean, getOptionalString, getString } from "@/lib/admin";
import { requireRole } from "@/server/auth/permissions";
import { db } from "@/server/db/client";

const userSchema = z.object({
  userId: z.string().optional(),
  name: z.string().min(2, "Ten user bat buoc nhap."),
  email: z.string().email("Email khong hop le."),
  password: z.string().min(8, "Password toi thieu 8 ky tu.").optional(),
  globalRole: z.nativeEnum(GlobalRole),
  isActive: z.boolean(),
  tenantId: z.string().optional(),
  tenantRole: z.nativeEnum(TenantMemberRole).optional()
});

function usersPath(params?: Record<string, string | undefined>) {
  return buildAdminPath("/admin/users", params ?? {});
}

export async function upsertUserAction(formData: FormData) {
  const actor = await requireRole(GlobalRole.SUPER_ADMIN, "/admin/users");
  const rawPassword = getOptionalString(formData, "password");

  const parsed = userSchema.safeParse({
    userId: getOptionalString(formData, "userId"),
    name: getString(formData, "name"),
    email: getString(formData, "email"),
    password: rawPassword,
    globalRole: getString(formData, "globalRole"),
    isActive: getBoolean(formData, "isActive"),
    tenantId: getOptionalString(formData, "tenantId"),
    tenantRole: getOptionalString(formData, "tenantRole")
  });

  if (!parsed.success) {
    redirect(usersPath({ error: formatZodError(parsed.error) }));
  }

  if (!parsed.data.userId && !parsed.data.password) {
    redirect(usersPath({ error: "Password-bat-buoc-khi-tao-user-moi" }));
  }

  try {
    const passwordHash = parsed.data.password ? await bcrypt.hash(parsed.data.password, 10) : null;

    const user = await db.$transaction(async (tx) => {
      const savedUser = parsed.data.userId
        ? await tx.user.update({
            where: {
              id: parsed.data.userId
            },
            data: {
              name: parsed.data.name,
              email: parsed.data.email,
              globalRole: parsed.data.globalRole,
              isActive: parsed.data.isActive,
              ...(passwordHash ? { passwordHash } : {}),
              updatedById: actor.id,
              deletedAt: null
            }
          })
        : await tx.user.create({
            data: {
              name: parsed.data.name,
              email: parsed.data.email,
              passwordHash: passwordHash ?? "",
              globalRole: parsed.data.globalRole,
              isActive: parsed.data.isActive,
              createdById: actor.id,
              updatedById: actor.id
            }
          });

      if (parsed.data.tenantId && parsed.data.tenantRole) {
        await tx.tenantMembership.upsert({
          where: {
            tenantId_userId: {
              tenantId: parsed.data.tenantId,
              userId: savedUser.id
            }
          },
          update: {
            role: parsed.data.tenantRole,
            deletedAt: null,
            updatedById: actor.id
          },
          create: {
            tenantId: parsed.data.tenantId,
            userId: savedUser.id,
            role: parsed.data.tenantRole,
            isDefault: false,
            createdById: actor.id,
            updatedById: actor.id
          }
        });
      }

      return savedUser;
    });

    revalidatePath("/admin/users");
    redirect(usersPath({ success: "Da-luu-user", edit: user.id }));
  } catch (error) {
    redirect(usersPath({ error: error instanceof Error ? error.message : "Khong-the-luu-user" }));
  }
}

export async function removeTenantMembershipAction(formData: FormData) {
  await requireRole(GlobalRole.SUPER_ADMIN, "/admin/users");
  const membershipId = getString(formData, "membershipId");

  await db.tenantMembership.update({
    where: {
      id: membershipId
    },
    data: {
      deletedAt: new Date()
    }
  });

  revalidatePath("/admin/users");
  redirect(usersPath({ success: "Da-go-membership" }));
}

export async function softDeleteUserAction(formData: FormData) {
  const actor = await requireRole(GlobalRole.SUPER_ADMIN, "/admin/users");
  const userId = getString(formData, "userId");

  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: {
        id: userId
      },
      data: {
        deletedAt: new Date(),
        isActive: false,
        updatedById: actor.id
      }
    });

    await tx.authSession.updateMany({
      where: {
        userId,
        revokedAt: null
      },
      data: {
        revokedAt: new Date()
      }
    });
  });

  revalidatePath("/admin/users");
  redirect(usersPath({ success: "Da-xoa-mem-user" }));
}
