import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlockRenderer } from "@/components/public/block-renderer";
import { PublicBreadcrumbs } from "@/components/public/breadcrumbs";
import { StructuredData } from "@/components/public/structured-data";
import { pageBlocksSchema } from "@/types/cms";
import { getPublicPageBySlug } from "@/server/queries/public";
import { buildMetadata } from "@/server/seo/metadata";
import {
  buildBreadcrumbJsonLd,
  buildOrganizationJsonLd,
  buildWebsiteJsonLd
} from "@/server/seo/json-ld";
import { getCurrentTenant, getRequestHost } from "@/server/tenant/request";

type PageProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug = [] } = await params;
  const currentTenant = await getCurrentTenant();

  if (currentTenant.status !== "active") {
    return {};
  }

  const host = await getRequestHost();
  const result = await getPublicPageBySlug(host, slug);

  if (!result?.page) {
    return {};
  }

  const pathname = slug.length === 0 ? "/" : `/${slug.join("/")}`;

  return buildMetadata({
    host,
    tenant: {
      siteName: result.tenant.siteSettings?.siteName ?? result.tenant.slug,
      defaultSeoTitle: result.tenant.siteSettings?.defaultSeoTitle ?? result.tenant.slug,
      defaultSeoDescription: result.tenant.siteSettings?.defaultSeoDescription ?? "",
      defaultOgImage: result.tenant.siteSettings?.defaultOgImageUrl ?? null
    },
    pathname,
    title: result.page.seoTitle ?? result.page.title,
    description: result.page.seoDescription ?? result.page.summary,
    image: result.page.ogImageUrl
  });
}

export default async function PublicPage({ params }: PageProps) {
  const { slug = [] } = await params;
  const currentTenant = await getCurrentTenant();

  if (currentTenant.status !== "active") {
    return null;
  }

  const host = await getRequestHost();
  const result = await getPublicPageBySlug(host, slug);

  if (!result?.page) {
    notFound();
  }

  const blocks = pageBlocksSchema.parse(result.page.uiBlocks);
  const pathname = slug.length === 0 ? "/" : `/${slug.join("/")}`;

  return (
    <>
      <StructuredData
        data={[
          buildOrganizationJsonLd(
            {
              siteName: result.tenant.siteSettings?.siteName ?? result.tenant.slug,
              businessName: result.tenant.siteSettings?.businessName,
              businessDescription: result.tenant.siteSettings?.businessDescription,
              businessPhone: result.tenant.siteSettings?.businessPhone,
              businessEmail: result.tenant.siteSettings?.businessEmail,
              businessAddress: result.tenant.siteSettings?.businessAddress,
              logo: result.tenant.siteSettings?.logoUrl,
              socialLinks: result.tenant.siteSettings?.socialLinks
            },
            host
          ),
          buildWebsiteJsonLd({ siteName: result.tenant.siteSettings?.siteName ?? result.tenant.slug }, host),
          buildBreadcrumbJsonLd(host, [
            { name: "Trang chu", path: "/" },
            ...(pathname === "/"
              ? []
              : [{ name: result.page.title, path: pathname }])
          ])
        ]}
      />
      {pathname !== "/" ? (
        <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 sm:pt-10">
          <PublicBreadcrumbs
            items={[
              { name: "Trang chu", href: "/" },
              { name: result.page.title }
            ]}
          />
        </div>
      ) : null}
      <BlockRenderer
        blocks={blocks}
        pageId={result.page.id}
        sourcePath={pathname}
        tenantId={result.tenant.id}
      />
    </>
  );
}
