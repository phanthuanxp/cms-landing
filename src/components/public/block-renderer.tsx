import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, CheckCircle2, Quote, ShieldCheck, Sparkles } from "lucide-react";

import { SectionIntro } from "@/components/public/section-intro";
import { ContactForm } from "@/components/public/contact-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PageBlock } from "@/types/cms";

export function BlockRenderer({
  blocks,
  tenantId,
  pageId,
  sourcePath
}: {
  blocks: PageBlock[];
  tenantId: string;
  pageId?: string;
  sourcePath: string;
}) {
  return (
    <div className="pb-20 sm:pb-24">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "hero": {
            const HeroHeadingTag = index === 0 ? "h1" : "h2";

            return (
              <section className="px-4 pb-14 pt-8 sm:px-6 sm:pb-20 sm:pt-12" key={`${block.type}-${index}`}>
                <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.06fr,0.94fr] lg:items-center">
                  <div className="space-y-7">
                    <Badge className="w-fit rounded-full border border-teal-200/70 bg-teal-50/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-teal-800">
                      <Sparkles className="mr-1 h-3.5 w-3.5" />
                      SEO-first experience
                    </Badge>
                    <div className="space-y-5">
                      <HeroHeadingTag className="max-w-4xl text-balance text-[2.75rem] font-semibold tracking-[-0.05em] text-stone-950 sm:text-[3.5rem] lg:text-[4.6rem] lg:leading-[1.02]">
                        {block.headline}
                      </HeroHeadingTag>
                      {block.subheadline ? (
                        <p className="max-w-2xl text-pretty text-base leading-8 text-stone-600 sm:text-lg">
                          {block.subheadline}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {block.primaryCtaLabel && block.primaryCtaHref ? (
                        <Button asChild className="rounded-full px-6 shadow-md" size="lg">
                          <Link href={block.primaryCtaHref}>
                            {block.primaryCtaLabel}
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}
                      {block.secondaryCtaLabel && block.secondaryCtaHref ? (
                        <Button asChild className="rounded-full border-stone-300 bg-white/70 px-6" size="lg" variant="outline">
                          <Link href={block.secondaryCtaHref}>{block.secondaryCtaLabel}</Link>
                        </Button>
                      ) : null}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        { label: "Mobile-first", icon: CheckCircle2 },
                        { label: "Semantic HTML", icon: ShieldCheck },
                        { label: "Lead capture", icon: BadgeCheck }
                      ].map((item) => {
                        const Icon = item.icon;

                        return (
                          <div className="rounded-[1.4rem] border border-stone-200/80 bg-white/75 px-4 py-3 shadow-sm" key={item.label}>
                            <div className="flex items-center gap-2 text-sm font-medium text-stone-700">
                              <Icon className="h-4 w-4 text-teal-700" />
                              {item.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="relative overflow-hidden rounded-[2.25rem] border border-stone-200/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.95),rgba(240,248,246,0.88))] p-4 shadow-[0_28px_70px_rgba(28,25,23,0.12)] sm:p-6">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.12),transparent_32%)]" />
                    {block.imageUrl ? (
                      <Image
                        alt={block.imageAlt ?? block.headline}
                        className="relative h-[360px] w-full rounded-[1.8rem] object-cover sm:h-[460px]"
                        height={720}
                        src={block.imageUrl}
                        width={900}
                      />
                    ) : (
                      <div className="relative grid h-[360px] place-items-center rounded-[1.8rem] bg-[linear-gradient(135deg,#d7f5ee,transparent_40%,#f5efe6)] text-center sm:h-[460px]">
                        <div className="max-w-sm space-y-4">
                          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">
                            Premium landing surface
                          </p>
                          <p className="text-2xl font-semibold tracking-[-0.03em] text-stone-900">
                            Khoang trong ro, CTA manh va hinh anh sach de giup nguoi dung tap trung hon.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            );
          }
          case "feature-list":
            return (
              <section className="px-4 py-10 sm:px-6 sm:py-16" key={`${block.type}-${index}`}>
                <div className="mx-auto max-w-7xl space-y-8">
                  <SectionIntro description="Cac sections duoc xay dung de doc de, quet nhanh va chuyen doi tot tren mobile." eyebrow="Feature list" title={block.title} />
                  <div className="grid gap-4 md:grid-cols-3">
                    {block.items.map((item, itemIndex) => (
                      <article className="rounded-[1.9rem] border border-stone-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(250,248,244,0.92))] p-6 shadow-[0_18px_36px_rgba(28,25,23,0.05)]" key={`${item.title}-${itemIndex}`}>
                        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-sm font-semibold text-teal-700">
                          {itemIndex + 1}
                        </div>
                        <h3 className="text-lg font-semibold tracking-[-0.03em] text-stone-900">{item.title}</h3>
                        <p className="mt-3 text-sm leading-7 text-stone-600">{item.description}</p>
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            );
          case "rich-text":
            return (
              <section className="px-4 py-10 sm:px-6 sm:py-16" key={`${block.type}-${index}`}>
                <div className="prose-lite mx-auto max-w-4xl rounded-[2.2rem] border border-stone-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(251,249,245,0.92))] p-6 shadow-[0_18px_40px_rgba(28,25,23,0.05)] sm:p-12">
                  {block.title ? <h2>{block.title}</h2> : null}
                  {block.content.split("\n\n").map((paragraph, paragraphIndex) => (
                    <p key={`${paragraphIndex}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
                  ))}
                </div>
              </section>
            );
          case "image":
            return (
              <section className="px-4 py-10 sm:px-6 sm:py-16" key={`${block.type}-${index}`}>
                <figure className="mx-auto max-w-5xl overflow-hidden rounded-[2.2rem] border border-stone-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(251,249,245,0.92))] p-4 shadow-[0_18px_40px_rgba(28,25,23,0.05)]">
                  <Image
                    alt={block.imageAlt}
                    className="w-full rounded-[1.8rem] object-cover"
                    height={720}
                    src={block.imageUrl}
                    width={1280}
                  />
                  {block.caption ? <figcaption className="px-2 pt-4 text-sm text-stone-500">{block.caption}</figcaption> : null}
                </figure>
              </section>
            );
          case "cta":
            return (
              <section className="px-4 py-10 sm:px-6 sm:py-16" key={`${block.type}-${index}`}>
                <div className="mx-auto max-w-5xl overflow-hidden rounded-[2.2rem] border border-stone-200/70 bg-[linear-gradient(135deg,#181512_0%,#2b241d_55%,#0f3d39_100%)] px-6 py-10 text-white shadow-[0_28px_70px_rgba(28,25,23,0.18)] sm:px-10">
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-3">
                      <p className="text-xs uppercase tracking-[0.24em] text-teal-200">CTA section</p>
                      <h2 className="text-balance text-3xl font-semibold tracking-[-0.04em]">{block.title}</h2>
                      {block.description ? <p className="max-w-2xl text-sm leading-7 text-stone-300">{block.description}</p> : null}
                    </div>
                    <Button asChild className="rounded-full px-6 shadow-md" size="lg" variant="secondary">
                      <Link href={block.href}>
                        {block.label}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </section>
            );
          case "testimonials":
            return (
              <section className="px-4 py-10 sm:px-6 sm:py-16" key={`${block.type}-${index}`}>
                <div className="mx-auto max-w-6xl space-y-8">
                  <SectionIntro eyebrow="Testimonials" title={block.title} />
                  <div className="grid gap-4 md:grid-cols-3">
                    {block.items.map((item, itemIndex) => (
                      <blockquote className="rounded-[1.9rem] border border-stone-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(251,249,245,0.92))] p-6 shadow-[0_18px_36px_rgba(28,25,23,0.05)]" key={`${item.author}-${itemIndex}`}>
                        <Quote className="h-7 w-7 text-teal-700" />
                        <p className="mt-4 text-sm leading-7 text-stone-600">{item.quote}</p>
                        <footer className="mt-5 text-sm font-semibold text-stone-900">
                          {item.author}
                          {item.role ? <span className="block font-normal text-stone-500">{item.role}</span> : null}
                        </footer>
                      </blockquote>
                    ))}
                  </div>
                </div>
              </section>
            );
          case "faq":
            return (
              <section className="px-4 py-10 sm:px-6 sm:py-16" key={`${block.type}-${index}`}>
                <div className="mx-auto max-w-5xl space-y-6">
                  <SectionIntro eyebrow="FAQ" title={block.title} />
                  <div className="space-y-3">
                    {block.items.map((item, itemIndex) => (
                      <details className="group rounded-[1.7rem] border border-stone-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(251,249,245,0.92))] p-5 shadow-[0_14px_28px_rgba(28,25,23,0.04)]" key={`${item.question}-${itemIndex}`}>
                        <summary className="cursor-pointer list-none text-base font-semibold tracking-[-0.02em] text-stone-900">
                          {item.question}
                        </summary>
                        <p className="mt-3 text-sm leading-7 text-stone-600">{item.answer}</p>
                      </details>
                    ))}
                  </div>
                </div>
              </section>
            );
          case "contact-form":
            return (
              <section className="px-4 py-10 sm:px-6 sm:py-16" id="contact" key={`${block.type}-${index}`}>
                <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.8fr,1.2fr] lg:items-start">
                  <div className="space-y-5">
                    <Badge className="w-fit rounded-full border border-stone-200 bg-stone-100/80 text-stone-700">Lead capture</Badge>
                    <h2 className="text-3xl font-semibold tracking-[-0.04em] text-stone-950 sm:text-4xl">{block.title}</h2>
                    {block.description ? <p className="text-sm leading-7 text-stone-600">{block.description}</p> : null}
                    <div className="rounded-[1.9rem] border border-stone-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(251,249,245,0.92))] p-5 shadow-[0_18px_36px_rgba(28,25,23,0.05)]">
                      <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">Nhan tu van trong ngay</p>
                      <p className="mt-2 text-sm leading-7 text-stone-600">
                        Form nay goi vao lead database theo tenant hien tai, phu hop cho homepage, service page va contact page.
                      </p>
                    </div>
                  </div>
                  <ContactForm pageId={pageId} sourcePath={sourcePath} tenantId={tenantId} />
                </div>
              </section>
            );
        }
      })}
    </div>
  );
}
