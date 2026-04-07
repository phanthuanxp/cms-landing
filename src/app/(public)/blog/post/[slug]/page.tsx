import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BlogPostCard } from "@/components/public/blog-post-card";
import { CtaBanner } from "@/components/public/cta-banner";
import { PublicBreadcrumbs } from "@/components/public/breadcrumbs";
import { StructuredData } from "@/components/public/structured-data";
import { Badge } from "@/components/ui/badge";
import { estimateReadingTimeMinutes, formatDate } from "@/lib/utils";
import { getBlogPost } from "@/server/queries/public";
import { buildMetadata } from "@/server/seo/metadata";
import { buildArticleJsonLd, buildBreadcrumbJsonLd, buildOrganizationJsonLd, buildWebsiteJsonLd } from "@/server/seo/json-ld";
import { getCurrentTenant, getRequestHost } from "@/server/tenant/request";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const currentTenant = await getCurrentTenant();

  if (currentTenant.status !== "active") {
    return {};
  }

  const { slug } = await params;
  const host = await getRequestHost();
  const result = await getBlogPost(host, slug);

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
    pathname: `/blog/post/${slug}`,
    title: result.post.seoTitle ?? result.post.title,
    description: result.post.seoDescription ?? result.post.excerpt,
    image: result.post.featuredImage,
    type: "article",
    publishedTime: result.post.publishedAt?.toISOString()
  });
}

export default async function BlogDetailPage({ params }: Props) {
  const currentTenant = await getCurrentTenant();

  if (currentTenant.status !== "active") {
    return null;
  }

  const { slug } = await params;
  const host = await getRequestHost();
  const result = await getBlogPost(host, slug);

  if (!result) {
    notFound();
  }

  const readingTime = estimateReadingTimeMinutes(result.post.content);

  return (
    <article className="page-shell space-y-10">
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
            { name: result.post.title, path: `/blog/post/${slug}` }
          ]),
          buildArticleJsonLd(host, result.post, { siteName: result.tenant.siteSettings?.siteName ?? result.tenant.slug })
        ]}
      />
      <header className="space-y-6">
        <PublicBreadcrumbs
          items={[
            { name: "Trang chu", href: "/" },
            { name: "Blog", href: "/blog" },
            result.post.category ? { name: result.post.category.name, href: `/blog/${result.post.category.slug}` } : { name: "Category" },
            { name: result.post.title }
          ]}
        />
        {result.post.category ? (
          <Badge className="w-fit rounded-full border border-teal-200/70 bg-teal-50/80 text-teal-700">
            <Link href={`/blog/${result.post.category.slug}`}>{result.post.category.name}</Link>
          </Badge>
        ) : null}
        <h1 className="max-w-4xl text-balance text-4xl font-semibold tracking-[-0.05em] text-stone-950 sm:text-5xl lg:text-[3.8rem] lg:leading-[1.02]">
          {result.post.title}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-stone-500">
          <span>{formatDate(result.post.publishedAt)}</span>
          <span>{result.post.author?.name ?? "CMS Editor"}</span>
          <span>{readingTime} phut doc</span>
          {result.post.tagLinks.map((tagLink) => (
            <Badge className="border border-stone-200 bg-stone-100/80 text-stone-700" key={tagLink.id}>
              #{tagLink.blogTag.name}
            </Badge>
          ))}
        </div>
        {result.post.excerpt ? <p className="max-w-3xl text-lg leading-8 text-stone-600 sm:text-xl">{result.post.excerpt}</p> : null}
        {result.post.featuredImage ? (
          <div className="relative aspect-[16/8] overflow-hidden rounded-[2.3rem] border border-stone-200/80 shadow-[0_24px_60px_rgba(28,25,23,0.08)]">
            <Image
              alt={result.post.title}
              className="object-cover"
              fill
              priority
              sizes="100vw"
              src={result.post.featuredImage}
            />
          </div>
        ) : null}
      </header>
      <div className="prose-lite premium-panel rounded-[2.3rem] p-6 sm:p-10 lg:p-12">
        {result.post.content.split("\n\n").map((paragraph, paragraphIndex) => (
          <p key={`${paragraphIndex}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
        ))}
      </div>
      <CtaBanner
        description="Neu ban muon xay dung noi dung blog va landing page co internal linking dung cau truc, hay mo form lien he de nhan giai phap phu hop."
        title="Muon bien article nay thanh mot cluster SEO hoan chinh?"
      />
      {result.relatedPosts.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-stone-950">Bai viet lien quan</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {result.relatedPosts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
