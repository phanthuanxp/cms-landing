# Testing CMS Admin — i18n, Security & Multi-tenant

## Overview

This skill covers end-to-end testing of the multi-tenant CMS admin panel, including:
- Locale switching (vi ↔ en) across all admin pages
- Login rate limiting (IP-based, 5 attempts / 15 min)
- Origin validation on the `/api/contact` endpoint
- Multi-tenant domain resolution

## Devin Secrets Needed

No external secrets required. Test credentials are seeded locally.

## Environment Setup

1. **Install dependencies**: `npm install`
2. **Generate Prisma client**: `npx prisma generate`
3. **Database**: PostgreSQL must be running locally
   - Create database: `sudo -u postgres createdb cms_multitenant`
   - Run migrations: `npx prisma db push`
   - Seed data: `npx prisma db seed`
4. **Start dev server**: `npm run dev` (runs on `http://localhost:3000`)
5. **Verify**: Access `http://alpha.localhost:3000/admin/login` in browser

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@example.com | Admin@123 |
| Tenant Admin | tenantadmin@example.com | Admin@123 |
| Editor | editor@example.com | Admin@123 |

## Tenant Domains

- `alpha.localhost:3000` — primary test tenant
- `alpha.lvh.me:3000` — alternative (useful if `.localhost` has issues)
- `www.alpha.localhost:3000` — www variant

## Testing i18n Locale Switching

### Key Behaviors
- Default locale is `vi` (Vietnamese) when no `cms_locale` cookie is set
- Locale switcher button in topbar shows the **next** locale label (e.g., "English" when current is `vi`)
- Locale is stored in a cookie (`cms_locale`) and persists across page navigation
- All 10+ admin pages should reflect the active locale

### What to Verify
- Login page: title "Dang nhap admin CMS" (vi) vs "Admin CMS Login" (en)
- Login button: "Dang nhap" (vi) vs "Log in" (en)
- Dashboard: "Dang nhap voi" (vi) vs "Logged in as" (en)
- Dashboard: "Dang xem tenant:" (vi) vs "Viewing tenant:" (en)
- Page descriptions change on each admin page

### Known Gaps
- `DataTableToolbar` component has Vietnamese defaults for `allStatusLabel` ("Tat ca trang thai"), `applyLabel` ("Ap dung"), and `searchPlaceholder` ("Tim kiem...") that may not be wired to translations on all pages
- Pagination labels ("Trang truoc"/"Trang sau") might remain Vietnamese in English mode
- Sidebar labels are currently not translated (static text)

## Testing Rate Limiting

### Important Notes
- Rate limiter uses an **in-memory store** — restarting the dev server resets all counters
- Next.js server actions don't work with plain `curl` POST — the `redirect()` call is handled internally via RSC protocol
- **Best approach**: Test rate limiting via the browser GUI by submitting the login form with wrong passwords
- After 5 failed attempts from the same IP, the 6th attempt should show: "Qua nhieu lan dang nhap hay thu lai sau"
- The error appears in the URL as `?error=Qua-nhieu-lan-dang-nhap-hay-thu-lai-sau`

### Workflow
1. Restart dev server to ensure clean rate limit state
2. Navigate to login page
3. Submit form with correct email but wrong password 5 times
4. On 6th attempt, verify rate limit error appears
5. Restart dev server again before proceeding to other tests that need login

## Testing Origin Validation

### Endpoint: `POST /api/contact`

This is a regular API route (not a server action), so `curl` works directly.

```bash
# Get tenant ID
TENANT_ID=$(sudo -u postgres psql -d cms_multitenant -t -A -c "SELECT id FROM \"Tenant\" WHERE slug='alpha-clinic' LIMIT 1;")

# Matching origin — should return 200
curl -s -w "\nHTTP:%{http_code}" http://alpha.localhost:3000/api/contact \
  -X POST -H "Content-Type: application/json" \
  -H "Origin: http://alpha.localhost:3000" \
  -H "Host: alpha.localhost:3000" \
  -d "{\"tenantId\":\"$TENANT_ID\",\"name\":\"Test\",\"phone\":\"0901111222\"}"

# Mismatched origin — should return 403
curl -s -w "\nHTTP:%{http_code}" http://alpha.localhost:3000/api/contact \
  -X POST -H "Content-Type: application/json" \
  -H "Origin: https://evil.com" \
  -H "Host: alpha.localhost:3000" \
  -d "{\"tenantId\":\"$TENANT_ID\",\"name\":\"Test\",\"phone\":\"0901111222\"}"

# Substring bypass — should also return 403
curl -s -w "\nHTTP:%{http_code}" http://alpha.localhost:3000/api/contact \
  -X POST -H "Content-Type: application/json" \
  -H "Origin: https://evil-alpha.localhost:3000" \
  -H "Host: alpha.localhost:3000" \
  -d "{\"tenantId\":\"$TENANT_ID\",\"name\":\"Test\",\"phone\":\"0901111222\"}"
```

## Tips

- The login form uses placeholder text that looks like pre-filled values but isn't — always click the field and type credentials
- After rate limit testing, **always restart the dev server** before attempting to log in with correct credentials
- Use `alpha.localhost:3000` as the primary test domain; tenant resolution requires a matching domain in the database
- TypeScript check: `npx tsc --noEmit` | ESLint: `npx next lint`
- Vercel preview deployments will fail due to missing `DATABASE_URL` — this is expected and not a code issue
