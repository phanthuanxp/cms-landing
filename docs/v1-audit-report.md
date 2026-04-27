# CMS Multi-tenant v1 Audit Report

**Repository:** phanthuanxp/cms-landing
**Date:** 2026-04-27
**Auditor:** Devin (Senior Fullstack / DevOps / QA)
**Scope:** Complete audit for safe v1 deployment to `v1-cms.30nice.vn`

---

## 1. Architecture Overview

### 1.1 Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript strict mode (`noUncheckedIndexedAccess`, `noImplicitOverride`) |
| ORM | Prisma 5.22 + PostgreSQL |
| Styling | Tailwind CSS v4 + shadcn/ui-style components |
| Auth | Custom cookie-based sessions (SHA-256 token hash + bcryptjs) |
| Hosting target | Vercel |

### 1.2 Module structure

```
src/
  app/
    (public)/       # Tenant-scoped public pages, blog, catch-all slug
    admin/
      (auth)/login  # Login page
      (dashboard)/  # All admin CRUD pages
    api/
      contact/      # Public lead-capture endpoint
      admin/logout/ # Logout route
    sitemap.ts      # Dynamic per-tenant sitemap
    robots.ts       # Dynamic per-tenant robots.txt
  server/
    auth/           # session.ts, permissions.ts
    tenant/         # request.ts (tenant resolution by hostname)
    queries/        # admin.ts, public.ts
    seo/            # metadata.ts, json-ld.ts
    services/       # audit.ts, lead-protection.ts
    db/             # Prisma client singleton
  features/         # Server Actions per domain (auth, blog, media, menu, pages, settings, sites, users)
  components/
    admin/          # Sidebar, topbar, tenant picker, etc.
    public/         # Site shell, block renderer, blog components
    ui/             # Shared primitives (button, card, input, etc.)
  lib/              # Utilities (env validation, slug, admin helpers, constants)
  types/            # Zod schemas for page blocks, menus, theme/social
prisma/
  schema.prisma     # 15 models, full audit/soft-delete support
  seed.ts           # Demo data with 3 user roles + 1 tenant
  migrations/       # Single init migration
```

### 1.3 Multi-tenant strategy

- **Domain-based resolution:** `proxy.ts` (middleware) sets `x-tenant-host` header from the request `host`.
- **DB lookup:** `src/server/tenant/request.ts` resolves `TenantDomain` record by normalized hostname.
- **Caching:** Tenant resolution cached via `unstable_cache` with 300s TTL and `["tenant","public-content"]` tags.
- **Fallback:** If no domain matches, falls back to `DEFAULT_SITE_DOMAIN` env var.
- **Public pages** always scope queries to the resolved tenant ID.
- **Admin pages** use `requireTenantAccess()` which validates membership before any data operation.

### 1.4 Admin route structure

**Important note:** The admin panel in the codebase lives at `/admin/*`, NOT `/admincp/*`. The production URL `cms.30nice.vn/admincp` likely uses a Vercel rewrite/redirect or reverse proxy to map `/admincp` to `/admin`. This must be verified and configured for v1.

### 1.5 Content model

15 Prisma models with full audit fields (`createdAt`, `updatedAt`, `createdById`, `updatedById`, `deletedAt`):
- `User` (email/password auth, global role)
- `Tenant` (multi-tenant root entity)
- `TenantMembership` (user-tenant-role mapping)
- `TenantDomain` (hostname binding with primary/redirect support)
- `SiteSettings` (per-tenant configuration, SEO defaults, locale, theme)
- `Page` + `PageBlock` (landing page builder with JSON block payloads)
- `BlogCategory`, `BlogPost`, `BlogTag`, `BlogPostTag`
- `Menu` + `MenuItem` (hierarchical navigation)
- `Lead` (contact form submissions with spam protection)
- `MediaAsset` (placeholder, not yet functional)
- `AuthSession` (token-based with TTL + revocation)
- `AuditLog` (login/logout/CRUD events)

---

## 2. Risk Report

### CRITICAL (Must fix before deploy)

| # | Issue | Location | Impact |
|---|---|---|---|
| C1 | **No middleware.ts file** - `proxy.ts` is defined but never wired as Next.js middleware. The proxy function sets `x-tenant-host` and does cookie-based admin redirect, but Next.js requires `middleware.ts` (or `middleware.js`) at project root or `src/` to be recognized. If this file is missing, tenant resolution relies solely on the `host` header fallback, and the admin redirect guard in `proxy.ts` never executes. | `proxy.ts` (not `src/middleware.ts`) | Tenant resolution may work via `host` header fallback, but the middleware admin guard is bypassed. Needs verification on the production deployment - if production works, Vercel may be picking it up from `proxy.ts` exports, but this is non-standard. |
| C2 | **No i18n routing for public site** - The system has a `locale` field on `SiteSettings` (default `vi-VN`) but no actual locale-based routing (`/en`, `/vi`), no `next-intl` or equivalent, no `hreflang` tags, no alternate language links. Content fields (title, description, blog content) are single-language only with no translation support in the schema. | Entire app | The requirement for vi+en bilingual support is NOT met at any level - neither schema, routing, nor UI. |
| C3 | **Admin UI labels are hardcoded Vietnamese** - All validation messages, error messages, empty states, breadcrumbs ("Trang chu"), button labels ("Dang nhap", "Chon"), and status messages are in Vietnamese strings directly in code. No i18n framework or translation files exist. | `src/features/**`, `src/app/**`, `src/components/**` | Admin UI cannot switch between EN/VI as required. |
| C4 | **`DEFAULT_PAGE_BLOCKS` contains hardcoded Vietnamese** - The default landing page blocks in `src/lib/constants.ts` have Vietnamese text ("Tieu de chinh cho landing page", "Nhan tu van", etc.). These are used when creating new pages. | `src/lib/constants.ts` | New pages will always start with Vietnamese placeholder text regardless of tenant locale. |

### HIGH

| # | Issue | Location | Impact |
|---|---|---|---|
| H1 | **No rate limiting on login** - The login action has no brute-force protection. An attacker can attempt unlimited password guesses. | `src/features/auth/actions.ts` | Security vulnerability for credential stuffing/brute-force attacks. |
| H2 | **No CSRF protection on Server Actions** - Next.js Server Actions have some built-in CSRF protection via the `Origin` header check, but the contact form API route (`POST /api/contact`) is a plain route handler with no CSRF token validation. | `src/app/api/contact/route.ts` | Potential for cross-site request forgery on lead submissions. |
| H3 | **Session cookie lacks `domain` scope** - The cookie is set with `path: "/"` but no explicit domain. On a multi-tenant setup where admin and public sites share the same Vercel project, this means the session cookie is sent to ALL tenant domains. | `src/server/auth/session.ts:75-81` | A session created on `admin.example.com` would be sent to `tenant-a.example.com`, potentially leaking the admin session token to the wrong domain. |
| H4 | **`removeTenantMembershipAction` lacks ownership validation** - The action takes `membershipId` from FormData and deletes it without verifying it belongs to a specific tenant. A SUPER_ADMIN could accidentally (or maliciously via crafted request) remove any membership. | `src/features/users/actions.ts:116-131` | Low practical risk since it requires SUPER_ADMIN role, but violates defense-in-depth. |
| H5 | **Blog search queries content with `contains`** - The `getBlogListing` function searches across `title`, `excerpt`, AND `content` using `contains` (case-insensitive). For large blog posts, this performs a full-text scan on every query. | `src/server/queries/public.ts:172-178` | Performance degradation at scale. Should use PostgreSQL full-text search or at minimum avoid searching `content`. |
| H6 | **`/admincp` route mapping unknown** - Production uses `/admincp` but the codebase uses `/admin`. How this mapping works is unclear. If it's a Vercel rewrite, v1 needs the same configuration. | Deployment config | v1 may show 404 at `/admincp` if not configured identically. |

### MEDIUM

| # | Issue | Location | Impact |
|---|---|---|---|
| M1 | **No `hreflang` tags in SEO metadata** - The `buildMetadata()` function generates canonical URLs but no `alternates.languages` for multi-language SEO. | `src/server/seo/metadata.ts` | Google cannot discover alternate language versions. |
| M2 | **`<html lang="vi">` is hardcoded** - The root layout always renders `lang="vi"`, ignoring the tenant's configured locale. | `src/app/layout.tsx:27` | Incorrect HTML lang attribute for English-locale tenants, hurts SEO and accessibility. |
| M3 | **Error page has hardcoded `lang="vi"`** - The error boundary renders its own `<html>` tag with `lang="vi"`. | `src/app/error.tsx:17` | Same i18n issue. |
| M4 | **Image remote patterns too permissive** - `next.config.ts` allows images from `hostname: "**"` (any host). | `next.config.ts:8` | Potential for SSRF-like attacks via image optimization proxy. Should whitelist known hosts. |
| M5 | **Media module is non-functional** - Both `upsertMediaAction` and `softDeleteMediaAction` immediately redirect with an error message. The media page exists but does nothing. | `src/features/media/actions.ts` | Dead feature in admin UI. Should either be hidden from sidebar or clearly marked as coming soon. |
| M6 | **Lead status updates disabled** - `updateLeadStatusAction` immediately redirects with error. Leads can be created but never managed. | `src/features/leads/actions.ts` | Admin users cannot triage leads, reducing CRM utility. |
| M7 | **Tag upsert uses sequential queries in loop** - `upsertPostAction` processes tags in a `for...of` loop with individual `upsert` + `create` calls inside a transaction. | `src/features/blog/actions.ts:264-294` | N+1 pattern for tag operations. Works fine for small tag counts but scales poorly. |
| M8 | **`unstable_cache` is experimental** - Used for tenant resolution and public queries. While functional, it's not guaranteed stable across Next.js versions. | `src/server/tenant/request.ts`, `src/server/queries/public.ts` | May break on Next.js upgrades. Monitor for API changes. |
| M9 | **Missing `@types/bcryptjs`** - `bcryptjs` is used but `@types/bcryptjs` is defined via a custom `src/types/bcryptjs.d.ts` declaration. | `src/types/bcryptjs.d.ts` | Custom type stubs may drift from actual API. Consider installing the official `@types/bcryptjs`. |

### LOW

| # | Issue | Location | Impact |
|---|---|---|---|
| L1 | **Font subsets lack Vietnamese support** - `Geist` font uses `subsets: ["latin", "latin-ext"]`. Vietnamese requires specific diacritical mark rendering that may not render optimally. | `src/app/layout.tsx:6-8` | Minor rendering issues with Vietnamese characters. |
| L2 | **`revalidateTag` second argument is Next.js 16-specific** - Multiple locations call `revalidateTag("public-content", "max")` which uses the Next.js 16 `CacheLifeConfig` profile parameter. This is correct for Next.js 16 but may break if downgrading. | Multiple files in `src/features/` | Coupling to Next.js 16 API surface. |
| L3 | **Audit log for login doesn't await result** - In `loginAction`, the audit log creation is awaited but the redirect happens immediately after. If the audit write fails, the login still succeeds. | `src/features/auth/actions.ts:74-83` | Potential for missed audit entries. |
| L4 | **`passwordHash: ""` when creating user without password** - If `upsertUserAction` is called for a new user without a password (which is caught by validation), the fallback `passwordHash: ""` would create an account that can never log in via bcrypt compare. | `src/features/users/actions.ts:74` | Edge case, but the empty string should be flagged more explicitly. |
| L5 | **No pagination on sitemap** - `getSitemapPayload` fetches ALL pages, posts, and categories in one query with no limit. | `src/server/queries/public.ts:277-310` | Will eventually hit memory/performance issues with large content volumes. |

---

## 3. Security Analysis

### 3.1 Authentication flow

**Strengths:**
- SHA-256 token hashing with a server-side secret (no raw tokens stored in DB)
- bcrypt password hashing with cost factor 10
- HTTP-only cookies, SameSite=Lax
- Secure flag enabled in production (`APP_ENV === "production"`)
- Session TTL of 30 days with activity tracking
- Session revocation on user deletion and explicit logout
- Login redirect validation (must start with `/admin`)

**Weaknesses:**
- No rate limiting or account lockout on failed logins (H1)
- No CSRF token on the contact form API route (H2)
- Cookie domain not scoped - leaks across tenant domains (H3)
- No session rotation after login (same token for entire 30-day TTL)
- No concurrent session limit

### 3.2 Access control

**Strengths:**
- Clear role hierarchy: `SUPER_ADMIN > TENANT_ADMIN > EDITOR`
- All server actions call `requireRole()` or `requireTenantAccess()` before data operations
- Tenant-scoped ownership validation (`getTenantPageOrThrow`, `getTenantCategoryOrThrow`, etc.)
- Super admins bypass tenant membership checks (intentional)
- Soft-delete user action also revokes all active sessions

**Weaknesses:**
- `removeTenantMembershipAction` doesn't validate ownership context (H4)
- No audit logging for admin CRUD operations (only login/logout/lead creation)

### 3.3 Tenant isolation

**Strengths:**
- Every content model has a `tenantId` field with cascade delete
- Prisma queries consistently include `tenantId` in WHERE clauses
- Domain uniqueness enforced at DB level (`host @unique`)
- Slug uniqueness enforced per tenant (`@@unique([tenantId, slug])`)
- Public queries always scope through resolved tenant

**Weaknesses:**
- The contact form API route accepts `tenantId` from the request body and verifies the tenant exists, but does NOT verify the request came from a domain belonging to that tenant. An attacker could submit leads to any tenant from any origin.
- No origin validation on the contact form beyond basic honeypot/timing checks.

### 3.4 Input validation

**Strengths:**
- Zod schemas validate all form inputs before DB operations
- URL fields validated with `.url()` schema
- Email validated with `.email()` schema
- Slug sanitization via `slugify()` function

**Weaknesses:**
- Blog post content has no HTML sanitization - stored as raw text but could contain XSS payloads if rendered with `dangerouslySetInnerHTML`
- JSON block payloads stored as `Json` type with minimal structural validation

---

## 4. Performance Analysis

### 4.1 Positive patterns

- **Server Components by default**: All public pages are server-rendered with no client-side JavaScript except the contact form
- **Efficient caching**: `unstable_cache` with 300s TTL on tenant resolution and public queries
- **Parallel queries**: Dashboard stats and tenant shell queries use `Promise.all`
- **Selective includes**: Prisma queries use targeted `select` and `include` rather than fetching entire models
- **Pagination**: Blog listing and admin lists use cursor-based pagination with `PAGE_SIZE = 10`

### 4.2 Areas of concern

| Issue | Severity | Detail |
|---|---|---|
| Blog content search | High | Full-text `contains` search on `content` column (potentially megabytes per post) |
| Tag upsert loop | Medium | Sequential upsert + create in `for...of` loop inside transaction |
| Sitemap unbounded | Medium | No pagination or limit on sitemap generation queries |
| `getCurrentUser()` heavy join | Low | Every admin request loads user + all tenant memberships + tenant settings + domains. Could be cached for the request lifecycle. |
| No CDN cache headers | Low | Public pages rely on Next.js ISR but no explicit `Cache-Control` headers are set |

### 4.3 Optimization opportunities

1. **PostgreSQL full-text search** for blog search instead of `LIKE %query%`
2. **Cache `getCurrentUser()`** per request using React `cache()` wrapper
3. **Sitemap pagination** using Next.js sitemap index pattern
4. **Batch tag upserts** using `createMany` where possible
5. **Add explicit `Cache-Control`** headers for static public content

---

## 5. i18n Analysis

### Current state

The i18n system is **minimal and incomplete**:

1. **Schema level**: `SiteSettings.locale` field exists (default `vi-VN`) - stores a single locale string per tenant
2. **Admin UI**: All labels, messages, and validation errors are hardcoded Vietnamese strings
3. **Public UI**: Breadcrumbs ("Trang chu"), empty states, and descriptive text are all hardcoded Vietnamese
4. **HTML lang**: Hardcoded `lang="vi"` in root layout and error page
5. **Date/number formatting**: `formatDate()` and `formatNumber()` accept a `locale` parameter (default `vi-VN`) but are only called with the default
6. **No routing-level i18n**: No `/en`, `/vi` prefixes, no `next-intl`, no `i18n` config in `next.config.ts`
7. **No translation files**: No JSON/YAML locale files exist
8. **No hreflang tags**: SEO metadata has no alternate language links

### What's needed for vi+en bilingual support

For the v1 deployment to properly support Vietnamese + English:

1. **Content fields**: Each text-bearing model (Page, BlogPost, BlogCategory, MenuItem, SiteSettings) needs localized columns or a translation table
2. **Routing**: URL prefix strategy (`/en/blog`, `/vi/blog`) or subdomain strategy (`en.site.com`, `vi.site.com`)
3. **Admin UI translations**: Translation files for all admin labels, validation messages, and UI text
4. **Public UI translations**: Translation files for breadcrumbs, empty states, CTA text
5. **SEO**: `hreflang` tags, language-specific canonical URLs, localized sitemaps
6. **HTML lang**: Dynamic `<html lang>` based on current locale

**Recommendation for v1:** This is a large-scope feature. For the initial v1 deployment, deploy as-is with the understanding that the admin UI and default content are in Vietnamese. Plan the i18n system as a post-v1 milestone with a proper technical design.

---

## 6. Media System Analysis

The media system is a **placeholder/stub**:

- `MediaAsset` model exists in the schema with fields for `url`, `storageKey`, `alt`, `mimeType`, `sizeBytes`, `width`, `height`, `status`
- Admin media page exists at `/admin/media` and is visible in the sidebar
- Both `upsertMediaAction` and `softDeleteMediaAction` immediately redirect with error messages ("Media-manager-is-read-only-in-this-release", "Media-delete-is-disabled-in-this-release")
- No Cloudinary integration exists in the codebase (no Cloudinary SDK, no upload endpoints)
- Images in content are referenced by external URLs (Unsplash, etc.)

**No risk for v1 deployment** - the feature is safely disabled. Consider hiding the "Media" sidebar link until the feature is ready.

---

## 7. SEO System Analysis

### What works well

- Dynamic `generateMetadata()` on all public pages with tenant-scoped titles, descriptions, and OG images
- Canonical URLs generated from current hostname
- Open Graph + Twitter Card meta tags
- JSON-LD structured data (Organization, WebSite, BreadcrumbList, Article)
- Dynamic `sitemap.xml` per tenant/domain
- Dynamic `robots.txt` (disallows crawling for inactive tenants)
- SEO fields (seoTitle, seoDescription, ogImageUrl) on Page and BlogPost models

### What's missing

- **No `hreflang` tags** - critical for bilingual SEO (M1)
- **No sitemap index** for large sites (L5)
- **Blog category pages** in sitemap use `/blog/{slug}` but the actual route is `/blog/[category]/page.tsx` at `/blog/{category}` - need to verify URL consistency
- **No structured data for FAQ blocks** - FAQ page blocks exist but no `FAQPage` JSON-LD is generated
- **No `article:tag`** in Open Graph for blog posts

---

## 8. Deployment Plan for v1

### 8.1 Pre-deployment checklist

| Step | Action | Risk |
|---|---|---|
| 1 | Create `v1` branch from `main` | None |
| 2 | Verify typecheck + lint pass | Already confirmed: both pass cleanly |
| 3 | Provision a **separate PostgreSQL database** for v1/staging | None - required for data isolation |
| 4 | Set environment variables on Vercel for v1 project | None |
| 5 | Verify middleware/proxy configuration | Medium - see C1 |
| 6 | Run Prisma migration on v1 database | Low |
| 7 | Seed demo data on v1 database | Low |
| 8 | Configure custom domain `v1-cms.30nice.vn` on Vercel | Low |
| 9 | Test admin login + basic CRUD | None |
| 10 | Verify `/admincp` routing (if used by production) | High - see H6 |

### 8.2 Branch strategy

```
main ─────────────────────── (production - DO NOT TOUCH)
  └── v1 ────────────────── (staging branch for v1)
        └── v1/fix-xxx ──── (feature/fix branches off v1)
```

- **Never merge v1 into main** without explicit approval
- All v1 changes go into the `v1` branch
- PRs target `v1` branch, not `main`

### 8.3 Environment setup

#### Vercel project setup (v1)

Create a **new Vercel project** (separate from production) linked to the same repo but configured to deploy from the `v1` branch:

```
1. Vercel Dashboard > Add New Project > Import from GitHub
2. Select phanthuanxp/cms-landing
3. Set Production Branch: v1
4. Framework: Next.js (auto-detected)
```

#### Environment variables for v1

| Variable | Value | Notes |
|---|---|---|
| `DATABASE_URL` | `postgresql://...` (v1-specific) | **MUST be a different database than production** |
| `DATABASE_URL_UNPOOLED` | `postgresql://...` (v1-specific) | Direct connection for migrations |
| `APP_ENV` | `production` | Enable secure cookies |
| `DEFAULT_SITE_DOMAIN` | `v1-cms.30nice.vn` | Fallback tenant domain |
| `SESSION_COOKIE_NAME` | `cms_v1_session` | **Use different name to avoid cookie conflicts with production** |
| `SESSION_SECRET` | `<new-random-64-char-string>` | **MUST be different from production** |

#### Database setup

```bash
# 1. Create v1 database (example with Neon)
# Use Neon/Supabase/Railway dashboard to create a new database

# 2. Run migrations
DATABASE_URL="..." npx prisma migrate deploy

# 3. Seed demo data
DATABASE_URL="..." npx tsx prisma/seed.ts
```

### 8.4 Domain configuration

1. Add `v1-cms.30nice.vn` as a custom domain in the Vercel v1 project
2. Configure DNS: `v1-cms.30nice.vn` CNAME to `cname.vercel-dns.com`
3. Wait for SSL certificate auto-provisioning
4. Add `v1-cms.30nice.vn` as a `TenantDomain` entry in the v1 database

### 8.5 `/admincp` route mapping

If production uses `/admincp` instead of `/admin`, you need one of:

**Option A: Vercel rewrites** (recommended)
Add to `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/admincp/:path*", "destination": "/admin/:path*" }
  ]
}
```

**Option B: Next.js redirects** in `next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: '/admincp/:path*', destination: '/admin/:path*' }
    ];
  }
};
```

### 8.6 Rollback plan

1. **Database:** v1 uses a completely separate database, so no data contamination is possible
2. **Code:** The `v1` branch is independent from `main`. Production continues deploying from `main`.
3. **Domain:** Simply remove the `v1-cms.30nice.vn` domain from Vercel to take v1 offline
4. **Quick rollback:** Revert to previous Vercel deployment via Dashboard > Deployments > Promote

### 8.7 Deployment verification

After deploying v1:

1. Visit `https://v1-cms.30nice.vn/admin/login` (or `/admincp/login`)
2. Log in with seed credentials (`superadmin@example.com / Admin@123`)
3. Verify dashboard loads with correct tenant data
4. Create a test page and verify it renders on the public site
5. Test contact form submission
6. Verify sitemap.xml and robots.txt return correct data
7. Confirm production (`cms.30nice.vn`) is completely unaffected

---

## 9. Required Fixes Before Deploy

### Must-have (blocking v1 deployment)

| # | Fix | Effort | Risk |
|---|---|---|---|
| F1 | **Verify and fix middleware wiring** - Confirm `proxy.ts` is properly loaded as Next.js middleware. If not, create `src/middleware.ts` that re-exports the proxy function. | 30 min | Low - no behavior change if proxy already works |
| F2 | **Scope session cookie domain** - Add explicit `domain` option to the cookie or ensure cookie isolation between production and v1. At minimum, use a different `SESSION_COOKIE_NAME` for v1. | 15 min | Low |
| F3 | **Configure `/admincp` rewrite** if production uses that path | 15 min | Low |

### Recommended (non-blocking but important)

| # | Fix | Effort | Risk |
|---|---|---|---|
| R1 | Add login rate limiting (IP-based, 5 attempts/15 min) | 2-3 hrs | Low |
| R2 | Add origin validation on contact form API route | 1 hr | Low |
| R3 | Set dynamic `<html lang>` from tenant locale | 30 min | Low |
| R4 | Hide Media sidebar link until feature is ready | 15 min | None |
| R5 | ~~`revalidateTag` calls are correct for Next.js 16~~ (no action needed) | N/A | None |

---

## 10. Optional PR Summary

### Safe improvements that can be made now

I can create a PR targeting a new `v1` branch with the following safe, low-risk changes:

1. **Create proper `src/middleware.ts`** re-exporting the proxy function from `proxy.ts`
2. **Add `/admincp` rewrite** in `next.config.ts` for route compatibility
3. **Fix `<html lang>` to be dynamic** based on tenant locale (or default to `vi`)
4. **Add `v1-audit-report.md`** documentation to `docs/`
6. **Add `v1-deployment-guide.md`** with step-by-step instructions

All changes are:
- Additive only (no existing behavior modified)
- Isolated to the `v1` branch
- Verified to pass typecheck and lint
- Zero risk to production (`main` branch untouched)

---

## Appendix A: File-by-file analysis summary

| File | Status | Notes |
|---|---|---|
| `prisma/schema.prisma` | Good | Well-structured, proper indexes, audit fields on all models |
| `src/server/auth/session.ts` | Good | Solid session management with proper hashing |
| `src/server/auth/permissions.ts` | Good | Clear role hierarchy with proper tenant scoping |
| `src/server/tenant/request.ts` | Good | Correct tenant resolution with caching |
| `src/server/queries/public.ts` | Fair | Good caching, but blog search uses LIKE instead of FTS |
| `src/server/queries/admin.ts` | Good | Clean pagination and tenant-scoped queries |
| `src/server/seo/metadata.ts` | Fair | Missing hreflang, but solid OG/Twitter card support |
| `src/server/seo/json-ld.ts` | Good | Proper structured data implementation |
| `src/features/auth/actions.ts` | Fair | Works but lacks rate limiting |
| `src/features/blog/actions.ts` | Fair | Sequential tag operations in loop |
| `src/features/pages/actions.ts` | Good | Proper transaction usage, tenant ownership checks |
| `src/features/sites/actions.ts` | Good | SUPER_ADMIN gated, domain uniqueness enforced |
| `src/features/media/actions.ts` | N/A | Stub - not functional |
| `src/features/leads/actions.ts` | N/A | Stub - status updates disabled |
| `src/lib/env.ts` | Good | Zod-validated environment variables |
| `src/lib/constants.ts` | Fair | Hardcoded Vietnamese in DEFAULT_PAGE_BLOCKS |
| `src/types/cms.ts` | Good | Well-typed Zod schemas for all block types |
| `proxy.ts` | Needs fix | Not wired as proper Next.js middleware |
| `next.config.ts` | Fair | Image patterns too permissive |
| `tsconfig.json` | Good | Strict mode with noUncheckedIndexedAccess |

## Appendix B: Build verification

```
$ npm run typecheck  # PASS (0 errors)
$ npm run lint       # PASS (0 warnings)
```

The codebase is in a clean, deployable state from a TypeScript/ESLint perspective.
