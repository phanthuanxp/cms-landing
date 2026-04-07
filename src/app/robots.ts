import type { MetadataRoute } from "next";

import { canonicalUrl } from "@/lib/utils";
import { getCurrentTenant, getRequestHost } from "@/server/tenant/request";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const currentTenant = await getCurrentTenant();
  const host = await getRequestHost();

  if (currentTenant.status !== "active") {
    return {
      rules: {
        userAgent: "*",
        disallow: "/"
      }
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/"
    },
    sitemap: canonicalUrl(host, "/sitemap.xml")
  };
}
