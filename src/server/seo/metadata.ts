import type { Metadata } from "next";

import { absoluteUrl, canonicalUrl } from "@/lib/utils";

type MetadataInput = {
  host: string;
  tenant: {
    siteName: string;
    defaultSeoTitle: string;
    defaultSeoDescription: string;
    defaultOgImage: string | null;
  };
  pathname: string;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  type?: "website" | "article";
  publishedTime?: string | null;
  noIndex?: boolean;
};

export function buildMetadata({
  host,
  tenant,
  pathname,
  title,
  description,
  image,
  type = "website",
  publishedTime,
  noIndex = false
}: MetadataInput): Metadata {
  const resolvedTitle = title ?? tenant.defaultSeoTitle;
  const resolvedDescription = description ?? tenant.defaultSeoDescription;
  const rawImage = image ?? tenant.defaultOgImage ?? null;
  const resolvedImage = rawImage
    ? rawImage.startsWith("http")
      ? rawImage
      : absoluteUrl(host, rawImage)
    : null;
  const canonical = canonicalUrl(host, pathname);

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    alternates: {
      canonical
    },
    robots: {
      index: !noIndex,
      follow: !noIndex
    },
    openGraph: {
      type,
      title: resolvedTitle,
      description: resolvedDescription,
      url: canonical,
      siteName: tenant.siteName,
      publishedTime: publishedTime ?? undefined,
      images: resolvedImage
        ? [
            {
              url: resolvedImage,
              alt: resolvedTitle
            }
          ]
        : undefined
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description: resolvedDescription,
      images: resolvedImage ? [resolvedImage] : undefined
    }
  };
}
