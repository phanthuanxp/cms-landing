import { z } from "zod";

const ctaFields = {
  label: z.string().min(1),
  href: z.string().min(1)
};

export const socialLinksSchema = z.record(z.string(), z.string().url()).default({});

export const themeSettingsSchema = z.object({
  accent: z.string().default("#0f766e"),
  muted: z.string().default("#f5f5f4"),
  heroPattern: z.string().default("grid")
});

export const menuItemInputSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  target: z.string().optional(),
  sortOrder: z.number().int().default(0),
  children: z.array(
    z.object({
      label: z.string().min(1),
      href: z.string().min(1),
      target: z.string().optional(),
      sortOrder: z.number().int().default(0)
    })
  ).optional()
});

export const pageBlockSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("hero"),
    headline: z.string().min(1),
    subheadline: z.string().optional(),
    imageUrl: z.string().url().optional(),
    imageAlt: z.string().optional(),
    primaryCtaLabel: z.string().optional(),
    primaryCtaHref: z.string().optional(),
    secondaryCtaLabel: z.string().optional(),
    secondaryCtaHref: z.string().optional()
  }),
  z.object({
    type: z.literal("feature-list"),
    title: z.string().min(1),
    items: z.array(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1)
      })
    ).min(1)
  }),
  z.object({
    type: z.literal("rich-text"),
    title: z.string().optional(),
    content: z.string().min(1)
  }),
  z.object({
    type: z.literal("image"),
    imageUrl: z.string().url(),
    imageAlt: z.string().min(1),
    caption: z.string().optional()
  }),
  z.object({
    type: z.literal("cta"),
    title: z.string().min(1),
    description: z.string().optional(),
    ...ctaFields
  }),
  z.object({
    type: z.literal("testimonials"),
    title: z.string().min(1),
    items: z.array(
      z.object({
        quote: z.string().min(1),
        author: z.string().min(1),
        role: z.string().optional()
      })
    ).min(1)
  }),
  z.object({
    type: z.literal("faq"),
    title: z.string().min(1),
    items: z.array(
      z.object({
        question: z.string().min(1),
        answer: z.string().min(1)
      })
    ).min(1)
  }),
  z.object({
    type: z.literal("contact-form"),
    title: z.string().min(1),
    description: z.string().optional()
  })
]);

export const pageBlocksSchema = z.array(pageBlockSchema).min(1);

export type PageBlock = z.infer<typeof pageBlockSchema>;
