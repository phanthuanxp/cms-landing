"use server";

import { MenuLocation, TenantMemberRole } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { buildAdminPath, formatZodError, getOptionalString, getSlug, getString, parseJsonField } from "@/lib/admin";
import { requireTenantAccess } from "@/server/auth/permissions";
import { db } from "@/server/db/client";
import { menuItemInputSchema } from "@/types/cms";

const menuItemsSchema = z.array(menuItemInputSchema).default([]);

const menuSchema = z.object({
  menuId: z.string().optional(),
  tenantId: z.string().min(1),
  name: z.string().min(2, "Ten menu bat buoc nhap."),
  slug: z.string().min(1, "Slug menu bat buoc nhap."),
  location: z.nativeEnum(MenuLocation),
  description: z.string().optional(),
  items: menuItemsSchema
});

function menuPath(tenantId: string, params?: Record<string, string | undefined>) {
  return buildAdminPath("/admin/menus", { tenantId, ...params });
}

async function getTenantMenuOrThrow(tenantId: string, menuId: string) {
  const menu = await db.menu.findFirst({
    where: {
      id: menuId,
      tenantId,
      deletedAt: null
    },
    select: {
      id: true
    }
  });

  if (!menu) {
    throw new Error("Menu-khong-thuoc-tenant-hien-tai");
  }

  return menu;
}

export async function upsertMenuAction(formData: FormData) {
  const tenantId = getString(formData, "tenantId");
  const access = await requireTenantAccess(tenantId, {
    roles: [TenantMemberRole.TENANT_ADMIN, TenantMemberRole.EDITOR],
    nextPath: `/admin/menus?tenantId=${tenantId}`
  });

  let parsedItems;

  try {
    parsedItems = parseJsonField(getOptionalString(formData, "items"), menuItemsSchema);
  } catch {
    redirect(menuPath(tenantId, { error: "Menu-items-JSON-khong-hop-le" }));
  }

  const parsed = menuSchema.safeParse({
    menuId: getOptionalString(formData, "menuId"),
    tenantId,
    name: getString(formData, "name"),
    slug: getSlug(formData, "slug", "name"),
    location: getString(formData, "location"),
    description: getOptionalString(formData, "description"),
    items: parsedItems
  });

  if (!parsed.success) {
    redirect(menuPath(tenantId, { error: formatZodError(parsed.error) }));
  }

  try {
    const menu = await db.$transaction(async (tx) => {
      const existingMenu = parsed.data.menuId
        ? await getTenantMenuOrThrow(tenantId, parsed.data.menuId)
        : null;

      const upsertedMenu = parsed.data.menuId
        ? await tx.menu.update({
            where: {
              id: existingMenu!.id
            },
            data: {
              name: parsed.data.name,
              slug: parsed.data.slug,
              location: parsed.data.location,
              description: parsed.data.description,
              updatedById: access.user.id,
              deletedAt: null,
              isActive: true
            }
          })
        : await tx.menu.create({
            data: {
              tenantId,
              name: parsed.data.name,
              slug: parsed.data.slug,
              location: parsed.data.location,
              description: parsed.data.description,
              isActive: true,
              createdById: access.user.id,
              updatedById: access.user.id
            }
          });

      await tx.menuItem.deleteMany({
        where: {
          menuId: upsertedMenu.id
        }
      });

      for (const item of parsed.data.items) {
        const parent = await tx.menuItem.create({
          data: {
            tenantId,
            menuId: upsertedMenu.id,
            label: item.label,
            href: item.href,
            target: item.target,
            sortOrder: item.sortOrder,
            isActive: true,
            createdById: access.user.id,
            updatedById: access.user.id
          }
        });

        for (const child of item.children ?? []) {
          await tx.menuItem.create({
            data: {
              tenantId,
              menuId: upsertedMenu.id,
              parentId: parent.id,
              label: child.label,
              href: child.href,
              target: child.target,
              sortOrder: child.sortOrder,
              isActive: true,
              createdById: access.user.id,
              updatedById: access.user.id
            }
          });
        }
      }

      return upsertedMenu;
    });

    revalidateTag("public-content", "max");
    revalidatePath("/admin/menus");
    redirect(menuPath(tenantId, { success: "Da-luu-menu", edit: menu.id }));
  } catch (error) {
    redirect(menuPath(tenantId, { error: error instanceof Error ? error.message : "Khong-the-luu-menu" }));
  }
}

export async function softDeleteMenuAction(formData: FormData) {
  const tenantId = getString(formData, "tenantId");
  const menuId = getString(formData, "menuId");
  const access = await requireTenantAccess(tenantId, {
    roles: [TenantMemberRole.TENANT_ADMIN, TenantMemberRole.EDITOR],
    nextPath: `/admin/menus?tenantId=${tenantId}`
  });

  await db.menu.update({
    where: {
      id: (await getTenantMenuOrThrow(tenantId, menuId)).id
    },
    data: {
      deletedAt: new Date(),
      updatedById: access.user.id
    }
  });

  revalidateTag("public-content", "max");
  revalidatePath("/admin/menus");
  redirect(menuPath(tenantId, { success: "Da-xoa-mem-menu" }));
}
