# Architecture Overview

## 1. Tong quan

He thong gom 2 surface lon:

- `Public site`: render theo tenant duoc resolve tu hostname.
- `Admin CMS`: login mot lan, quan tri noi dung theo tenant/role.

Muc tieu kien truc:

- 1 codebase, nhieu tenant/domain
- server-first, SEO-first
- phan tach ro `UI -> feature actions -> server queries -> Prisma`
- de mo rong sang visual builder, media upload, RBAC sau nay

## 2. Multi-tenant strategy

- `proxy.ts` chen header `x-tenant-host` tu request host.
- `src/server/tenant/request.ts` doc header host va resolve tenant tu bang `Domain`.
- Neu domain khong match, fallback ve tenant default.
- Public pages/blog/sitemap/robots/meta deu doc tenant theo host hien tai.

## 3. Auth va roles

- `AuthSession` luu session token hash trong database.
- Cookie session HTTP-only.
- `User.globalRole`
  - `SUPER_ADMIN`
  - `USER`
- `TenantMembership.role`
  - `TENANT_ADMIN`
  - `EDITOR`

Quyen mac dinh:

- `super_admin`: quan ly toan bo tenant, domains, content
- `tenant_admin`: quan ly content + settings tenant cua minh
- `editor`: quan ly content tenant cua minh, khong sua site settings

## 4. Content model

### Tenant

- website info
- business info
- social links
- theme settings
- SEO defaults
- domains

### LandingPage

- `slug` unique theo tenant
- `content` luu JSON blocks
- `pageType`: `HOME | LANDING | ABOUT | SERVICE | CONTACT | CUSTOM`
- `status`, `publishedAt`

### Blog

- `BlogCategory`
- `BlogPost`
- `tags[]`
- `author`

### Others

- `NavigationMenu` + `MenuItem`
- `Lead`
- `MediaAsset`

Tat ca entity chinh deu co:

- `createdAt`
- `updatedAt`
- `createdById`
- `updatedById`
- `deletedAt`

## 5. SEO layer

- `generateMetadata()` dong theo tenant + route
- canonical theo host hien tai
- Open Graph + Twitter Card
- JSON-LD:
  - `Organization`
  - `WebSite`
  - `BreadcrumbList`
  - `Article`
- `sitemap.ts` theo host hien tai
- `robots.ts` theo host hien tai

## 6. Route structure

```text
Public
/
/[slug]
/blog
/blog/[slug]
/blog/category/[slug]
/sitemap.xml
/robots.txt

Admin
/admin/login
/admin/dashboard
/admin/sites
/admin/pages
/admin/blog/categories
/admin/blog/posts
/admin/menus
/admin/leads
/admin/media
/admin/settings
```

## 7. Rendering va hieu nang

- Public pages la server components mac dinh
- Client components chi cho contact form interactive
- `next/image` cho image blocks
- caching public queries bang `unstable_cache` + `revalidateTag("public-content")`
- admin khong pha cache public

## 8. Prisma schema design

Quan he chinh:

- `Tenant 1-n Domain`
- `Tenant 1-n LandingPage`
- `Tenant 1-n BlogCategory`
- `Tenant 1-n BlogPost`
- `Tenant 1-n Lead`
- `Tenant 1-n MediaAsset`
- `Tenant 1-n NavigationMenu`
- `NavigationMenu 1-n MenuItem`
- `Tenant n-n User` qua `TenantMembership`
- `User 1-n AuthSession`

Schema duoc toi uu cho:

- query theo tenant
- slug unique theo tenant
- published filters
- audit/soft-delete

## 9. Huong mo rong

- media upload qua Vercel Blob / S3
- visual block builder GUI
- preview draft theo token
- on-demand ISR refine hon theo per-tenant tags
- audit log chi tiet
- member management UI
