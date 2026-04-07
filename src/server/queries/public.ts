import { PublishStatus } from "@prisma/client";
import { unstable_cache } from "next/cache";

import { PAGE_SIZE, PUBLIC_REVALIDATE_SECONDS } from "@/lib/constants";
import { db } from "@/server/db/client";
import { normalizeHost, resolveTenantByHost } from "@/server/tenant/request";

function mapBlockTypeToUi(type: string) {
  return type.toLowerCase().replaceAll("_", "-");
}

const getPublishedTenantByHost = unstable_cache(
  async (host: string) => {
    const resolution = await resolveTenantByHost(normalizeHost(host));

    if (resolution.status !== "active") {
      return null;
    }

    return resolution.tenant;
  },
  ["public-tenant-by-host-v2"],
  { revalidate: PUBLIC_REVALIDATE_SECONDS, tags: ["tenant", "public-content"] }
);

export async function getTenantShell(host: string) {
  const resolution = await resolveTenantByHost(host);

  if (resolution.status !== "active") {
    return {
      ...resolution,
      primaryMenu: null,
      footerMenu: null
    };
  }

  const tenant = resolution.tenant;

  const [primaryMenu, footerMenu] = await Promise.all([
    db.menu.findFirst({
      where: {
        tenantId: tenant.id,
        location: "PRIMARY",
        deletedAt: null,
        isActive: true
      },
      include: {
        items: {
          where: {
            deletedAt: null,
            isActive: true
          },
          orderBy: {
            sortOrder: "asc"
          }
        }
      }
    }),
    db.menu.findFirst({
      where: {
        tenantId: tenant.id,
        location: "FOOTER",
        deletedAt: null,
        isActive: true
      },
      include: {
        items: {
          where: {
            deletedAt: null,
            isActive: true
          },
          orderBy: {
            sortOrder: "asc"
          }
        }
      }
    })
  ]);

  return { ...resolution, primaryMenu, footerMenu };
}

export async function getPublicPageBySlug(host: string, slugSegments?: string[]) {
  const tenant = await getPublishedTenantByHost(host);

  if (!tenant) {
    return null;
  }

  const slug = !slugSegments || slugSegments.length === 0 ? "home" : slugSegments.join("/");
  const page = await db.page.findFirst({
    where: {
      tenantId: tenant.id,
      slug,
      deletedAt: null,
      status: PublishStatus.PUBLISHED
    },
    include: {
      blocks: {
        where: {
          deletedAt: null,
          isEnabled: true
        },
        orderBy: {
          position: "asc"
        }
      }
    }
  });

  return {
    tenant,
    page: page
      ? {
          ...page,
          uiBlocks: page.blocks.map((block) => ({
            type: mapBlockTypeToUi(block.blockType),
            ...(typeof block.payload === "object" && block.payload ? block.payload : {})
          }))
        }
      : null
  };
}

export async function getBlogListing(host: string, page = 1, query = "", categorySlug?: string) {
  const tenant = await getPublishedTenantByHost(host);

  if (!tenant) {
    return null;
  }

  const category = categorySlug
    ? await db.blogCategory.findFirst({
        where: {
          tenantId: tenant.id,
          slug: categorySlug,
          deletedAt: null
        }
      })
    : null;

  const categories = await db.blogCategory.findMany({
    where: {
      tenantId: tenant.id,
      deletedAt: null
    },
    orderBy: {
      name: "asc"
    }
  });

  if (categorySlug && !category) {
    return {
      tenant,
      category: null,
      categories,
      posts: [],
      total: 0,
      page,
      pageCount: 1
    };
  }

  const where = {
    tenantId: tenant.id,
    deletedAt: null,
    status: PublishStatus.PUBLISHED,
    category: {
      deletedAt: null
    },
    ...(category ? { categoryId: category.id } : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" as const } },
            { excerpt: { contains: query, mode: "insensitive" as const } },
            { content: { contains: query, mode: "insensitive" as const } }
          ]
        }
      : {})
  };

  const total = await db.blogPost.count({ where });
  const posts = await db.blogPost.findMany({
    where,
    include: {
      category: true,
      author: true
    },
    orderBy: {
      publishedAt: "desc"
    },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE
  });

  return {
    tenant,
    category,
    categories,
    posts,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE))
  };
}

export async function getBlogPost(host: string, slug: string) {
  const tenant = await getPublishedTenantByHost(host);

  if (!tenant) {
    return null;
  }

  const post = await db.blogPost.findFirst({
    where: {
      tenantId: tenant.id,
      slug,
      deletedAt: null,
      status: PublishStatus.PUBLISHED,
      category: {
        deletedAt: null
      }
    },
    include: {
      category: true,
      author: true,
      tagLinks: {
        include: {
          blogTag: true
        }
      }
    }
  });

  if (!post) {
    return null;
  }

  const relatedPosts = await db.blogPost.findMany({
    where: {
      tenantId: tenant.id,
      deletedAt: null,
      status: PublishStatus.PUBLISHED,
      id: {
        not: post.id
      },
      categoryId: post.categoryId,
      category: {
        deletedAt: null
      }
    },
    include: {
      category: true,
      author: true
    },
    orderBy: {
      publishedAt: "desc"
    },
    take: 3
  });

  return {
    tenant,
    post,
    relatedPosts
  };
}

export async function getSitemapPayload(host: string) {
  const tenant = await getPublishedTenantByHost(host);

  if (!tenant) {
    return null;
  }

  const [pages, posts, categories] = await Promise.all([
    db.page.findMany({
      where: {
        tenantId: tenant.id,
        deletedAt: null,
        status: PublishStatus.PUBLISHED
      },
      select: {
        slug: true,
        updatedAt: true
      }
    }),
    db.blogPost.findMany({
      where: {
        tenantId: tenant.id,
        deletedAt: null,
        status: PublishStatus.PUBLISHED
      },
      select: {
        slug: true,
        updatedAt: true
      }
    }),
    db.blogCategory.findMany({
      where: {
        tenantId: tenant.id,
        deletedAt: null
      },
      select: {
        slug: true,
        updatedAt: true
      }
    })
  ]);

  return {
    tenant,
    pages,
    posts,
    categories
  };
}
