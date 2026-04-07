import type { MetadataRoute } from "next";

import { canonicalUrl } from "@/lib/utils";
import { getSitemapPayload } from "@/server/queries/public";
import { getCurrentTenant, getRequestHost } from "@/server/tenant/request";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentTenant = await getCurrentTenant();

  if (currentTenant.status !== "active") {
    return [];
  }

  const host = await getRequestHost();
  const payload = await getSitemapPayload(host);

  if (!payload) {
    return [];
  }

  return [
    ...payload.pages.map((page) => ({
      url: canonicalUrl(host, page.slug === "home" ? "/" : `/${page.slug}`),
      lastModified: page.updatedAt
    })),
    ...payload.posts.map((post) => ({
      url: canonicalUrl(host, `/blog/post/${post.slug}`),
      lastModified: post.updatedAt
    })),
    ...payload.categories.map((category) => ({
      url: canonicalUrl(host, `/blog/${category.slug}`),
      lastModified: category.updatedAt
    }))
  ];
}
