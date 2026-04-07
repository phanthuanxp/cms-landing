import { absoluteUrl, canonicalUrl } from "@/lib/utils";

export function buildOrganizationJsonLd(tenant: {
  siteName: string;
  businessName?: string | null;
  businessDescription?: string | null;
  businessPhone?: string | null;
  businessEmail?: string | null;
  businessAddress?: string | null;
  logo?: string | null;
  socialLinks?: unknown;
}, host: string) {
  const socialLinks =
    tenant.socialLinks && typeof tenant.socialLinks === "object"
      ? Object.values(tenant.socialLinks as Record<string, string>).filter(
          (value): value is string => typeof value === "string" && value.trim().length > 0
        )
      : [];
  const logo = tenant.logo
    ? tenant.logo.startsWith("http")
      ? tenant.logo
      : absoluteUrl(host, tenant.logo)
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: tenant.businessName ?? tenant.siteName,
    description: tenant.businessDescription ?? undefined,
    url: canonicalUrl(host),
    logo,
    telephone: tenant.businessPhone ?? undefined,
    email: tenant.businessEmail ?? undefined,
    address: tenant.businessAddress ?? undefined,
    sameAs: socialLinks
  };
}

export function buildWebsiteJsonLd(tenant: { siteName: string }, host: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: tenant.siteName,
    url: canonicalUrl(host)
  };
}

export function buildBreadcrumbJsonLd(
  host: string,
  items: Array<{ name: string; path: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: canonicalUrl(host, item.path)
    }))
  };
}

export function buildArticleJsonLd(
  host: string,
  post: {
    title: string;
    excerpt?: string | null;
    slug: string;
    featuredImage?: string | null;
    publishedAt?: Date | null;
    updatedAt: Date;
    author?: { name: string } | null;
  },
  tenant: { siteName: string }
) {
  const image = post.featuredImage
    ? post.featuredImage.startsWith("http")
      ? post.featuredImage
      : absoluteUrl(host, post.featuredImage)
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? undefined,
    image,
    datePublished: post.publishedAt?.toISOString() ?? undefined,
    dateModified: post.updatedAt.toISOString(),
    author: post.author?.name
      ? {
          "@type": "Person",
          name: post.author.name
        }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: tenant.siteName
    },
    mainEntityOfPage: canonicalUrl(host, `/blog/post/${post.slug}`)
  };
}
