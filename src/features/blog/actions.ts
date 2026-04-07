"use server";

import { PublishStatus, TenantMemberRole } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { buildAdminPath, formatZodError, getOptionalString, getSlug, getString } from "@/lib/admin";
import { slugify } from "@/lib/slug";
import { requireTenantAccess } from "@/server/auth/permissions";
import { db } from "@/server/db/client";

const categorySchema = z.object({
  categoryId: z.string().optional(),
  tenantId: z.string().min(1),
  name: z.string().min(2, "Ten category bat buoc nhap."),
  slug: z.string().min(1, "Slug category bat buoc nhap."),
  description: z.string().optional()
});

const postSchema = z.object({
  postId: z.string().optional(),
  tenantId: z.string().min(1),
  title: z.string().min(2, "Tieu de bai viet bat buoc nhap."),
  slug: z.string().min(1, "Slug bai viet bat buoc nhap."),
  excerpt: z.string().optional(),
  featuredImage: z.string().url("Featured image URL khong hop le.").optional().or(z.literal("")),
  content: z.string().min(20, "Noi dung bai viet toi thieu 20 ky tu."),
  categoryId: z.string().min(1, "Can chon category."),
  tags: z.array(z.string()).default([]),
  status: z.nativeEnum(PublishStatus),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional()
});

function categoryPath(tenantId: string, params?: Record<string, string | undefined>) {
  return buildAdminPath("/admin/blog/categories", { tenantId, ...params });
}

function postPath(tenantId: string, params?: Record<string, string | undefined>) {
  return buildAdminPath("/admin/blog/posts", { tenantId, ...params });
}

async function getTenantCategoryOrThrow(tenantId: string, categoryId: string) {
  const category = await db.blogCategory.findFirst({
    where: {
      id: categoryId,
      tenantId,
      deletedAt: null
    },
    select: {
      id: true
    }
  });

  if (!category) {
    throw new Error("Category-khong-thuoc-tenant-hien-tai");
  }

  return category;
}

async function getTenantPostOrThrow(tenantId: string, postId: string) {
  const post = await db.blogPost.findFirst({
    where: {
      id: postId,
      tenantId,
      deletedAt: null
    },
    select: {
      id: true,
      publishedAt: true
    }
  });

  if (!post) {
    throw new Error("Bai-viet-khong-thuoc-tenant-hien-tai");
  }

  return post;
}

export async function upsertCategoryAction(formData: FormData) {
  const tenantId = getString(formData, "tenantId");
  const access = await requireTenantAccess(tenantId, {
    roles: [TenantMemberRole.TENANT_ADMIN, TenantMemberRole.EDITOR],
    nextPath: `/admin/blog/categories?tenantId=${tenantId}`
  });

  const parsed = categorySchema.safeParse({
    categoryId: getOptionalString(formData, "categoryId"),
    tenantId,
    name: getString(formData, "name"),
    slug: getSlug(formData, "slug", "name"),
    description: getOptionalString(formData, "description")
  });

  if (!parsed.success) {
    redirect(categoryPath(tenantId, { error: formatZodError(parsed.error) }));
  }

  try {
    if (parsed.data.categoryId) {
      await getTenantCategoryOrThrow(tenantId, parsed.data.categoryId);
    }

    const category = parsed.data.categoryId
      ? await db.blogCategory.update({
          where: {
            id: parsed.data.categoryId
          },
          data: {
            name: parsed.data.name,
            slug: parsed.data.slug,
            description: parsed.data.description,
            seoTitle: parsed.data.name,
            seoDescription: parsed.data.description,
            updatedById: access.user.id,
            deletedAt: null
          }
        })
      : await db.blogCategory.create({
          data: {
            tenantId,
            name: parsed.data.name,
            slug: parsed.data.slug,
            description: parsed.data.description,
            seoTitle: parsed.data.name,
            seoDescription: parsed.data.description,
            createdById: access.user.id,
            updatedById: access.user.id
          }
        });

    revalidateTag("public-content", "max");
    revalidatePath("/admin/blog/categories");
    redirect(categoryPath(tenantId, { success: "Da-luu-category", edit: category.id }));
  } catch (error) {
    redirect(categoryPath(tenantId, { error: error instanceof Error ? error.message : "Khong-the-luu-category" }));
  }
}

export async function softDeleteCategoryAction(formData: FormData) {
  const tenantId = getString(formData, "tenantId");
  const categoryId = getString(formData, "categoryId");
  const access = await requireTenantAccess(tenantId, {
    roles: [TenantMemberRole.TENANT_ADMIN, TenantMemberRole.EDITOR],
    nextPath: `/admin/blog/categories?tenantId=${tenantId}`
  });

  const postCount = await db.blogPost.count({
    where: {
      tenantId,
      categoryId,
      deletedAt: null
    }
  });

  if (postCount > 0) {
    redirect(categoryPath(tenantId, { error: "Khong-the-xoa-category-dang-con-bai-viet" }));
  }

  await db.blogCategory.update({
    where: {
      id: (await getTenantCategoryOrThrow(tenantId, categoryId)).id
    },
    data: {
      deletedAt: new Date(),
      updatedById: access.user.id
    }
  });

  revalidateTag("public-content", "max");
  revalidatePath("/admin/blog/categories");
  redirect(categoryPath(tenantId, { success: "Da-xoa-mem-category" }));
}

export async function upsertPostAction(formData: FormData) {
  const tenantId = getString(formData, "tenantId");
  const access = await requireTenantAccess(tenantId, {
    roles: [TenantMemberRole.TENANT_ADMIN, TenantMemberRole.EDITOR],
    nextPath: `/admin/blog/posts?tenantId=${tenantId}`
  });

  const parsed = postSchema.safeParse({
    postId: getOptionalString(formData, "postId"),
    tenantId,
    title: getString(formData, "title"),
    slug: getSlug(formData, "slug", "title"),
    excerpt: getOptionalString(formData, "excerpt"),
    featuredImage: getOptionalString(formData, "featuredImage") ?? "",
    content: getString(formData, "content"),
    categoryId: getString(formData, "categoryId"),
    tags: getString(formData, "tags")
      .split(",")
      .map((item) => slugify(item))
      .filter(Boolean),
    status: getString(formData, "status"),
    seoTitle: getOptionalString(formData, "seoTitle"),
    seoDescription: getOptionalString(formData, "seoDescription")
  });

  if (!parsed.success) {
    redirect(postPath(tenantId, { error: formatZodError(parsed.error) }));
  }

  try {
    await getTenantCategoryOrThrow(tenantId, parsed.data.categoryId);

    const post = await db.$transaction(async (tx) => {
      const existing = parsed.data.postId
        ? await getTenantPostOrThrow(tenantId, parsed.data.postId)
        : null;

      const savedPost = parsed.data.postId
        ? await tx.blogPost.update({
            where: {
              id: parsed.data.postId
            },
            data: {
              title: parsed.data.title,
              slug: parsed.data.slug,
              excerpt: parsed.data.excerpt,
              featuredImage: parsed.data.featuredImage || null,
              content: parsed.data.content,
              categoryId: parsed.data.categoryId,
              status: parsed.data.status,
              seoTitle: parsed.data.seoTitle,
              seoDescription: parsed.data.seoDescription,
              publishedAt:
                parsed.data.status === PublishStatus.PUBLISHED
                  ? existing?.publishedAt ?? new Date()
                  : null,
              authorId: access.user.id,
              updatedById: access.user.id,
              deletedAt: null
            }
          })
        : await tx.blogPost.create({
            data: {
              tenantId,
              categoryId: parsed.data.categoryId,
              authorId: access.user.id,
              title: parsed.data.title,
              slug: parsed.data.slug,
              excerpt: parsed.data.excerpt,
              featuredImage: parsed.data.featuredImage || null,
              content: parsed.data.content,
              status: parsed.data.status,
              seoTitle: parsed.data.seoTitle,
              seoDescription: parsed.data.seoDescription,
              publishedAt: parsed.data.status === PublishStatus.PUBLISHED ? new Date() : null,
              createdById: access.user.id,
              updatedById: access.user.id
            }
          });

      await tx.blogPostTag.deleteMany({
        where: {
          blogPostId: savedPost.id
        }
      });

      for (const tagSlug of parsed.data.tags) {
        const tag = await tx.blogTag.upsert({
          where: {
            tenantId_slug: {
              tenantId,
              slug: tagSlug
            }
          },
          update: {
            name: tagSlug,
            deletedAt: null,
            updatedById: access.user.id
          },
          create: {
            tenantId,
            name: tagSlug,
            slug: tagSlug,
            createdById: access.user.id,
            updatedById: access.user.id
          }
        });

        await tx.blogPostTag.create({
          data: {
            tenantId,
            blogPostId: savedPost.id,
            blogTagId: tag.id,
            createdById: access.user.id
          }
        });
      }

      return savedPost;
    });

    revalidateTag("public-content", "max");
    revalidatePath("/admin/blog/posts");
    redirect(postPath(tenantId, { success: "Da-luu-bai-viet", edit: post.id }));
  } catch (error) {
    redirect(postPath(tenantId, { error: error instanceof Error ? error.message : "Khong-the-luu-bai-viet" }));
  }
}

export async function softDeletePostAction(formData: FormData) {
  const tenantId = getString(formData, "tenantId");
  const postId = getString(formData, "postId");
  const access = await requireTenantAccess(tenantId, {
    roles: [TenantMemberRole.TENANT_ADMIN, TenantMemberRole.EDITOR],
    nextPath: `/admin/blog/posts?tenantId=${tenantId}`
  });

  await db.blogPost.update({
    where: {
      id: (await getTenantPostOrThrow(tenantId, postId)).id
    },
    data: {
      deletedAt: new Date(),
      updatedById: access.user.id
    }
  });

  revalidateTag("public-content", "max");
  revalidatePath("/admin/blog/posts");
  redirect(postPath(tenantId, { success: "Da-xoa-mem-bai-viet" }));
}
