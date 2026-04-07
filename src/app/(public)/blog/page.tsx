import type { Metadata } from "next";
import Link from "next/link";
import { z } from "zod";

import { BlogSidebar } from "@/components/public/blog-sidebar";
import { BlogPostCard } from "@/components/public/blog-post-card";
import { CtaBanner } from "@/components/public/cta-banner";
import { PublicBreadcrumbs } from "@/components/public/breadcrumbs";
import { SectionIntro } from "@/components/public/section-intro";
import { StructuredData } from "@/components/public/structured-data";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getBlogListing } from "@/server/queries/public";
import { buildMetadata } from "@/server/seo/metadata";
import { buildBreadcrumbJsonLd, buildOrganizationJsonLd, buildWebsiteJsonLd } from "@/server/seo/json-ld";
import { getCurrentTenant, getRequestHost } from "@/server/tenant/request";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const blogSearchParamsSchema = z.object({
  page: z.preprocess((value) => {
    const raw = Array.isArray(value) ? value[0] : value;
    const parsed = Number.parseInt(raw ?? "1", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }, z.number().int().min(1)),
  q: z.preprocess((value) => {
    const raw = Array.isArray(value) ? value[0] : value;
    return typeof raw === "string" ? raw.trim() : "";
  }, z.string())
});

export async function generateMetadata(): Promise<Metadata> {
  const currentTenant = await getCurrentTenant();

  if (currentTenant.status !== "active") {
    return {};
  }

  const host = await getRequestHost();
  const result = await getBlogListing(host, 1);

  if (!result) {
    return {};
  }

  return buildMetadata({
    host,
    tenant: {
      siteName: result.tenant.siteSettings?.siteName ?? result.tenant.slug,
      defaultSeoTitle: result.tenant.siteSettings?.defaultSeoTitle ?? result.tenant.slug,
      defaultSeoDescription: result.tenant.siteSettings?.defaultSeoDescription ?? "",
      defaultOgImage: result.tenant.siteSettings?.defaultOgImageUrl ?? null
    },
    pathname: "/blog",
    title: `Blog | ${result.tenant.siteSettings?.siteName ?? result.tenant.slug}`,
    description: `Tin tuc va bai viet moi nhat tu ${result.tenant.siteSettings?.siteName ?? result.tenant.slug}.`
  });
}

export default async function BlogIndexPage({ searchParams }: Props) {
  const query = blogSearchParamsSchema.parse(await searchParams);
  const page = query.page;
  const q = query.q;
  const currentTenant = await getCurrentTenant();

  if (currentTenant.status !== "active") {
    return null;
  }

  const host = await getRequestHost();
  const result = await getBlogListing(host, page, q);

  if (!result) {
    return <EmptyState description="Khong tim thay tenant cho domain hien tai." title="Chua co blog" />;
  }

  return (
    <div className="page-shell space-y-10">
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
            { name: "Blog", path: "/blog" }
          ])
        ]}
      />
      <section className="space-y-6">
        <PublicBreadcrumbs items={[{ name: "Trang chu", href: "/" }, { name: "Blog" }]} />
        <div className="premium-panel overflow-hidden rounded-[2.3rem] p-6 sm:p-8 lg:p-10">
          <SectionIntro
            description={`Noi dung tu ${result.tenant.siteSettings?.siteName ?? result.tenant.slug}, toi uu cho semantic HTML, metadata dong, category archive va internal linking.`}
            eyebrow="Knowledge hub"
            title={`Blog cua ${result.tenant.siteSettings?.siteName ?? result.tenant.slug}`}
          />
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-[0.76fr,2fr]">
        <BlogSidebar categories={result.categories} query={q} />
        <div className="space-y-6">
          {result.posts.length === 0 ? (
            <EmptyState description="Hay tao bai viet trong admin CMS de hien thi tai day." title="Chua co bai viet" />
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {result.posts.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          )}
          <div className="premium-panel flex items-center justify-between rounded-[1.8rem] px-4 py-4 text-sm text-stone-600">
            <span>
              Trang {result.page} / {result.pageCount}
            </span>
            <div className="flex gap-2">
              <Button asChild disabled={result.page <= 1} size="sm" variant="outline">
                <Link href={`/blog?page=${Math.max(1, result.page - 1)}${q ? `&q=${encodeURIComponent(q)}` : ""}`}>
                  Trang truoc
                </Link>
              </Button>
              <Button asChild disabled={result.page >= result.pageCount} size="sm" variant="outline">
                <Link href={`/blog?page=${Math.min(result.pageCount, result.page + 1)}${q ? `&q=${encodeURIComponent(q)}` : ""}`}>
                  Trang sau
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      <CtaBanner
        description="Ban can mot he thong landing page va blog chuan SEO cho nhieu domain trong cung mot codebase? Chung ta co the bat dau tu homepage va blog structure nay."
        title="Muon bien blog thanh kenh thu lead that su?"
      />
    </div>
  );
}
