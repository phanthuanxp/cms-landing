# Taxi Ninh Binh Migration Report

## Overview

Content migration from [taxininhbinh.com](https://www.taxininhbinh.com) into CMS v1 as a fully manageable tenant with reusable Taxi template structure.

- **Source**: https://www.taxininhbinh.com (READ-ONLY)
- **Target**: CMS v1 database, tenant slug: `taxi-ninh-binh`
- **Default locale**: `vi` (Vietnamese)
- **All content status**: `DRAFT` (not auto-published)

## How to Run

```bash
# Set environment variables
export DATABASE_URL="postgresql://..."
export DATABASE_URL_UNPOOLED="postgresql://..."

# Run migration (safe to re-run - uses upserts)
npx tsx prisma/migrations-data/taxi-ninhbinh-migration.ts
```

The migration is **idempotent**: running it again will update existing records rather than creating duplicates.

## What Was Imported

### Tenant & Settings

| Item | Value |
|------|-------|
| Tenant slug | `taxi-ninh-binh` |
| Site name | Taxi Ninh Binh |
| Hotline | 0345 07 6789 |
| Email | info@taxininhbinh.com |
| Zalo | https://zalo.me/0345076789 |
| Domain mapping | taxininhbinh.com |
| Admin membership | SUPER_ADMIN linked as TENANT_ADMIN |

### Pages (14 total, 41 blocks)

| Slug | Type | Blocks | Description |
|------|------|--------|-------------|
| `/` | HOME | 8 | Homepage with hero, booking form, services, pricing preview, FAQ, testimonials, CTA |
| `gioi-thieu` | ABOUT | 3 | About page with company info, service areas, trust signals |
| `dich-vu` | SERVICE | 2 | Service index linking to route pages |
| `dich-vu/taxi-duong-dai` | SERVICE | 2 | Long-distance taxi service |
| `dich-vu/thue-xe-du-lich` | SERVICE | 2 | Tourism vehicle rental |
| `bang-gia` | CUSTOM | 2 | Full pricing table (6 routes x 3 vehicle types) |
| `lien-he` | CONTACT | 2 | Contact page with hotline, Zalo, email channels |
| `faq` | CUSTOM | 2 | 8 FAQ items |
| `chinh-sach-bao-mat` | CUSTOM | 1 | Privacy policy (5 sections) |
| `dieu-khoan-su-dung` | CUSTOM | 1 | Terms of service (5 sections) |
| `taxi-ha-noi-ninh-binh` | LANDING | 4 | SEO route page: Ha Noi -> Ninh Binh |
| `taxi-noi-bai-ninh-binh` | LANDING | 4 | SEO route page: Noi Bai -> Ninh Binh |
| `taxi-ninh-binh-ha-noi` | LANDING | 4 | SEO route page: Ninh Binh -> Ha Noi |
| `taxi-ninh-binh-noi-bai` | LANDING | 4 | SEO route page: Ninh Binh -> Noi Bai |

### Blog

| Item | Count |
|------|-------|
| Categories | 2 (`travel-guide`, `taxi-tips`) |
| Posts | 2 (both DRAFT) |

Posts imported:
1. `choose-right-taxi-for-family-trip` - Category: taxi-tips (Apr 2, 2026)
2. `top-7-places-to-visit-in-ninh-binh` - Category: travel-guide (Apr 1, 2026)

### Menus (3 menus, 15 items)

| Menu | Location | Items |
|------|----------|-------|
| Menu chinh | HEADER | 6 (Trang chu, Dich vu, Bang gia, Blog, Gioi thieu, Lien he) |
| Footer - Dich vu & thong tin | FOOTER | 6 |
| Footer - Legal | LEGAL | 3 (Blog, Chinh sach bao mat, Dieu khoan su dung) |

### Media (4 placeholders)

Image URLs mapped from source site. Status: `DRAFT` (need Cloudinary upload).

### Data Preserved in Blocks

- **Pricing**: 6 routes with 3 vehicle types each (Xe 4 cho, Xe 7 cho, Xe 16 cho)
- **FAQ**: 8 unique Q&A items (merged from homepage and FAQ page, deduplicated)
- **Testimonials**: 5 verified customer reviews with initials, name, context
- **Booking form**: 10 fields (pickup, stopover, destination, datetime, vehicle type, round trip, VAT, desired price, name, phone)
- **Contact channels**: Hotline, Zalo, Email with descriptions
- **Service areas**: TP Ninh Binh, Tam Coc, Trang An, Bai Dinh, Hoa Lu, Kim Son

## What Was NOT Migrated

| Item | Reason |
|------|--------|
| 4 blog posts (slugs in sitemap) | Source returns "Bai viet khong ton tai" (404) |
| Actual image files | Mapped as URL placeholders; need Cloudinary upload |
| English translations | Content is vi-only; CMS structure supports en expansion |
| Google Maps embed | Requires API key configuration per tenant |
| Zalo chat widget | External widget, configured at site level |

## SEO Preservation

- All original slugs maintained exactly as source
- SEO titles and meta descriptions extracted and mapped
- Internal links preserved in CTA buttons and block payloads
- Route landing pages maintain keyword-optimized URL structure
- FAQ structured data ready for JSON-LD rendering

## Safety & Rollback

- **Idempotent**: Safe to re-run without creating duplicates
- **Tagged**: All block payloads include `source: "taxininhbinh.com"` for traceability
- **Draft-only**: No content auto-published
- **Tenant-isolated**: All data scoped to `taxi-ninh-binh` tenant
- **Rollback**: Delete tenant to remove all migrated data:
  ```sql
  DELETE FROM "Tenant" WHERE slug = 'taxi-ninh-binh';
  -- CASCADE will remove all related pages, blocks, blog posts, menus, etc.
  ```

## Current Readiness

**Status: Usable but needs review**

- Data structure: Complete
- Content accuracy: Needs editorial review (Vietnamese content preserved as-is)
- Images: Placeholder URLs, need Cloudinary upload
- English content: Structure ready, translations needed
- Publishing: All DRAFT, manual review before publish

## Next Steps

1. **Review imported content** in CMS admin UI
2. **Upload images** to Cloudinary and update MediaAsset records
3. **Add English translations** for bilingual support
4. **Publish pages** after editorial review
5. **Configure Google Maps** embed for contact/about pages
6. **Set up Zalo widget** at tenant site level
7. **Test public-facing rendering** once frontend template is connected
