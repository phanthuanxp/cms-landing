import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createExcerpt, estimateReadingTimeMinutes, formatDate } from "@/lib/utils";

export function BlogPostCard({
  post
}: {
  post: {
    slug: string;
    title: string;
    excerpt: string | null;
    content?: string | null;
    publishedAt: Date | null;
    featuredImage?: string | null;
    category?: {
      name: string;
      slug: string;
    } | null;
  };
}) {
  const excerpt = post.excerpt || createExcerpt(post.content);
  const readingTime = estimateReadingTimeMinutes(post.content ?? post.excerpt);

  return (
    <Card className="group h-full overflow-hidden rounded-[2rem] border-stone-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(251,249,245,0.92))] shadow-[0_18px_40px_rgba(28,25,23,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_60px_rgba(28,25,23,0.1)]">
      {post.featuredImage ? (
        <div className="relative aspect-[16/10] overflow-hidden border-b border-stone-100">
          <Image
            alt={post.title}
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            src={post.featuredImage}
          />
        </div>
      ) : null}
      <CardHeader className="space-y-3 border-b-0 pb-0">
        {post.category ? (
          <Badge className="w-fit rounded-full border border-teal-200/70 bg-teal-50/80 text-teal-700">
            <Link href={`/blog/${post.category.slug}`}>{post.category.name}</Link>
          </Badge>
        ) : null}
        <CardTitle className="text-balance text-xl leading-tight tracking-[-0.03em] text-stone-950">
          <Link className="transition group-hover:text-teal-700" href={`/blog/post/${post.slug}`}>
            {post.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-5">
        <p className="text-sm leading-7 text-stone-600">{excerpt}</p>
        <div className="flex items-center justify-between gap-3 border-t border-stone-100 pt-4">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">{`${formatDate(post.publishedAt)} | ${readingTime} phut doc`}</p>
          <Link className="inline-flex items-center gap-1 text-sm font-medium text-teal-700" href={`/blog/post/${post.slug}`}>
            Doc them
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
