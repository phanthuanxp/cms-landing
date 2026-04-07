# Multi-tenant CMS on Next.js

Production-ready CMS multi-tenant cho landing pages va blog, dung `Next.js App Router + TypeScript strict + Prisma + PostgreSQL + Tailwind CSS + shadcn/ui-style components`, huong toi deploy tren Vercel.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript strict mode
- Prisma ORM + PostgreSQL
- Tailwind CSS v4
- Server Actions + Route Handlers
- Multi-tenant theo `domain/hostname`

## Tinh nang chinh

- 1 codebase quan ly nhieu tenant/site
- Resolve tenant theo hostname tren moi public request
- Admin auth bang email/password
- Roles: `super_admin`, `tenant_admin`, `editor`
- Quan ly tenant/site info, domains, SEO defaults, theme settings
- Quan ly menu, landing pages, blog categories, blog posts
- SEO dong: metadata, canonical, Open Graph, Twitter Card, JSON-LD
- `sitemap.xml` va `robots.txt` theo domain hien tai
- Landing page section builder JSON blocks
- Contact form block thu lead vao database
- Spam protection co ban cho contact form: honeypot, timing check, duplicate window
- Audit logging co ban cho login, logout va lead submissions
- Soft delete + audit fields

## Project structure

```text
cms-multitenant/
|- prisma/
|  |- schema.prisma
|  `- seed.ts
|- docs/
|  `- architecture.md
|- src/
|  |- app/
|  |  |- (public)/
|  |  |- admin/
|  |  |- api/
|  |  |- layout.tsx
|  |  |- robots.ts
|  |  `- sitemap.ts
|  |- components/
|  |- features/
|  |- lib/
|  |- server/
|  `- types/
|- .env.example
|- next.config.ts
|- proxy.ts
`- package.json
```

## Environment variables

Copy `.env.example` thanh `.env` khi chay local.

| Variable | Required | Example | Purpose |
|---|---|---|---|
| `DATABASE_URL` | Yes | `postgresql://...` | PostgreSQL connection string cho Prisma |
| `APP_ENV` | Yes | `development` / `production` | Dieu khien secure cookie va logging mode |
| `DEFAULT_SITE_DOMAIN` | Yes | `alpha.localhost:3000` | Host fallback de resolve tenant va canonical |
| `SESSION_COOKIE_NAME` | Yes | `cms_admin_session` | Ten cookie session admin |
| `SESSION_SECRET` | Yes | long random string | Secret de hash session token |

## Setup local

1. Tao database PostgreSQL moi.
2. Copy `.env.example` thanh `.env`.
3. Dien cac gia tri that vao `.env`.
4. Cai dependencies:

```bash
npm install --no-audit --no-fund
```

5. Validate Prisma schema:

```bash
npm run prisma:validate
```

6. Generate Prisma client:

```bash
npm run prisma:generate
```

Luu y:

- `postinstall` da duoc cau hinh de `prisma generate` chay ngay sau khi `npm install`
- dieu nay giup local, CI va Vercel co Prisma Client san truoc khi build

## Migrate

Chay migration trong local:

```bash
npm run prisma:migrate
```

Deploy migration tren production:

```bash
npm run prisma:deploy
```

## Seed

Seed demo data:

```bash
npm run prisma:seed
```

Demo credentials:

- `superadmin@example.com / Admin@123`
- `tenantadmin@example.com / Admin@123`
- `editor@example.com / Admin@123`

## Run dev

```bash
npm run dev
```

Demo hostnames local:

- `http://alpha.localhost:3000`
- `http://www.alpha.localhost:3000`
- `http://alpha.lvh.me:3000`
- `http://inactive.lvh.me:3000`
- `http://unknown.lvh.me:3000`

`lvh.me` tro ve `127.0.0.1`, rat tien de test hostname multi-tenant tren local.

## Build

Typecheck:

```bash
npm run typecheck
```

Lint:

```bash
npm run lint
```

Production build:

```bash
npm run build
```

Full pre-launch check:

```bash
npm run check
```

## Deploy Vercel

### 1. Tao database production

- Tao PostgreSQL production, vi du Neon, Supabase, Railway, Render Postgres, hoac managed Postgres khac.
- Copy connection string vao `DATABASE_URL`.

### 2. Tao env vars tren Vercel

Set cac env vars sau cho Production va Preview neu can:

- `DATABASE_URL`
- `APP_ENV=production`
- `DEFAULT_SITE_DOMAIN`
- `SESSION_COOKIE_NAME`
- `SESSION_SECRET`

### 3. Link project voi Vercel

```bash
npx vercel link
```

### 4. Push len GitHub

```bash
git init
git add .
git commit -m "chore: prepare cms for production deploy"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 5. Import vao Vercel

- Vao Vercel Dashboard
- Chon `Add New...` -> `Project`
- Import repository tu GitHub
- Set 5 env vars trong `.env.example`

### 6. Deploy preview

```bash
npx vercel
```

### 7. Deploy production

```bash
npx vercel deploy --prod
```

### 8. Chay migration production

Neu ban deploy bang CI/CD, hay chay migrate trong release flow:

```bash
npm run prisma:deploy
```

Neu can seed demo data production cho staging/demo:

```bash
npm run prisma:seed
```

## Custom domain tren Vercel

### Gan custom domain cho project

1. Vao Vercel project settings.
2. Add domain chinh, vi du `www.example.com`.
3. Add domain phu neu can, vi du `example.com`.
4. Cau hinh DNS theo huong dan cua Vercel.

### Cau hinh nhieu domain cho tenant trong CMS

1. Dang nhap admin bang `super_admin`.
2. Vao `Sites`.
3. Chon tenant can sua.
4. Them domain vao khu `Domain manager`.
5. Chon `Dat primary` cho domain chinh.
6. Sau khi DNS tro dung ve Vercel, tenant se duoc resolve theo `TenantDomain.host`.

Goi y:

- `primary domain` la domain chinh de hien thi canonical va SEO.
- `secondary domains` van co the tro vao cung tenant.
- `inactive tenant` se hien trang thong bao.
- `unknown domain` se tra 404 dep.

## Test tenant/domain routing

Kiem tra route public theo tenant:

- `/`
- `/gioi-thieu`
- `/kham-tong-quat`
- `/blog`
- `/blog/seo-landing-page`
- `/blog/post/5-luu-y-khi-toi-uu-homepage-chuan-seo`

## Test sitemap va robots

Mo cac endpoint sau theo tung hostname:

```text
http://alpha.localhost:3000/sitemap.xml
http://alpha.localhost:3000/robots.txt
http://alpha.lvh.me:3000/sitemap.xml
http://inactive.lvh.me:3000/robots.txt
```

Ket qua mong doi:

- `sitemap.xml` tren domain active chi chua URL cua tenant hien tai
- URL trong sitemap dung hostname dang truy cap
- `robots.txt` tren domain active co `allow: /` va link `sitemap.xml`
- `robots.txt` tren tenant inactive hoac disallowed tra rule `disallow: /`

## Test contact form va leads

1. Mo mot page co block contact form, vi du:

```text
http://alpha.localhost:3000/
http://alpha.localhost:3000/lien-he
```

2. Gui form voi du lieu hop le.

3. Kiem tra trong admin:
   - dang nhap `tenantadmin@example.com / Admin@123`
   - vao `http://alpha.localhost:3000/admin/leads`
   - chon tenant `Alpha Clinic`

4. Ket qua mong doi:
   - lead duoc luu vao database
   - source path va source host dung theo tenant domain hien tai
   - audit log co ban duoc ghi cho lead creation

## Test spam protection co ban

1. Honeypot:
   - mo DevTools va them gia tri vao field an `website`
   - submit form
   - API se tra `success: true` nhung khong tao lead moi

2. Submit qua nhanh:
   - goi thang API `/api/contact` ngay lap tuc voi `startedAt` rat moi
   - request bi drop de giam bot spam submit tu dong

3. Duplicate lead:
   - gui lai cung email hoac so dien thoai trong vong 10 phut
   - he thong bo qua lead duplicate gan nhat de tranh rac

4. Message dang spam:
   - neu message chua nhieu link, lead van co the duoc luu nhung bi danh dau `SPAM`

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run check
npm run prisma:validate
npm run prisma:generate
npm run prisma:migrate
npm run prisma:deploy
npm run prisma:seed
npm run prisma:studio
```

## Architecture notes

- `proxy.ts` gan `x-tenant-host` cho moi request de public layer resolve tenant nhat quan.
- Public pages uu tien server rendering, client component chi dung cho contact form interactive va mobile nav.
- Admin va public tach logic ro rang.
- Metadata, canonical, JSON-LD, sitemap, robots deu lay theo tenant/domain hien tai.
- Utility helpers quan trong nam o `src/lib/utils.ts`: `canonicalUrl`, `absoluteUrl`, `createExcerpt`, `estimateReadingTimeMinutes`, `formatDate`.
- Public cache strategy dung `unstable_cache` cho tenant shell va content, va `revalidateTag(..., "max")` sau cac thao tac CMS.
- Menu va landing blocks dang o pha 1 theo JSON, co the nang cap thanh visual builder va media uploader sau.

## Production launch checklist

- [ ] PostgreSQL production da san sang
- [ ] `DATABASE_URL` dung cho production
- [ ] `SESSION_SECRET` da la chuoi random dai, khong dung gia tri demo
- [ ] `APP_ENV=production`
- [ ] `DEFAULT_SITE_DOMAIN` trung voi domain chinh
- [ ] `npm run check` pass
- [ ] `npm run prisma:deploy` da chay thanh cong
- [ ] Da tao `super_admin` an toan hoac da doi password demo
- [ ] Da add custom domains tren Vercel
- [ ] Da add tenant domains trong admin CMS
- [ ] Da test `sitemap.xml`, `robots.txt`, homepage, blog, contact form
- [ ] Da test login/logout admin
- [ ] Da kiem tra lead submissions khong bi tenant leak
