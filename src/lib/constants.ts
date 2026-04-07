export const PAGE_SIZE = 10;
export const PUBLIC_REVALIDATE_SECONDS = 300;
export const CONTACT_FORM_MIN_SUBMIT_MS = 2500;
export const LEAD_DUPLICATE_WINDOW_MINUTES = 10;
export const MAX_EXCERPT_LENGTH = 160;

export const DEFAULT_PAGE_BLOCKS = [
  {
    type: "hero",
    headline: "Tieu de chinh cho landing page",
    subheadline: "Mo ta ngan gon, ro loi ich va co mot CTA dep.",
    primaryCtaLabel: "Nhan tu van",
    primaryCtaHref: "#contact"
  },
  {
    type: "feature-list",
    title: "Gia tri noi bat",
    items: [
      {
        title: "Nhanh",
        description: "Toi uu cho mobile va toc do."
      },
      {
        title: "De quan tri",
        description: "Quan ly noi dung da tenant trong 1 CMS."
      }
    ]
  },
  {
    type: "contact-form",
    title: "De lai thong tin",
    description: "Chung toi se lien he trong thoi gian som nhat."
  }
] as const;
