"use server";

import { PageBlockType, PageType, PublishStatus, TenantMemberRole } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { buildAdminPath, formatZodError, getOptionalString, getSlug, getString } from "@/lib/admin";
import { requireTenantAccess } from "@/server/auth/permissions";
import { db } from "@/server/db/client";
import { pageBlocksSchema } from "@/types/cms";

const pageSchema = z.object({
  pageId: z.string().optional(),
  tenantId: z.string().min(1),
  title: z.string().min(2, "Tieu de page bat buoc nhap."),
  slug: z.string().min(1, "Slug page bat buoc nhap."),
  summary: z.string().optional(),
  pageType: z.nativeEnum(PageType),
  status: z.nativeEnum(PublishStatus),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  ogImageUrl: z.string().url("OG image URL khong hop le.").optional().or(z.literal("")),
  blocks: pageBlocksSchema
});

function toBlockType(type: z.infer<typeof pageBlocksSchema>[number]["type"]) {
  switch (type) {
    case "hero":
      return PageBlockType.HERO;
    case "feature-list":
      return PageBlockType.FEATURE_LIST;
    case "rich-text":
      return PageBlockType.RICH_TEXT;
    case "image":
      return PageBlockType.IMAGE;
    case "cta":
      return PageBlockType.CTA;
    case "testimonials":
      return PageBlockType.TESTIMONIALS;
    case "faq":
      return PageBlockType.FAQ;
    case "contact-form":
      return PageBlockType.CONTACT_FORM;
  }
}

function pagesPath(tenantId: string, params?: Record<string, string | undefined>) {
  return buildAdminPath("/admin/pages", { tenantId, ...params });
}

async function getTenantPageOrThrow(tenantId: string, pageId: string) {
  const page = await db.page.findFirst({
    where: {
      id: pageId,
      tenantId,
      deletedAt: null
    },
    select: {
      id: true,
      publishedAt: true
    }
  });

  if (!page) {
    throw new Error("Page-khong-thuoc-tenant-hien-tai");
  }

  return page;
}

export async function upsertLandingPageAction(formData: FormData) {
  const tenantId = getString(formData, "tenantId");
  const access = await requireTenantAccess(tenantId, {
    roles: [TenantMemberRole.TENANT_ADMIN, TenantMemberRole.EDITOR],
    nextPath: `/admin/pages?tenantId=${tenantId}`
  });

  let blocks;

  try {
    blocks = JSON.parse(getString(formData, "blocks") || "[]");
  } catch {
    redirect(pagesPath(tenantId, { error: "Blocks-JSON-khong-hop-le" }));
  }

  const parsed = pageSchema.safeParse({
    pageId: getOptionalString(formData, "pageId"),
    tenantId,
    title: getString(formData, "title"),
    slug: getSlug(formData, "slug", "title"),
    summary: getOptionalString(formData, "summary"),
    pageType: getString(formData, "pageType"),
    status: getString(formData, "status"),
    seoTitle: getOptionalString(formData, "seoTitle"),
    seoDescription: getOptionalString(formData, "seoDescription"),
    ogImageUrl: getOptionalString(formData, "ogImageUrl") ?? "",
    blocks
  });

  if (!parsed.success) {
    redirect(pagesPath(tenantId, { error: formatZodError(parsed.error) }));
  }

  try {
    const page = await db.$transaction(async (tx) => {
      const existing = parsed.data.pageId
        ? await getTenantPageOrThrow(tenantId, parsed.data.pageId)
        : null;

      const savedPage = parsed.data.pageId
        ? await tx.page.update({
            where: {
              id: parsed.data.pageId
            },
            data: {
              title: parsed.data.title,
              slug: parsed.data.slug,
              summary: parsed.data.summary,
              pageType: parsed.data.pageType,
              status: parsed.data.status,
              seoTitle: parsed.data.seoTitle,
              seoDescription: parsed.data.seoDescription,
              ogImageUrl: parsed.data.ogImageUrl || null,
              publishedAt:
                parsed.data.status === PublishStatus.PUBLISHED
                  ? existing?.publishedAt ?? new Date()
                  : null,
              updatedById: access.user.id,
              deletedAt: null
            }
          })
        : await tx.page.create({
            data: {
              tenantId,
              title: parsed.data.title,
              slug: parsed.data.slug,
              summary: parsed.data.summary,
              pageType: parsed.data.pageType,
              status: parsed.data.status,
              seoTitle: parsed.data.seoTitle,
              seoDescription: parsed.data.seoDescription,
              ogImageUrl: parsed.data.ogImageUrl || null,
              publishedAt: parsed.data.status === PublishStatus.PUBLISHED ? new Date() : null,
              createdById: access.user.id,
              updatedById: access.user.id
            }
          });

      await tx.pageBlock.deleteMany({
        where: {
          pageId: savedPage.id
        }
      });

      await tx.pageBlock.createMany({
        data: parsed.data.blocks.map((block, index) => ({
          tenantId,
          pageId: savedPage.id,
          blockType: toBlockType(block.type),
          position: index + 1,
          payload: block,
          createdById: access.user.id,
          updatedById: access.user.id
        }))
      });

      return savedPage;
    });

    revalidateTag("public-content", "max");
    revalidatePath("/admin/pages");
    redirect(pagesPath(tenantId, { success: "Da-luu-page", edit: page.id }));
  } catch (error) {
    redirect(pagesPath(tenantId, { error: error instanceof Error ? error.message : "Khong-the-luu-page" }));
  }
}

export async function softDeleteLandingPageAction(formData: FormData) {
  const tenantId = getString(formData, "tenantId");
  const pageId = getString(formData, "pageId");
  const access = await requireTenantAccess(tenantId, {
    roles: [TenantMemberRole.TENANT_ADMIN, TenantMemberRole.EDITOR],
    nextPath: `/admin/pages?tenantId=${tenantId}`
  });

  await db.page.update({
    where: {
      id: (await getTenantPageOrThrow(tenantId, pageId)).id
    },
    data: {
      deletedAt: new Date(),
      updatedById: access.user.id
    }
  });

  revalidateTag("public-content", "max");
  revalidatePath("/admin/pages");
  redirect(pagesPath(tenantId, { success: "Da-xoa-mem-page" }));
}
