import { PublishStatus } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import { env } from "@/lib/env";
import { slugify } from "@/lib/slug";
import { db } from "@/server/db/client";
import { normalizeHost, resolveTenantByHost } from "@/server/tenant/request";

export const dynamic = "force-dynamic";

const payloadSchema = z.object({
  externalId: z.string().optional(),
  title: z.string().min(3),
  slug: z.string().min(1).optional(),
  excerpt: z.string().optional().nullable(),
  content: z.string().min(20),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  featuredImageUrl: z.string().url().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  sourceUrls: z.array(z.string().url()).optional().default([]),
  publishedAt: z.string().datetime().optional()
});

function getBearerToken(request: Request) {
  return request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim() ?? "";
}

function getRequestHost(request: Request) {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host") || env.DEFAULT_SITE_DOMAIN;
  return normalizeHost(host);
}

function appendSourceNote(content: string, sourceUrls: string[]) {
  if (sourceUrls.length === 0) return content;

  return `${content.trim()}\n\nNguồn tham khảo: ${sourceUrls.join(", ")}`;
}

export async function POST(request: Request) {
  if (!env.CONTENT_API_KEY || getBearerToken(request) !== env.CONTENT_API_KEY) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const parsed = payloadSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return Response.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const host = getRequestHost(request);
  const tenantResolution = await resolveTenantByHost(host);

  if (tenantResolution.status !== "active") {
    return Response.json({ ok: false, error: "Tenant not active for host" }, { status: 404 });
  }

  const tenant = tenantResolution.tenant;
  const data = parsed.data;
  const slug = slugify(data.slug || data.title);
  const publishedAt = data.publishedAt ? new Date(data.publishedAt) : new Date();

  const author = await db.user.findFirst({
    where: {
      isActive: true,
      deletedAt: null,
      OR: [
        { globalRole: "SUPER_ADMIN" },
        {
          tenantMemberships: {
            some: {
              tenantId: tenant.id,
              deletedAt: null
            }
          }
        }
      ]
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  if (!author) {
    return Response.json({ ok: false, error: "No active CMS author found" }, { status: 500 });
  }

  const category = await db.blogCategory.upsert({
    where: {
      tenantId_slug: {
        tenantId: tenant.id,
        slug: "auto-blog"
      }
    },
    update: {
      name: "Auto Blog",
      description: "Bai viet duoc dong bo tu Auto Content Hub.",
      deletedAt: null,
      updatedById: author.id
    },
    create: {
      tenantId: tenant.id,
      name: "Auto Blog",
      slug: "auto-blog",
      description: "Bai viet duoc dong bo tu Auto Content Hub.",
      seoTitle: "Auto Blog",
      seoDescription: "Bai viet duoc dong bo tu Auto Content Hub.",
      createdById: author.id,
      updatedById: author.id
    }
  });

  const post = await db.$transaction(async (tx) => {
    const savedPost = await tx.blogPost.upsert({
      where: {
        tenantId_slug: {
          tenantId: tenant.id,
          slug
        }
      },
      update: {
        title: data.title,
        excerpt: data.excerpt || null,
        content: appendSourceNote(data.content, data.sourceUrls),
        featuredImage: data.featuredImageUrl || null,
        seoTitle: data.seoTitle || data.title,
        seoDescription: data.seoDescription || data.excerpt || null,
        categoryId: category.id,
        status: PublishStatus.PUBLISHED,
        publishedAt,
        authorId: author.id,
        updatedById: author.id,
        deletedAt: null
      },
      create: {
        tenantId: tenant.id,
        categoryId: category.id,
        authorId: author.id,
        title: data.title,
        slug,
        excerpt: data.excerpt || null,
        content: appendSourceNote(data.content, data.sourceUrls),
        featuredImage: data.featuredImageUrl || null,
        seoTitle: data.seoTitle || data.title,
        seoDescription: data.seoDescription || data.excerpt || null,
        status: PublishStatus.PUBLISHED,
        publishedAt,
        createdById: author.id,
        updatedById: author.id
      }
    });

    await tx.blogPostTag.deleteMany({
      where: {
        blogPostId: savedPost.id
      }
    });

    for (const tagName of data.tags.map((tag) => tag.trim()).filter(Boolean)) {
      const tagSlug = slugify(tagName);
      const tag = await tx.blogTag.upsert({
        where: {
          tenantId_slug: {
            tenantId: tenant.id,
            slug: tagSlug
          }
        },
        update: {
          name: tagName,
          deletedAt: null,
          updatedById: author.id
        },
        create: {
          tenantId: tenant.id,
          name: tagName,
          slug: tagSlug,
          createdById: author.id,
          updatedById: author.id
        }
      });

      await tx.blogPostTag.create({
        data: {
          tenantId: tenant.id,
          blogPostId: savedPost.id,
          blogTagId: tag.id,
          createdById: author.id
        }
      });
    }

    return savedPost;
  });

  revalidateTag("public-content", "max");
  revalidatePath("/blog");
  revalidatePath(`/blog/post/${slug}`);
  revalidatePath("/sitemap.xml");

  return Response.json({
    ok: true,
    id: post.id,
    slug,
    url: `https://${host}/blog/post/${slug}`
  });
}
