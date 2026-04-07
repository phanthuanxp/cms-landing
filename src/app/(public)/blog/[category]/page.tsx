import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BlogSidebar } from "@/components/public/blog-sidebar";
import { BlogPostCard } from "@/components/public/blog-post-card";
import { CtaBanner } from "@/components/public/cta-banner";
import { PublicBreadcrumbs } from "@/components/public/breadcrumbs";
import { SectionIntro } from "@/components/public/section-intro";
import { StructuredData } from "@/components/public/structured-data";
import { EmptyState } from "@/components/ui/empty-state";
import { getBlogListing } from "@/server/queries/public";
import { buildMetadata } from "@/server/seo/metadata";
import { buildBreadcrumbJsonLd, buildOrganizationJsonLd, buildWebsiteJsonLd } from "@/server/seo/json-ld";
import { getCurrentTenant, getRequestHost } from "@/server/tenant/request";

type Props = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const currentTenant = await getCurrentTenant();

  if (currentTenant.status !== "active") {
    return {};
  }

  const { category } = await params;
  const host = await getRequestHost();
  const result = await getBlogListing(host, 1, "", category);

  if (!result?.category) {
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
    pathname: `/blog/${category}`,
    title: `${result.category.name} | ${result.tenant.siteSettings?.siteName ?? result.tenant.slug}`,
    description: result.category.description ?? `Chuyen muc ${result.category.name}.`
  });
}

export default async function BlogCategoryPage({ params }: Props) {
  const currentTenant = await getCurrentTenant();

  if (currentTenant.status !== "active") {
    return null;
  }

  const { category } = await params;
  const host = await getRequestHost();
  const result = await getBlogListing(host, 1, "", category);

  if (!result?.category) {
    notFound();
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
            { name: "Blog", path: "/blog" },
            { name: result.category.name, path: `/blog/${category}` }
          ])
        ]}
      />
      <section className="space-y-6">
        <PublicBreadcrumbs
          items={[
            { name: "Trang chu", href: "/" },
            { name: "Blog", href: "/blog" },
            { name: result.category.name }
          ]}
        />
        <div className="premium-panel rounded-[2.3rem] p-6 sm:p-8 lg:p-10">
          <SectionIntro
            description={result.category.description ?? `Tong hop cac bai viet trong chuyen muc ${result.category.name}.`}
            eyebrow="Category archive"
            title={result.category.name}
          />
          <Link className="mt-5 inline-flex text-sm font-medium text-teal-700" href="/blog">
            Quay lai blog
          </Link>
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-[0.76fr,2fr]">
        <BlogSidebar categories={result.categories} />
        {result.posts.length === 0 ? (
          <EmptyState description="Chuyen muc nay chua co bai viet public nao." title="Chua co bai viet" />
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {result.posts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
      <CtaBanner
        description={`Neu ban dang quan tam toi chu de ${result.category.name.toLowerCase()}, hay de lai thong tin de nhan tu van noi dung va landing page phu hop.`}
        title={`Muon mo rong cluster noi dung cho ${result.category.name}?`}
      />
    </div>
  );
}
