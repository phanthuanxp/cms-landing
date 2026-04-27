export const PAGE_SIZE = 10;
export const PUBLIC_REVALIDATE_SECONDS = 300;
export const CONTACT_FORM_MIN_SUBMIT_MS = 2500;
export const LEAD_DUPLICATE_WINDOW_MINUTES = 10;
export const MAX_EXCERPT_LENGTH = 160;

export function getDefaultPageBlocks(t: {
  heroHeadline: string;
  heroSubheadline: string;
  heroPrimaryCta: string;
  featuresTitle: string;
  feature1Title: string;
  feature1Description: string;
  feature2Title: string;
  feature2Description: string;
  ctaTitle: string;
  ctaDescription: string;
}) {
  return [
    {
      type: "hero",
      headline: t.heroHeadline,
      subheadline: t.heroSubheadline,
      primaryCtaLabel: t.heroPrimaryCta,
      primaryCtaHref: "#contact"
    },
    {
      type: "feature-list",
      title: t.featuresTitle,
      items: [
        {
          title: t.feature1Title,
          description: t.feature1Description
        },
        {
          title: t.feature2Title,
          description: t.feature2Description
        }
      ]
    },
    {
      type: "contact-form",
      title: t.ctaTitle,
      description: t.ctaDescription
    }
  ];
}
