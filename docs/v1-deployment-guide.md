# v1 Deployment Guide

Step-by-step guide to deploy the CMS to `v1-cms.30nice.vn` safely alongside production.

## Prerequisites

- Access to Vercel Dashboard
- Access to a PostgreSQL provider (Neon, Supabase, Railway, etc.)
- DNS management for `30nice.vn`
- GitHub repo `phanthuanxp/cms-landing`

## Step 1: Create v1 branch

```bash
git checkout main
git pull origin main
git checkout -b v1
git push -u origin v1
```

## Step 2: Provision v1 database

Create a **separate** PostgreSQL database for v1. Do NOT reuse the production database.

Example with Neon:
1. Go to Neon Dashboard
2. Create a new project or database named `cms_v1`
3. Copy the connection strings (pooled + direct)

## Step 3: Create Vercel project for v1

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New...** > **Project**
3. Import `phanthuanxp/cms-landing` from GitHub
4. Set **Production Branch** to `v1`
5. Set **Root Directory** to `.` (default)
6. Framework Preset: **Next.js** (auto-detected)

## Step 4: Set environment variables

In the Vercel project settings, add these environment variables:

| Variable | Value | Scope |
|---|---|---|
| `DATABASE_URL` | Pooled connection string from Step 2 | Production, Preview |
| `DATABASE_URL_UNPOOLED` | Direct connection string from Step 2 | Production, Preview |
| `APP_ENV` | `production` | Production |
| `APP_ENV` | `development` | Preview |
| `DEFAULT_SITE_DOMAIN` | `v1-cms.30nice.vn` | Production, Preview |
| `SESSION_COOKIE_NAME` | `cms_v1_session` | Production, Preview |
| `SESSION_SECRET` | Generate with `openssl rand -hex 32` | Production, Preview |

**Important:**
- `SESSION_COOKIE_NAME` MUST be different from production to avoid cookie conflicts
- `SESSION_SECRET` MUST be different from production for security isolation
- `DATABASE_URL` MUST point to the v1 database, NOT production

## Step 5: Run database migration

Option A - Via Vercel CLI:
```bash
npx vercel env pull .env.local --environment=production
source .env.local
npx prisma migrate deploy
```

Option B - Set env vars locally and run:
```bash
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

## Step 6: Seed demo data

```bash
DATABASE_URL="postgresql://..." npx tsx prisma/seed.ts
```

This creates:
- `superadmin@example.com / Admin@123` (SUPER_ADMIN)
- `tenantadmin@example.com / Admin@123` (TENANT_ADMIN)
- `editor@example.com / Admin@123` (EDITOR)
- One demo tenant "Alpha Clinic" with sample content

## Step 7: Configure custom domain

1. In Vercel project settings > Domains
2. Add `v1-cms.30nice.vn`
3. In your DNS provider, add:
   ```
   v1-cms.30nice.vn  CNAME  cname.vercel-dns.com
   ```
4. Wait for SSL certificate provisioning (usually < 5 minutes)

## Step 8: Add domain to database

After the first deployment succeeds, add the domain to the tenant:

```sql
-- Connect to v1 database
INSERT INTO "TenantDomain" (id, "tenantId", host, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), id, 'v1-cms.30nice.vn', true, true, now(), now()
FROM "Tenant"
WHERE slug = 'alpha-clinic';
```

Or use the admin UI after login to add the domain.

## Step 9: Deploy

Push to the `v1` branch to trigger auto-deployment:

```bash
git checkout v1
git push origin v1
```

Or deploy manually:
```bash
npx vercel deploy --prod
```

## Step 10: Verify

1. Visit `https://v1-cms.30nice.vn/admin/login`
   - Or `https://v1-cms.30nice.vn/admincp/login` (rewrites to /admin/login)
2. Log in with `superadmin@example.com / Admin@123`
3. Verify dashboard loads correctly
4. Create a test page and verify it renders
5. Submit a test contact form
6. Visit `https://v1-cms.30nice.vn/sitemap.xml`
7. Visit `https://v1-cms.30nice.vn/robots.txt`

## Step 11: Verify production is unaffected

1. Visit `https://cms.30nice.vn/admincp`
2. Confirm everything works exactly as before
3. Check that no new deployments were triggered on the production project

## Rollback plan

If anything goes wrong with v1:

1. **Remove domain:** Delete `v1-cms.30nice.vn` from Vercel project
2. **Disable deployment:** Set Production Branch to a non-existent branch
3. **Delete project:** If needed, delete the entire v1 Vercel project

Production is completely isolated and unaffected by any v1 operations.

## Future: Merging v1 into production

When v1 is validated and ready:

1. Create a PR from `v1` to `main`
2. Review all changes carefully
3. Test on a preview deployment
4. Merge with explicit approval
5. Update production environment variables if needed
6. Run production database migrations
7. Verify production deployment
