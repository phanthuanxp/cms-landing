/**
 * Migration: taxininhbinh.com -> CMS v1
 *
 * Source: https://www.taxininhbinh.com (READ-ONLY)
 * Target: CMS v1 database via Prisma
 *
 * Usage: npx tsx prisma/migrations-data/taxi-ninhbinh-migration.ts
 *
 * Safe to re-run: uses upsert patterns to prevent duplicates.
 * All content imported as DRAFT status.
 * Migration tagged with source: "taxininhbinh.com"
 */

import {
  LeadStatus,
  MediaStatus,
  MenuLocation,
  PageBlockType,
  PageType,
  Prisma,
  PrismaClient,
  PublishStatus,
  TenantMemberRole,
  TenantStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

const MIGRATION_SOURCE = "taxininhbinh.com";
const TENANT_SLUG = "taxi-ninh-binh";

// ─── Site Settings ─────────────────────────────────────────────
const SITE_SETTINGS = {
  siteName: "Taxi Ninh Binh",
  siteTagline: "Xe Rieng Doi Moi - Gia Tron Goi",
  defaultSeoTitle:
    "Taxi Ninh Binh - Dich Vu Dat Xe 24/7 Tai Ninh Binh",
  defaultSeoDescription:
    "Dich vu taxi va xe du lich chuyen nghiep, ho tro dat xe nhanh 24/7. Hotline: 0345 07 6789.",
  businessName: "Taxi Ninh Binh",
  businessEmail: "info@taxininhbinh.com",
  businessPhone: "0345 07 6789",
  businessAddress: "TP Ninh Binh, Ninh Binh",
  businessDescription:
    "Dich vu taxi va xe du lich chuyen nghiep, ho tro dat xe nhanh 24/7.",
  socialLinks: {
    zalo: "https://zalo.me/0345076789",
  },
  themeSettings: {
    primaryColor: "#1a56db",
    accentColor: "#e3a008",
    heroPattern: "taxi",
  },
  locale: "vi-VN",
};

// ─── Pages ─────────────────────────────────────────────────────
interface PageData {
  title: string;
  slug: string;
  pageType: PageType;
  summary?: string;
  seoTitle?: string;
  seoDescription?: string;
  blocks: {
    blockType: PageBlockType;
    payload: Prisma.InputJsonValue;
  }[];
}

const PAGES: PageData[] = [
  // ── Homepage ──
  {
    title: "Trang chu",
    slug: "/",
    pageType: PageType.HOME,
    summary:
      "Taxi Ninh Binh, Ha Noi - Noi Bai. Chuyen Tuyen Ha Noi Ninh Binh 850k.",
    seoTitle:
      "Taxi Ninh Binh - Dich Vu Dat Xe 24/7 Tai Ninh Binh | Taxi Ninh Binh",
    seoDescription:
      "Dich vu taxi va xe du lich chuyen nghiep, ho tro dat xe nhanh 24/7. Hotline: 0345 07 6789.",
    blocks: [
      {
        blockType: PageBlockType.HERO,
        payload: {
          heading:
            "Taxi Ninh Binh, Ha Noi - Noi Bai. Chuyen Tuyen Ha Noi Ninh Binh 850k.",
          subheading:
            "Chung toi ho tro don nhanh, tai xe than thien, xe sach va bao gia minh bach theo tung tuyen.",
          ctaPrimary: {
            label: "Goi ngay 0345 07 6789",
            href: "tel:0345076789",
          },
          ctaSecondary: {
            label: "Chat Zalo",
            href: "https://zalo.me/0345076789",
          },
          highlights: [
            "Co mat nhanh trong khu vuc Ninh Binh",
            "Gia minh bach, khong phu phi map mo",
            "Ho tro khach du lich va khach doan 24/7",
          ],
          source: MIGRATION_SOURCE,
        },
      },
      {
        blockType: PageBlockType.CONTACT_FORM,
        payload: {
          heading: "Nhan Bao Gia Nhanh",
          subheading:
            "Dien thong tin chuyen di de nhan tu van va bao gia phu hop.",
          fields: [
            {
              name: "pickup",
              label: "Diem don",
              type: "text",
              required: true,
            },
            {
              name: "stopover",
              label: "Them diem dung",
              type: "text",
              required: false,
            },
            {
              name: "destination",
              label: "Diem den",
              type: "text",
              required: true,
            },
            {
              name: "datetime",
              label: "Ngay gio don",
              type: "datetime",
              required: true,
            },
            {
              name: "vehicleType",
              label: "Loai xe",
              type: "select",
              required: true,
              options: [
                "Xe 4 cho",
                "Xe 7 cho",
                "Xe 16 cho",
                "Limousine",
                "Xe khac",
              ],
            },
            {
              name: "roundTrip",
              label: "Hai chieu",
              type: "checkbox",
              required: false,
            },
            {
              name: "vatInvoice",
              label: "Xuat hoa don (VAT)",
              type: "checkbox",
              required: false,
            },
            {
              name: "desiredPrice",
              label: "Gia cuoc mong muon (VND)",
              type: "number",
              required: false,
              hint: "Nhap muc gia du kien de doi ngu tu van tuyen xe phu hop nhanh hon.",
            },
            {
              name: "name",
              label: "Ten cua ban",
              type: "text",
              required: true,
            },
            {
              name: "phone",
              label: "So dien thoai / Zalo",
              type: "tel",
              required: true,
            },
          ],
          submitLabel: "Dat Gia Mong Muon",
          disclaimer:
            "Sau khi gui thong tin, doi ngu dieu phoi se lien he xac nhan va bao gia trong thoi gian som nhat.",
          source: MIGRATION_SOURCE,
        },
      },
      {
        blockType: PageBlockType.FEATURE_LIST,
        payload: {
          heading: "Dich vu chinh",
          subheading:
            "Da dang dich vu di lai cho khach dia phuong va khach du lich.",
          features: [
            {
              title: "Taxi noi tinh Ninh Binh",
              description:
                "Don nhanh tai trung tam thanh pho, ga Ninh Binh, khach san va diem du lich.",
              imageAlt: "Taxi noi tinh Ninh Binh",
            },
            {
              title: "Dua don san bay Noi Bai",
              description:
                "Lich trinh ro rang, don dung gio theo lich bay, ho tro hanh ly day du.",
              imageAlt: "Dua don san bay Noi Bai",
            },
            {
              title: "Xe du lich theo chuyen",
              description:
                "Phu hop lich trinh Tam Coc, Trang An, Bai Dinh, Hoa Lu cho nhom gia dinh va cong ty.",
              imageAlt: "Xe du lich theo chuyen",
            },
          ],
          source: MIGRATION_SOURCE,
        },
      },
      {
        blockType: PageBlockType.CUSTOM,
        payload: {
          sectionType: "pricing_preview",
          heading: "Tuyen pho bien / Bang gia tham khao",
          subheading:
            "Tham khao nhanh cac muc gia thuong dung truoc khi dat xe.",
          routes: [
            {
              route: "TP Ninh Binh <-> Tam Coc",
              popular: true,
              prices: [
                {
                  vehicle: "Xe 4 cho",
                  price: "200.000d/chuyen",
                },
                {
                  vehicle: "Xe 7 cho",
                  price: "300.000d/chuyen",
                },
                {
                  vehicle: "Xe 16 cho",
                  price: "500.000d/chuyen",
                },
              ],
              note: "Don tan noi, phu hop khach le va gia dinh di tham quan trong ngay.",
            },
            {
              route: "TP Ninh Binh <-> Trang An",
              popular: true,
              prices: [
                {
                  vehicle: "Xe 4 cho",
                  price: "250.000d/chuyen",
                },
                {
                  vehicle: "Xe 7 cho",
                  price: "350.000d/chuyen",
                },
                {
                  vehicle: "Xe 16 cho",
                  price: "550.000d/chuyen",
                },
              ],
              note: "Lo trinh ro rang, don dung gio theo lich trinh tham quan.",
            },
            {
              route: "TP Ninh Binh <-> SB Noi Bai",
              popular: true,
              prices: [
                {
                  vehicle: "Xe 4 cho",
                  price: "1.100.000d/chuyen",
                },
                {
                  vehicle: "Xe 7 cho",
                  price: "1.250.000d/chuyen",
                },
                {
                  vehicle: "Xe 16 cho",
                  price: "2.400.000d/chuyen",
                },
              ],
              note: "Theo doi gio bay, ho tro chuyen som va chuyen dem dung lich.",
            },
            {
              route: "TP Ninh Binh <-> TP Ha Noi",
              popular: false,
              prices: [
                {
                  vehicle: "Xe 4 cho",
                  price: "950.000d/chuyen",
                },
                {
                  vehicle: "Xe 7 cho",
                  price: "1.100.000d/chuyen",
                },
                {
                  vehicle: "Xe 16 cho",
                  price: "2.200.000d/chuyen",
                },
              ],
              note: "Phu hop khach cong tac, kham chua benh va lich trinh theo gio.",
            },
            {
              route: "TP Ninh Binh <-> Bai Dinh",
              popular: true,
              prices: [
                {
                  vehicle: "Xe 4 cho",
                  price: "350.000d/chuyen",
                },
                {
                  vehicle: "Xe 7 cho",
                  price: "500.000d/chuyen",
                },
                {
                  vehicle: "Xe 16 cho",
                  price: "800.000d/chuyen",
                },
              ],
              note: "Thuan tien cho hanh trinh tham quan trong ngay va di le.",
            },
            {
              route: "TP Ninh Binh <-> Hang Mua",
              popular: true,
              prices: [
                {
                  vehicle: "Xe 4 cho",
                  price: "280.000d/chuyen",
                },
                {
                  vehicle: "Xe 7 cho",
                  price: "420.000d/chuyen",
                },
                {
                  vehicle: "Xe 16 cho",
                  price: "700.000d/chuyen",
                },
              ],
              note: "Linh hoat gio don cho lich trinh tham quan va chup anh.",
            },
          ],
          ctaLabel: "Goi de chot gia tot",
          ctaHref: "tel:0345076789",
          source: MIGRATION_SOURCE,
        },
      },
      {
        blockType: PageBlockType.CUSTOM,
        payload: {
          sectionType: "why_choose_us",
          heading: "Ly do chon chung toi",
          subheading:
            "Cam ket trai nghiem di xe an toan, dung gio va minh bach.",
          reasons: [
            {
              title: "Don dung gio da hen",
              description:
                "Theo doi lich va chu dong lien he de dam bao chuyen di dung ke hoach cua ban.",
            },
            {
              title: "Xe sach, tai xe lich su",
              description:
                "Xe duoc ve sinh thuong xuyen, tai xe than thien va ho tro khach tan tinh.",
            },
            {
              title: "Gia minh bach, khong phu phi",
              description:
                "Thong tin chi phi duoc thong nhat ro rang truoc khi khoi hanh.",
            },
          ],
          source: MIGRATION_SOURCE,
        },
      },
      {
        blockType: PageBlockType.FAQ,
        payload: {
          heading: "Cau hoi thuong gap",
          items: [
            {
              question: "Toi nen dat xe truoc bao lau?",
              answer:
                "Ban nen dat truoc tu 30 phut den 2 gio de duoc dieu xe nhanh va dung loai xe mong muon. Voi chuyen di san bay hoac di tinh, nen dat som hon.",
            },
            {
              question: "Taxi Ninh Binh co don ban dem khong?",
              answer:
                "Co. Dich vu hoat dong 24/7, bao gom ca sang som va ban dem. Ban chi can gui diem don, thoi gian va so dien thoai de xac nhan chuyen.",
            },
            {
              question: "Gia cuoc duoc tinh nhu the nao?",
              answer:
                "Gia cuoc phu thuoc vao quang duong, loai xe, thoi diem don va yeu cau phat sinh. Chung toi se bao gia ro rang truoc khi chot chuyen.",
            },
            {
              question:
                "Co ho tro tuyen Ninh Binh di san bay Noi Bai khong?",
              answer:
                "Co. Day la tuyen thuong xuyen cua chung toi. Ban co the dat xe 4 cho, 7 cho hoac xe lon hon tuy so nguoi va hanh ly.",
            },
            {
              question: "Dich vu co xuat hoa don VAT khong?",
              answer:
                "Co ho tro xuat hoa don VAT theo yeu cau. Ban vui long chon muc VAT khi gui form hoac bao truoc cho dieu phoi vien.",
            },
          ],
          source: MIGRATION_SOURCE,
        },
      },
      {
        blockType: PageBlockType.TESTIMONIALS,
        payload: {
          heading: "Khach hang noi gi ve Taxi Ninh Binh",
          subheading:
            "Phan hoi thuc te tu khach da su dung dich vu.",
          averageRating: 4.9,
          totalReviews: "1.200+",
          testimonials: [
            {
              initials: "NT",
              name: "Nguyen Tuan",
              context: "Ha Noi - Ninh Binh day tour transfer",
              quote:
                "Tai xe den dung gio va ho tro gia dinh chung toi suot chuyen di den Trang An va Tam Coc.",
              verified: true,
            },
            {
              initials: "TH",
              name: "Tran Huyen",
              context: "Ho Chi Minh City - Airport transfer",
              quote:
                "Dich vu dua don san bay den Ninh Binh dien ra suon se, gia ca ro rang va giao tiep lich su truoc khi don khach.",
              verified: true,
            },
            {
              initials: "LM",
              name: "Le Minh",
              context: "Ninh Binh - Business transfer",
              quote:
                "Dich vu dang tin cay cho cac chuyen cong tac voi xe sach se va lai xe an toan.",
              verified: true,
            },
            {
              initials: "AM",
              name: "Anh Minh",
              context: "Tam Coc - Di san bay Noi Bai",
              quote:
                "Dat xe tu Ninh Binh di Noi Bai rat dung gio, tai xe ho tro hanh ly nhiet tinh.",
              verified: true,
            },
            {
              initials: "CH",
              name: "Chi Huong",
              context: "Trang An - Xe du lich gia dinh",
              quote:
                "Gia dinh di Trang An cuoi tuan, xe sach va lai xe than thien voi tre nho.",
              verified: true,
            },
          ],
          source: MIGRATION_SOURCE,
        },
      },
      {
        blockType: PageBlockType.CTA,
        payload: {
          heading: "San sang dat xe ngay hom nay?",
          subheading:
            "Goi hotline hoac nhan Zalo de duoc xac nhan chuyen nhanh.",
          ctaPrimary: {
            label: "Goi hotline 0345 07 6789",
            href: "tel:0345076789",
          },
          ctaSecondary: {
            label: "Nhan Zalo ngay",
            href: "https://zalo.me/0345076789",
          },
          source: MIGRATION_SOURCE,
        },
      },
    ],
  },
  // ── About ──
  {
    title: "Gioi thieu",
    slug: "gioi-thieu",
    pageType: PageType.ABOUT,
    summary:
      "Taxi Ninh Binh dong hanh moi hanh trinh cua ban",
    seoTitle:
      "Gioi Thieu Taxi Ninh Binh - Dich Vu Xe Rieng 24/7 | Taxi Ninh Binh",
    seoDescription:
      "Gioi thieu dich vu taxi va xe du lich chuyen nghiep tai Ninh Binh. Ho tro 24/7, doi xe doi moi, tai xe kinh nghiem.",
    blocks: [
      {
        blockType: PageBlockType.HERO,
        payload: {
          label: "Gioi thieu dich vu",
          heading:
            "Taxi Ninh Binh dong hanh moi hanh trinh cua ban",
          subheading:
            "Taxi Ninh Binh la don vi van hanh dich vu xe rieng va xe du lich tai khu vuc Ninh Binh voi muc tieu phuc vu on dinh, dung gio va minh bach.",
          source: MIGRATION_SOURCE,
        },
      },
      {
        blockType: PageBlockType.FEATURE_LIST,
        payload: {
          features: [
            {
              title: "Gio phuc vu",
              description:
                "Phuc vu 24/7 tat ca cac ngay trong tuan, ke ca le va Tet theo kha nang dieu phoi xe.",
            },
            {
              title: "Khu vuc hoat dong",
              description:
                "Tap trung tai Ninh Binh va cac tuyen lien vung pho bien nhu Ha Noi, san bay Noi Bai.",
            },
            {
              title: "Tuyen chinh",
              description:
                "Noi tinh Ninh Binh, tuyen di Ha Noi, tuyen di Noi Bai va cac tuyen thue xe du lich theo ngay.",
            },
          ],
          source: MIGRATION_SOURCE,
        },
      },
      {
        blockType: PageBlockType.RICH_TEXT,
        payload: {
          heading: "Tin hieu tin cay tu dich vu thuc te",
          content: [
            "Doi xe phuc vu nhieu nhu cau: ca nhan, gia dinh, khach doan",
            "Dieu phoi 24/7, xac nhan nhanh qua hotline va Zalo",
            "Tai xe quen tuyen du lich Ninh Binh va tuyen lien tinh",
            "Bao gia ro rang truoc chuyen, han che phat sinh",
          ],
          serviceAreas: [
            "TP Ninh Binh",
            "Tam Coc",
            "Trang An",
            "Bai Dinh",
            "Hoa Lu",
            "Kim Son",
          ],
          source: MIGRATION_SOURCE,
        },
      },
    ],
  },
  // ── Service index ──
  {
    title: "Dich vu",
    slug: "dich-vu",
    pageType: PageType.SERVICE,
    summary:
      "Danh sach dich vu taxi Ninh Binh theo tung tuyen thuc te",
    seoTitle:
      "Dich Vu Taxi Ninh Binh Theo Tuyen - Dat Xe Nhanh, Gia Minh Bach | Taxi Ninh Binh",
    seoDescription:
      "Chon dung tuyen ban can de xem chi tiet diem don/tra, gia tham khao theo loai xe, cau hoi thuong gap va nut lien he dat xe ngay.",
    blocks: [
      {
        blockType: PageBlockType.HERO,
        payload: {
          label: "Dich vu trong tam",
          heading:
            "Danh sach dich vu taxi Ninh Binh theo tung tuyen thuc te",
          subheading:
            "Chon dung tuyen ban can de xem chi tiet diem don/tra, gia tham khao theo loai xe, cau hoi thuong gap va nut lien he dat xe ngay.",
          source: MIGRATION_SOURCE,
        },
      },
      {
        blockType: PageBlockType.FEATURE_LIST,
        payload: {
          features: [
            {
              title:
                "Taxi Ha Noi Ninh Binh - Xe Rieng Don Tan Noi 24/7",
              description:
                "Trang chuyen tuyen taxi ha noi ninh binh danh cho khach can di chuyen nhanh, an toan va chu dong thoi gian theo lich ca nhan.",
              href: "/taxi-ha-noi-ninh-binh",
            },
            {
              title:
                "Taxi Noi Bai Ninh Binh - Chuyen Tuyen San Bay 24/7",
              description:
                "Trang dich vu taxi noi bai ninh binh tap trung cho khach can don tra san bay dung gio, giam rui ro tre chuyen va toi uu hanh ly.",
              href: "/taxi-noi-bai-ninh-binh",
            },
            {
              title:
                "Taxi Ninh Binh Ha Noi - Don Tra Linh Hoat Theo Lich Cua Ban",
              description:
                "Trang dich vu taxi ninh binh ha noi danh cho khach can chuyen di on dinh, chu dong gio don va ro thong tin chi phi truoc khi khoi hanh.",
              href: "/taxi-ninh-binh-ha-noi",
            },
            {
              title:
                "Taxi Ninh Binh Noi Bai - Dich Vu San Bay Chu Dong 24/7",
              description:
                "Trang dich vu taxi ninh binh noi bai ho tro khach can di san bay dung ke hoach, co the xu ly ca chuyen som, chuyen dem va lich gap.",
              href: "/taxi-ninh-binh-noi-bai",
            },
          ],
          source: MIGRATION_SOURCE,
        },
      },
    ],
  },
  // ── Service sub: Taxi duong dai ──
  {
    title: "Taxi duong dai tu Ninh Binh",
    slug: "dich-vu/taxi-duong-dai",
    pageType: PageType.SERVICE,
    summary:
      "Chuyen tuyen lien tinh cho khach gia dinh, khach cong tac va nhom du lich can xe rieng.",
    seoTitle:
      "Taxi Duong Dai Tu Ninh Binh | Taxi Ninh Binh",
    seoDescription:
      "Chuyen tuyen lien tinh cho khach gia dinh, khach cong tac va nhom du lich can xe rieng. Lich trinh duoc tu van chi tiet.",
    blocks: [
      {
        blockType: PageBlockType.HERO,
        payload: {
          heading: "Taxi duong dai tu Ninh Binh",
          subheading:
            "Chuyen tuyen lien tinh cho khach gia dinh, khach cong tac va nhom du lich can xe rieng. Lich trinh duoc tu van chi tiet theo thoi gian di, diem dung va so luong hanh khach.",
          source: MIGRATION_SOURCE,
        },
      },
      {
        blockType: PageBlockType.FEATURE_LIST,
        payload: {
          features: [
            {
              title: "Tu van lo trinh",
              description:
                "Ho tro goi y cung duong va khung gio xuat phat de toi uu thoi gian di chuyen.",
            },
            {
              title: "Chu dong diem dung",
              description:
                "Co the bo tri dung nghi hop ly theo nhu cau thuc te cua hanh khach.",
            },
            {
              title: "Cam ket an toan",
              description:
                "Lai xe giau kinh nghiem duong dai, thai do lich su va ho tro tan tinh.",
            },
          ],
          source: MIGRATION_SOURCE,
        },
      },
    ],
  },
  // ── Service sub: Thue xe du lich ──
  {
    title: "Thue xe du lich Ninh Binh",
    slug: "dich-vu/thue-xe-du-lich",
    pageType: PageType.SERVICE,
    summary:
      "Danh cho gia dinh, nhom ban va doan cong ty can xe linh hoat theo diem tham quan.",
    seoTitle:
      "Thue Xe Du Lich Ninh Binh | Taxi Ninh Binh",
    seoDescription:
      "Thue xe du lich Ninh Binh theo lich trinh rieng. Ho tro len lich trinh va sap xep loai xe phu hop theo so luong khach.",
    blocks: [
      {
        blockType: PageBlockType.HERO,
        payload: {
          heading:
            "Thue xe du lich Ninh Binh theo lich trinh rieng",
          subheading:
            "Danh cho gia dinh, nhom ban va doan cong ty can xe linh hoat theo diem tham quan. Chung toi ho tro len lich trinh va sap xep loai xe phu hop theo so luong khach.",
          source: MIGRATION_SOURCE,
        },
      },
      {
        blockType: PageBlockType.FEATURE_LIST,
        payload: {
          features: [
            {
              title: "Lich trinh goi y trong ngay",
              description:
                "Tam Coc - Trang An - Bai Dinh - Hoa Lu - Hang Mua voi thoi gian dung hop ly cho tung diem.",
            },
            {
              title: "Lich trinh theo yeu cau",
              description:
                "Tuy chinh diem don, diem tra va diem tham quan theo nhu cau rieng cua doan.",
            },
          ],
          source: MIGRATION_SOURCE,
        },
      },
    ],
  },
  // ── Pricing ──
  {
    title: "Bang gia",
    slug: "bang-gia",
    pageType: PageType.CUSTOM,
    summary:
      "Bang gia taxi Ninh Binh theo tuyen pho bien",
    seoTitle:
      "Bang Gia Taxi Ninh Binh | Taxi Ninh Binh",
    seoDescription:
      "Muc gia giup ban uoc luong chi phi truoc chuyen di. Gia thuc te co the thay doi theo thoi diem, diem don va yeu cau phat sinh.",
    blocks: [
      {
        blockType: PageBlockType.HERO,
        payload: {
          label: "Bang gia tham khao",
          heading:
            "Bang gia taxi Ninh Binh theo tuyen pho bien",
          subheading:
            "Muc gia duoi day giup ban uoc luong chi phi truoc chuyen di. Gia thuc te co the thay doi theo thoi diem, diem don va yeu cau phat sinh cua tung lich trinh.",
          source: MIGRATION_SOURCE,
        },
      },
      {
        blockType: PageBlockType.CUSTOM,
        payload: {
          sectionType: "pricing_table",
          routes: [
            {
              route: "TP Ninh Binh <-> Tam Coc",
              popular: true,
              prices: [
                { vehicle: "Xe 4 cho", price: "200.000d/chuyen" },
                { vehicle: "Xe 7 cho", price: "300.000d/chuyen" },
                { vehicle: "Xe 16 cho", price: "500.000d/chuyen" },
              ],
              note: "Don tan noi, phu hop khach le va gia dinh di tham quan trong ngay.",
            },
            {
              route: "TP Ninh Binh <-> Trang An",
              popular: true,
              prices: [
                { vehicle: "Xe 4 cho", price: "250.000d/chuyen" },
                { vehicle: "Xe 7 cho", price: "350.000d/chuyen" },
                { vehicle: "Xe 16 cho", price: "550.000d/chuyen" },
              ],
              note: "Lo trinh ro rang, don dung gio theo lich trinh tham quan.",
            },
            {
              route: "TP Ninh Binh <-> SB Noi Bai",
              popular: true,
              prices: [
                { vehicle: "Xe 4 cho", price: "1.100.000d/chuyen" },
                { vehicle: "Xe 7 cho", price: "1.250.000d/chuyen" },
                { vehicle: "Xe 16 cho", price: "2.400.000d/chuyen" },
              ],
              note: "Theo doi gio bay, ho tro chuyen som va chuyen dem dung lich.",
            },
            {
              route: "TP Ninh Binh <-> TP Ha Noi",
              popular: false,
              prices: [
                { vehicle: "Xe 4 cho", price: "950.000d/chuyen" },
                { vehicle: "Xe 7 cho", price: "1.100.000d/chuyen" },
                { vehicle: "Xe 16 cho", price: "2.200.000d/chuyen" },
              ],
              note: "Phu hop khach cong tac, kham chua benh va lich trinh theo gio.",
            },
            {
              route: "TP Ninh Binh <-> Bai Dinh",
              popular: true,
              prices: [
                { vehicle: "Xe 4 cho", price: "350.000d/chuyen" },
                { vehicle: "Xe 7 cho", price: "500.000d/chuyen" },
                { vehicle: "Xe 16 cho", price: "800.000d/chuyen" },
              ],
              note: "Thuan tien cho hanh trinh tham quan trong ngay va di le.",
            },
            {
              route: "TP Ninh Binh <-> Hang Mua",
              popular: true,
              prices: [
                { vehicle: "Xe 4 cho", price: "280.000d/chuyen" },
                { vehicle: "Xe 7 cho", price: "420.000d/chuyen" },
                { vehicle: "Xe 16 cho", price: "700.000d/chuyen" },
              ],
              note: "Linh hoat gio don cho lich trinh tham quan va chup anh.",
            },
          ],
          footer: "Cam ket 100% xe rieng doi moi - Phuc vu 24/24!",
          source: MIGRATION_SOURCE,
        },
      },
    ],
  },
  // ── Contact ──
  {
    title: "Lien he",
    slug: "lien-he",
    pageType: PageType.CONTACT,
    summary: "Lien he Taxi Ninh Binh",
    seoTitle:
      "Lien He Taxi Ninh Binh - Dat Xe Nhanh 24/7 | Taxi Ninh Binh",
    seoDescription:
      "Lien he truc tiep voi doi dieu phoi de duoc ho tro nhanh. Hotline: 0345 07 6789.",
    blocks: [
      {
        blockType: PageBlockType.HERO,
        payload: {
          label: "Lien he nhanh",
          heading: "Lien he Taxi Ninh Binh",
          subheading:
            "Ban can dat xe gap, tu van lo trinh hoac xac nhan bang gia theo tuyen cu the? Hay lien he truc tiep voi doi dieu phoi de duoc ho tro nhanh.",
          source: MIGRATION_SOURCE,
        },
      },
      {
        blockType: PageBlockType.CUSTOM,
        payload: {
          sectionType: "contact_channels",
          channels: [
            {
              type: "hotline",
              label: "Hotline",
              value: "0345 07 6789",
              href: "tel:0345076789",
              description:
                "Xac nhan chuyen nhanh, ho tro lich gap va chuyen ngoai gio.",
            },
            {
              type: "zalo",
              label: "Zalo",
              value: "0345076789",
              href: "https://zalo.me/0345076789",
              description:
                "Phu hop gui vi tri don, lo trinh va dieu chinh thong tin chuyen.",
            },
            {
              type: "email",
              label: "Email",
              value: "info@taxininhbinh.com",
              href: "mailto:info@taxininhbinh.com",
              description:
                "Kenh lien he cho doi tac, hop dong dai han va yeu cau doanh nghiep.",
            },
          ],
          serviceAreas: [
            "TP Ninh Binh",
            "Tam Coc",
            "Trang An",
            "Bai Dinh",
            "Hoa Lu",
            "Kim Son",
          ],
          businessInfo: {
            hours: "24/7 (tat ca cac ngay trong tuan)",
            mainChannels: "Hotline va Zalo",
            services:
              "Taxi noi tinh, lien tinh, xe du lich",
            contactMethods: "Dien thoai, Zalo, Email",
          },
          source: MIGRATION_SOURCE,
        },
      },
    ],
  },
  // ── FAQ ──
  {
    title: "FAQ",
    slug: "faq",
    pageType: PageType.CUSTOM,
    summary:
      "Cac cau hoi thuong gap ve dich vu Taxi Ninh Binh",
    seoTitle:
      "FAQ Taxi Ninh Binh - Cau Hoi Thuong Gap | Taxi Ninh Binh",
    seoDescription:
      "Trang tong hop nhung thac mac pho bien truoc khi dat xe. Goi hotline hoac nhan Zalo de duoc ho tro.",
    blocks: [
      {
        blockType: PageBlockType.HERO,
        payload: {
          label: "Ho tro nhanh",
          heading:
            "Cac cau hoi thuong gap ve dich vu Taxi Ninh Binh",
          subheading:
            "Trang nay tong hop nhung thac mac pho bien truoc khi dat xe. Neu ban can xac nhan nhanh theo lich trinh cu the, hay goi hotline hoac nhan Zalo de doi dieu phoi ho tro truc tiep.",
          source: MIGRATION_SOURCE,
        },
      },
      {
        blockType: PageBlockType.FAQ,
        payload: {
          items: [
            {
              question: "Lam sao de dat taxi nhanh?",
              answer:
                "Ban co the goi hotline 0345 07 6789, nhan Zalo hoac gui form bao gia tren website de duoc xac nhan chuyen som.",
            },
            {
              question:
                "Taxi Ninh Binh ho tro thanh toan nhu the nao?",
              answer:
                "Chung toi ho tro tien mat, chuyen khoan va mot so hinh thuc vi dien tu theo xac nhan cua dieu phoi.",
            },
            {
              question:
                "Co the huy hoac doi lich chuyen da dat khong?",
              answer:
                "Co. Ban vui long bao som de duoc ho tro doi lich. Mot so tuyen xa hoac gio cao diem co the ap dung dieu kien rieng.",
            },
            {
              question: "Toi nen dat xe truoc bao lau?",
              answer:
                "Ban nen dat truoc tu 30 phut den 2 gio de duoc dieu xe nhanh va dung loai xe mong muon. Voi chuyen di san bay hoac di tinh, nen dat som hon.",
            },
            {
              question:
                "Taxi Ninh Binh co don ban dem khong?",
              answer:
                "Co. Dich vu hoat dong 24/7, bao gom ca sang som va ban dem.",
            },
            {
              question:
                "Gia cuoc duoc tinh nhu the nao?",
              answer:
                "Gia cuoc phu thuoc vao quang duong, loai xe, thoi diem don va yeu cau phat sinh. Chung toi se bao gia ro rang truoc khi chot chuyen.",
            },
            {
              question:
                "Co ho tro tuyen Ninh Binh di san bay Noi Bai khong?",
              answer:
                "Co. Day la tuyen thuong xuyen cua chung toi. Ban co the dat xe 4 cho, 7 cho hoac xe lon hon tuy so nguoi va hanh ly.",
            },
            {
              question:
                "Dich vu co xuat hoa don VAT khong?",
              answer:
                "Co ho tro xuat hoa don VAT theo yeu cau.",
            },
          ],
          source: MIGRATION_SOURCE,
        },
      },
    ],
  },
  // ── Privacy Policy ──
  {
    title: "Chinh sach bao mat",
    slug: "chinh-sach-bao-mat",
    pageType: PageType.CUSTOM,
    summary:
      "Chinh sach bao mat thong tin khach hang cua Taxi Ninh Binh",
    seoTitle:
      "Chinh Sach Bao Mat | Taxi Ninh Binh",
    seoDescription:
      "Taxi Ninh Binh cam ket bao ve thong tin ca nhan cua khach hang khi su dung website va dich vu dat xe.",
    blocks: [
      {
        blockType: PageBlockType.RICH_TEXT,
        payload: {
          heading: "Chinh sach bao mat",
          intro:
            "Taxi Ninh Binh cam ket bao ve thong tin ca nhan cua khach hang khi su dung website va dich vu dat xe.",
          sections: [
            {
              title: "1. Thong tin thu thap",
              content:
                "Chung toi co the thu thap cac thong tin can thiet nhu diem di, diem den, thoi gian don, so dien thoai/Zalo de phuc vu dieu phoi xe va ho tro khach hang.",
            },
            {
              title: "2. Muc dich su dung du lieu",
              content:
                "Du lieu duoc dung de xac nhan chuyen, lien he tu van bao gia, nang cao chat luong dich vu va xu ly van de phat sinh trong qua trinh van chuyen.",
            },
            {
              title: "3. Chia se thong tin",
              content:
                "Chung toi khong ban hoac trao doi du lieu khach hang cho ben thu ba ngoai pham vi can thiet de cung cap dich vu theo yeu cau hop phap.",
            },
            {
              title: "4. Quyen cua khach hang",
              content:
                "Ban co the yeu cau kiem tra, chinh sua hoac xoa thong tin ca nhan bang cach lien he truc tiep qua hotline hoac email ho tro.",
            },
            {
              title: "5. Lien he",
              content:
                "Hotline: 0345 07 6789 - Email: info@taxininhbinh.com",
            },
          ],
          source: MIGRATION_SOURCE,
        },
      },
    ],
  },
  // ── Terms of Service ──
  {
    title: "Dieu khoan su dung",
    slug: "dieu-khoan-su-dung",
    pageType: PageType.CUSTOM,
    summary:
      "Dieu khoan su dung dich vu Taxi Ninh Binh",
    seoTitle:
      "Dieu Khoan Su Dung | Taxi Ninh Binh",
    seoDescription:
      "Khi su dung website va dat dich vu tai Taxi Ninh Binh, ban dong y voi cac dieu khoan duoi day.",
    blocks: [
      {
        blockType: PageBlockType.RICH_TEXT,
        payload: {
          heading: "Dieu khoan su dung",
          intro:
            "Khi su dung website va dat dich vu tai Taxi Ninh Binh, ban dong y voi cac dieu khoan duoi day.",
          sections: [
            {
              title: "1. Xac nhan thong tin chuyen di",
              content:
                "Khach hang can cung cap thong tin chinh xac ve diem don, diem den, thoi gian va so dien thoai lien he de dam bao dieu phoi xe dung yeu cau.",
            },
            {
              title: "2. Gia va thanh toan",
              content:
                "Gia chuyen di duoc tu van truoc khi xac nhan dat xe. Cac khoan phat sinh (neu co) se duoc thong bao ro dua tren thay doi thuc te cua hanh trinh.",
            },
            {
              title: "3. Huy/chuyen lich",
              content:
                "Khach hang vui long thong bao som khi can thay doi lich de chung toi ho tro tot nhat. Mot so chuyen dac thu co the phat sinh chi phi theo muc do thay doi.",
            },
            {
              title: "4. Trach nhiem cua hai ben",
              content:
                "Chung toi cam ket phuc vu dung theo thong tin da xac nhan. Khach hang cam ket tuan thu quy dinh an toan khi di chuyen va phoi hop voi tai xe trong qua trinh don tra.",
            },
            {
              title: "5. Lien he ho tro",
              content:
                "Moi thac mac vui long lien he hotline 0345 07 6789 hoac email info@taxininhbinh.com.",
            },
          ],
          source: MIGRATION_SOURCE,
        },
      },
    ],
  },
];

// ─── Route / SEO Landing Pages ─────────────────────────────────
interface RouteLandingPage {
  title: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  heroHeading: string;
  heroSubheading: string;
  prices: { vehicle: string; price: string; note: string }[];
  bodyContent: string;
}

const ROUTE_PAGES: RouteLandingPage[] = [
  {
    title: "Taxi Ha Noi Ninh Binh",
    slug: "taxi-ha-noi-ninh-binh",
    seoTitle:
      "Taxi Ha Noi Ninh Binh - Dat Xe Rieng Nhanh, Gia Ro Rang | Taxi Ninh Binh",
    seoDescription:
      "Trang chuyen tuyen taxi ha noi ninh binh danh cho khach can di chuyen nhanh, an toan va chu dong thoi gian theo lich ca nhan.",
    heroHeading:
      "Taxi Ha Noi Ninh Binh - Xe Rieng Don Tan Noi 24/7",
    heroSubheading:
      "Trang chuyen tuyen taxi ha noi ninh binh danh cho khach can di chuyen nhanh, an toan va chu dong thoi gian theo lich ca nhan.",
    prices: [
      {
        vehicle: "Xe 4 cho",
        price: "1.100.000d/chuyen",
        note: "Phu hop 1-3 khach, hanh ly gon",
      },
      {
        vehicle: "Xe 7 cho",
        price: "1.300.000d/chuyen",
        note: "Phu hop gia dinh 4-6 khach",
      },
      {
        vehicle: "Xe 16 cho",
        price: "1.700.000d/chuyen",
        note: "Phu hop nhom dong va khach doan",
      },
    ],
    bodyContent:
      "Dich vu taxi ha noi ninh binh phu hop cho ca khach di cong tac, khach du lich lan gia dinh can lich trinh ro rang. Diem manh cua tuyen Ha Noi - Ninh Binh la tinh linh hoat: ban co the dat xe theo gio co dinh hoac theo khung gio mong muon, dong thoi chu dong them diem dung neu can.",
  },
  {
    title: "Taxi Noi Bai Ninh Binh",
    slug: "taxi-noi-bai-ninh-binh",
    seoTitle:
      "Taxi Noi Bai Ninh Binh - Don Dung Gio Bay, Xe Rieng 24/7 | Taxi Ninh Binh",
    seoDescription:
      "Trang dich vu taxi noi bai ninh binh tap trung cho khach can don tra san bay dung gio, giam rui ro tre chuyen va toi uu hanh ly.",
    heroHeading:
      "Taxi Noi Bai Ninh Binh - Chuyen Tuyen San Bay 24/7",
    heroSubheading:
      "Trang dich vu taxi noi bai ninh binh tap trung cho khach can don tra san bay dung gio, giam rui ro tre chuyen va toi uu hanh ly.",
    prices: [
      {
        vehicle: "Xe 4 cho",
        price: "1.300.000d/chuyen",
        note: "Phu hop khach ca nhan hoac cap doi",
      },
      {
        vehicle: "Xe 7 cho",
        price: "1.500.000d/chuyen",
        note: "Phu hop gia dinh co hanh ly",
      },
      {
        vehicle: "Xe 16 cho",
        price: "1.900.000d/chuyen",
        note: "Phu hop nhom dong, doan tour",
      },
    ],
    bodyContent:
      "Dich vu taxi noi bai ninh binh phu hop cho ca khach di cong tac, khach du lich lan gia dinh can lich trinh ro rang. Diem manh cua tuyen Noi Bai - Ninh Binh la tinh linh hoat: ban co the dat xe theo gio co dinh hoac theo khung gio mong muon.",
  },
  {
    title: "Taxi Ninh Binh Ha Noi",
    slug: "taxi-ninh-binh-ha-noi",
    seoTitle:
      "Taxi Ninh Binh Ha Noi - Dat Xe Nhanh, Dua Don Linh Hoat | Taxi Ninh Binh",
    seoDescription:
      "Trang dich vu taxi ninh binh ha noi danh cho khach can chuyen di on dinh, chu dong gio don va ro thong tin chi phi truoc khi khoi hanh.",
    heroHeading:
      "Taxi Ninh Binh Ha Noi - Don Tra Linh Hoat Theo Lich Cua Ban",
    heroSubheading:
      "Trang dich vu taxi ninh binh ha noi danh cho khach can chuyen di on dinh, chu dong gio don va ro thong tin chi phi truoc khi khoi hanh.",
    prices: [
      {
        vehicle: "Xe 4 cho",
        price: "1.150.000d/chuyen",
        note: "Phu hop di ca nhan hoac cap doi",
      },
      {
        vehicle: "Xe 7 cho",
        price: "1.350.000d/chuyen",
        note: "Phu hop gia dinh va khach co them hanh ly",
      },
      {
        vehicle: "Xe 16 cho",
        price: "1.700.000d/chuyen",
        note: "Phu hop khach doan, nhom cong tac",
      },
    ],
    bodyContent:
      "Dich vu taxi ninh binh ha noi phu hop cho ca khach di cong tac, khach du lich lan gia dinh can lich trinh ro rang. Diem manh cua tuyen Ninh Binh - Ha Noi la tinh linh hoat.",
  },
  {
    title: "Taxi Ninh Binh Noi Bai",
    slug: "taxi-ninh-binh-noi-bai",
    seoTitle:
      "Taxi Ninh Binh Noi Bai - Chuyen Tuyen San Bay, Don Chuan Gio | Taxi Ninh Binh",
    seoDescription:
      "Trang dich vu taxi ninh binh noi bai ho tro khach can di san bay dung ke hoach, co the xu ly ca chuyen som, chuyen dem va lich gap.",
    heroHeading:
      "Taxi Ninh Binh Noi Bai - Dich Vu San Bay Chu Dong 24/7",
    heroSubheading:
      "Trang dich vu taxi ninh binh noi bai ho tro khach can di san bay dung ke hoach, co the xu ly ca chuyen som, chuyen dem va lich gap.",
    prices: [
      {
        vehicle: "Xe 4 cho",
        price: "1.300.000d/chuyen",
        note: "Phu hop 1-3 khach, lich trinh gon",
      },
      {
        vehicle: "Xe 7 cho",
        price: "1.550.000d/chuyen",
        note: "Phu hop gia dinh nhieu hanh ly",
      },
      {
        vehicle: "Xe 16 cho",
        price: "1.950.000d/chuyen",
        note: "Phu hop doan du lich, khach cong ty",
      },
    ],
    bodyContent:
      "Dich vu taxi ninh binh noi bai phu hop cho ca khach di cong tac, khach du lich lan gia dinh can lich trinh ro rang. Diem manh cua tuyen Ninh Binh - Noi Bai la tinh linh hoat.",
  },
];

// ─── Blog Data ─────────────────────────────────────────────────
const BLOG_CATEGORIES = [
  {
    name: "Cam nang du lich",
    slug: "travel-guide",
    description: "Chia se kinh nghiem du lich Ninh Binh va cac tinh lan can.",
  },
  {
    name: "Meo dat xe",
    slug: "taxi-tips",
    description: "Huong dan dat xe taxi va kinh nghiem di lai thuc te.",
  },
];

const BLOG_POSTS = [
  {
    title: "Kinh nghiem chon taxi phu hop cho chuyen di gia dinh",
    slug: "choose-right-taxi-for-family-trip",
    excerpt:
      "Checklist don gian giup dat xe dung nhu cau khi di cung tre em va nguoi lon tuoi.",
    categorySlug: "taxi-tips",
    publishedAt: new Date("2026-04-02T09:30:00.000Z"),
    seoTitle:
      "Family taxi booking tips in Ninh Binh | Taxi Ninh Binh",
    seoDescription:
      "Checklist don gian giup dat xe dung nhu cau khi di cung tre em va nguoi lon tuoi.",
    content: `## Chon dong xe theo so nguoi va hanh ly

Neu co nhieu hanh ly, ban nen uu tien xe 7 cho de thoai mai hon.

## Xac nhan ro diem don, diem tra

Thong tin cang ro thi thoi gian dieu phoi cang nhanh va chinh xac.

## Dat truoc vao gio cao diem

Cuoi tuan va ngay le nen dat som de giu dung loai xe phu hop.

## Kiem tra phuong an du phong

Ban co the hoi truoc phuong an doi gio hoac thay diem tra neu lich trinh phat sinh.`,
  },
  {
    title: "Top 7 diem du lich Ninh Binh nen di trong mot ngay",
    slug: "top-7-places-to-visit-in-ninh-binh",
    excerpt:
      "Lich trinh goi y cho khach lan dau den Ninh Binh, toi uu thoi gian va cung duong.",
    categorySlug: "travel-guide",
    publishedAt: new Date("2026-04-01T08:00:00.000Z"),
    seoTitle:
      "Top places to visit in Ninh Binh - Taxi Ninh Binh | Taxi Ninh Binh",
    seoDescription:
      "Lich trinh goi y cho khach lan dau den Ninh Binh, toi uu thoi gian va cung duong.",
    content: `## Bat dau tu Trang An vao buoi sang

De tranh dong, ban nen di Trang An truoc roi chuyen ve Tam Coc vao cuoi buoi sang.

## An trua gan khu du lich

Chon quan an gan tuyen duong de tiet kiem thoi gian di chuyen.

## Buoi chieu tham quan Hang Mua hoac Bai Dinh

Tuy suc khoe va quy thoi gian, ban co the chon mot trong hai diem de khong bi qua tai lich trinh.

## Goi y dat xe

Nen dat taxi rieng theo ngay de chu dong diem dung, phu hop gia dinh co tre nho hoac nguoi lon tuoi.`,
  },
];

// ─── Menu Data ─────────────────────────────────────────────────
const MENUS = {
  primary: {
    name: "Menu chinh",
    slug: "primary-menu",
    location: MenuLocation.HEADER,
    items: [
      { label: "Trang chu", href: "/", sortOrder: 1 },
      { label: "Dich vu", href: "/dich-vu", sortOrder: 2 },
      { label: "Bang gia", href: "/bang-gia", sortOrder: 3 },
      { label: "Blog", href: "/blog", sortOrder: 4 },
      { label: "Gioi thieu", href: "/gioi-thieu", sortOrder: 5 },
      { label: "Lien he", href: "/lien-he", sortOrder: 6 },
    ],
  },
  footer: {
    name: "Footer - Dich vu & thong tin",
    slug: "footer-services",
    location: MenuLocation.FOOTER,
    items: [
      { label: "Trang chu", href: "/", sortOrder: 1 },
      { label: "Gioi thieu", href: "/gioi-thieu", sortOrder: 2 },
      { label: "Dich vu", href: "/dich-vu", sortOrder: 3 },
      { label: "Bang gia", href: "/bang-gia", sortOrder: 4 },
      { label: "FAQ", href: "/faq", sortOrder: 5 },
      { label: "Lien he", href: "/lien-he", sortOrder: 6 },
    ],
  },
  legal: {
    name: "Footer - Legal",
    slug: "footer-legal",
    location: MenuLocation.LEGAL,
    items: [
      { label: "Blog", href: "/blog", sortOrder: 1 },
      {
        label: "Chinh sach bao mat",
        href: "/chinh-sach-bao-mat",
        sortOrder: 2,
      },
      {
        label: "Dieu khoan su dung",
        href: "/dieu-khoan-su-dung",
        sortOrder: 3,
      },
    ],
  },
};

// ─── Migration Logic ───────────────────────────────────────────

async function main() {
  console.log("=== Taxi Ninh Binh Migration ===");
  console.log(`Source: ${MIGRATION_SOURCE}`);
  console.log(`Target tenant: ${TENANT_SLUG}`);
  console.log("");

  // Get or validate super admin user
  const superAdmin = await prisma.user.findFirst({
    where: { globalRole: "SUPER_ADMIN", deletedAt: null },
  });
  if (!superAdmin) {
    throw new Error(
      "No SUPER_ADMIN user found. Run seed first: npx prisma db seed"
    );
  }
  console.log(`Using admin user: ${superAdmin.email} (${superAdmin.id})`);

  // 1. Create tenant
  console.log("\n--- Step 1: Create Tenant ---");
  const tenant = await prisma.tenant.upsert({
    where: { slug: TENANT_SLUG },
    update: {
      status: TenantStatus.ACTIVE,
      deletedAt: null,
      updatedById: superAdmin.id,
    },
    create: {
      slug: TENANT_SLUG,
      status: TenantStatus.ACTIVE,
      createdById: superAdmin.id,
      updatedById: superAdmin.id,
    },
  });
  console.log(`Tenant: ${tenant.slug} (${tenant.id})`);

  // Create tenant membership for super admin
  await prisma.tenantMembership.upsert({
    where: {
      tenantId_userId: {
        tenantId: tenant.id,
        userId: superAdmin.id,
      },
    },
    update: {
      role: TenantMemberRole.TENANT_ADMIN,
      deletedAt: null,
    },
    create: {
      tenantId: tenant.id,
      userId: superAdmin.id,
      role: TenantMemberRole.TENANT_ADMIN,
      isDefault: false,
      createdById: superAdmin.id,
    },
  });
  console.log("Admin membership ensured.");

  // Create domain mapping
  await prisma.tenantDomain.upsert({
    where: { host: "taxininhbinh.com" },
    update: {
      tenantId: tenant.id,
      isPrimary: true,
      isActive: true,
      deletedAt: null,
    },
    create: {
      tenantId: tenant.id,
      host: "taxininhbinh.com",
      isPrimary: true,
      isActive: true,
      createdById: superAdmin.id,
    },
  });
  console.log("Domain mapping: taxininhbinh.com -> tenant");

  // 2. Site settings
  console.log("\n--- Step 2: Site Settings ---");
  await prisma.siteSettings.upsert({
    where: { tenantId: tenant.id },
    update: {
      ...SITE_SETTINGS,
      deletedAt: null,
      updatedById: superAdmin.id,
    },
    create: {
      tenantId: tenant.id,
      ...SITE_SETTINGS,
      createdById: superAdmin.id,
      updatedById: superAdmin.id,
    },
  });
  console.log("Site settings created/updated.");

  // 3. Pages + blocks
  console.log("\n--- Step 3: Pages ---");
  let pageCount = 0;
  let blockCount = 0;

  for (const pageData of PAGES) {
    const page = await prisma.page.upsert({
      where: {
        tenantId_slug: {
          tenantId: tenant.id,
          slug: pageData.slug,
        },
      },
      update: {
        title: pageData.title,
        pageType: pageData.pageType,
        summary: pageData.summary,
        seoTitle: pageData.seoTitle,
        seoDescription: pageData.seoDescription,
        status: PublishStatus.DRAFT,
        deletedAt: null,
        updatedById: superAdmin.id,
      },
      create: {
        tenantId: tenant.id,
        title: pageData.title,
        slug: pageData.slug,
        pageType: pageData.pageType,
        summary: pageData.summary,
        seoTitle: pageData.seoTitle,
        seoDescription: pageData.seoDescription,
        status: PublishStatus.DRAFT,
        createdById: superAdmin.id,
        updatedById: superAdmin.id,
      },
    });

    // Replace blocks
    await prisma.pageBlock.deleteMany({
      where: { pageId: page.id },
    });
    await prisma.pageBlock.createMany({
      data: pageData.blocks.map((block, index) => ({
        tenantId: tenant.id,
        pageId: page.id,
        blockType: block.blockType,
        position: index + 1,
        payload: block.payload,
        createdById: superAdmin.id,
        updatedById: superAdmin.id,
      })),
    });

    pageCount++;
    blockCount += pageData.blocks.length;
    console.log(
      `  Page: ${pageData.slug} (${pageData.blocks.length} blocks)`
    );
  }

  // 4. Route landing pages
  console.log("\n--- Step 4: Route Landing Pages ---");
  for (const route of ROUTE_PAGES) {
    const page = await prisma.page.upsert({
      where: {
        tenantId_slug: {
          tenantId: tenant.id,
          slug: route.slug,
        },
      },
      update: {
        title: route.title,
        pageType: PageType.LANDING,
        seoTitle: route.seoTitle,
        seoDescription: route.seoDescription,
        status: PublishStatus.DRAFT,
        deletedAt: null,
        updatedById: superAdmin.id,
      },
      create: {
        tenantId: tenant.id,
        title: route.title,
        slug: route.slug,
        pageType: PageType.LANDING,
        seoTitle: route.seoTitle,
        seoDescription: route.seoDescription,
        status: PublishStatus.DRAFT,
        createdById: superAdmin.id,
        updatedById: superAdmin.id,
      },
    });

    const blocks: {
      blockType: PageBlockType;
      payload: Prisma.InputJsonValue;
    }[] = [
      {
        blockType: PageBlockType.HERO,
        payload: {
          label: `Dich vu ${route.slug.replace(/-/g, " ")}`,
          heading: route.heroHeading,
          subheading: route.heroSubheading,
          ctaPrimary: {
            label: "Goi dat xe 0345 07 6789",
            href: "tel:0345076789",
          },
          ctaSecondary: {
            label: "Nhan bao gia qua Zalo",
            href: "https://zalo.me/0345076789",
          },
          ctaTertiary: {
            label: "Xem bang gia taxi Ninh Binh",
            href: "/bang-gia",
          },
          source: MIGRATION_SOURCE,
        },
      },
      {
        blockType: PageBlockType.CUSTOM,
        payload: {
          sectionType: "route_pricing",
          heading: "Bang gia tham khao theo loai xe",
          disclaimer:
            "Bang gia chi mang tinh chat tham khao. Goi ngay de nhan duoc bao gia tot nhat.",
          prices: route.prices,
          source: MIGRATION_SOURCE,
        },
      },
      {
        blockType: PageBlockType.RICH_TEXT,
        payload: {
          heading: `Thong tin chi tiet tuyen ${route.slug.replace(/-/g, " ")}`,
          content: route.bodyContent,
          source: MIGRATION_SOURCE,
        },
      },
      {
        blockType: PageBlockType.CTA,
        payload: {
          heading: "Can tu van tuyen di ngay?",
          subheading:
            "Goi hotline de duoc dieu phoi xe nhanh hoac nhan Zalo de gui diem don chi tiet va nhan bao gia phu hop.",
          ctaPrimary: {
            label: "Goi 0345 07 6789",
            href: "tel:0345076789",
          },
          ctaSecondary: {
            label: "Chat Zalo",
            href: "https://zalo.me/0345076789",
          },
          source: MIGRATION_SOURCE,
        },
      },
    ];

    await prisma.pageBlock.deleteMany({
      where: { pageId: page.id },
    });
    await prisma.pageBlock.createMany({
      data: blocks.map((block, index) => ({
        tenantId: tenant.id,
        pageId: page.id,
        blockType: block.blockType,
        position: index + 1,
        payload: block.payload,
        createdById: superAdmin.id,
        updatedById: superAdmin.id,
      })),
    });

    pageCount++;
    blockCount += blocks.length;
    console.log(`  Route: ${route.slug} (${blocks.length} blocks)`);
  }

  // 5. Blog categories + posts
  console.log("\n--- Step 5: Blog ---");
  const categoryMap = new Map<string, string>();
  for (const cat of BLOG_CATEGORIES) {
    const category = await prisma.blogCategory.upsert({
      where: {
        tenantId_slug: {
          tenantId: tenant.id,
          slug: cat.slug,
        },
      },
      update: {
        name: cat.name,
        description: cat.description,
        deletedAt: null,
        updatedById: superAdmin.id,
      },
      create: {
        tenantId: tenant.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        createdById: superAdmin.id,
        updatedById: superAdmin.id,
      },
    });
    categoryMap.set(cat.slug, category.id);
    console.log(`  Category: ${cat.name} (${cat.slug})`);
  }

  let blogPostCount = 0;
  for (const post of BLOG_POSTS) {
    const categoryId = categoryMap.get(post.categorySlug);
    if (!categoryId) {
      console.warn(
        `  SKIP post "${post.slug}": category "${post.categorySlug}" not found`
      );
      continue;
    }

    await prisma.blogPost.upsert({
      where: {
        tenantId_slug: {
          tenantId: tenant.id,
          slug: post.slug,
        },
      },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        categoryId,
        seoTitle: post.seoTitle,
        seoDescription: post.seoDescription,
        status: PublishStatus.DRAFT,
        publishedAt: post.publishedAt,
        deletedAt: null,
        updatedById: superAdmin.id,
      },
      create: {
        tenantId: tenant.id,
        categoryId,
        authorId: superAdmin.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        seoTitle: post.seoTitle,
        seoDescription: post.seoDescription,
        status: PublishStatus.DRAFT,
        publishedAt: post.publishedAt,
        createdById: superAdmin.id,
        updatedById: superAdmin.id,
      },
    });
    blogPostCount++;
    console.log(`  Post: ${post.slug}`);
  }

  // 6. Menus
  console.log("\n--- Step 6: Menus ---");
  for (const [key, menuData] of Object.entries(MENUS)) {
    const menu = await prisma.menu.upsert({
      where: {
        tenantId_slug: {
          tenantId: tenant.id,
          slug: menuData.slug,
        },
      },
      update: {
        name: menuData.name,
        location: menuData.location,
        isActive: true,
        deletedAt: null,
        updatedById: superAdmin.id,
      },
      create: {
        tenantId: tenant.id,
        name: menuData.name,
        slug: menuData.slug,
        location: menuData.location,
        isActive: true,
        createdById: superAdmin.id,
        updatedById: superAdmin.id,
      },
    });

    // Remove old items and recreate
    await prisma.menuItem.deleteMany({
      where: { menuId: menu.id },
    });
    await prisma.menuItem.createMany({
      data: menuData.items.map((item) => ({
        tenantId: tenant.id,
        menuId: menu.id,
        label: item.label,
        href: item.href,
        sortOrder: item.sortOrder,
        isActive: true,
        createdById: superAdmin.id,
        updatedById: superAdmin.id,
      })),
    });
    console.log(
      `  Menu: ${menuData.name} (${menuData.items.length} items)`
    );
  }

  // 7. Media placeholders
  console.log("\n--- Step 7: Media Placeholders ---");
  const mediaPlaceholders = [
    {
      name: "banner-taxi-ninh-binh",
      url: "https://www.taxininhbinh.com/_next/image?url=%2Fimages%2Fbanner-taxi-ninh-binh.webp",
      alt: "Banner Taxi Ninh Binh",
    },
    {
      name: "taxi-noi-tinh",
      url: "https://www.taxininhbinh.com/images/taxi-noi-tinh.webp",
      alt: "Taxi noi tinh Ninh Binh",
    },
    {
      name: "dua-don-san-bay",
      url: "https://www.taxininhbinh.com/images/dua-don-san-bay.webp",
      alt: "Dua don san bay Noi Bai",
    },
    {
      name: "xe-du-lich",
      url: "https://www.taxininhbinh.com/images/xe-du-lich.webp",
      alt: "Xe du lich theo chuyen",
    },
  ];

  let mediaCount = 0;
  for (const media of mediaPlaceholders) {
    const existing = await prisma.mediaAsset.findFirst({
      where: {
        tenantId: tenant.id,
        name: media.name,
        deletedAt: null,
      },
    });

    if (!existing) {
      await prisma.mediaAsset.create({
        data: {
          tenantId: tenant.id,
          name: media.name,
          url: media.url,
          alt: media.alt,
          mimeType: "image/webp",
          status: MediaStatus.DRAFT,
          createdById: superAdmin.id,
          updatedById: superAdmin.id,
        },
      });
      mediaCount++;
    }
    console.log(`  Media: ${media.name} (placeholder)`);
  }

  // ─── Summary ─────────────────────────────────────────────────
  console.log("\n=== Migration Summary ===");
  console.log(`Tenant: ${TENANT_SLUG}`);
  console.log(`Pages: ${pageCount} (with ${blockCount} total blocks)`);
  console.log(`  - Static pages: ${PAGES.length}`);
  console.log(`  - Route landing pages: ${ROUTE_PAGES.length}`);
  console.log(`Blog categories: ${BLOG_CATEGORIES.length}`);
  console.log(`Blog posts: ${blogPostCount}`);
  console.log(`Menus: ${Object.keys(MENUS).length}`);
  console.log(`Media placeholders: ${mediaCount}`);
  console.log(`\nAll content imported as DRAFT status.`);
  console.log(`Source tag: ${MIGRATION_SOURCE}`);
  console.log("\nNOT migrated (needs manual upload):");
  console.log("  - Images (mapped as placeholders, need Cloudinary upload)");
  console.log(
    "  - 4 blog posts from homepage refs that return 404 on source site"
  );
  console.log(
    "  - English translations (content is vi-only, en structure ready)"
  );
  console.log("\n=== Migration Complete ===");
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
