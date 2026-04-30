import { NextResponse, type NextRequest } from "next/server";

const ADMIN_LOGIN_PATH = "/admin/login";

export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set("x-tenant-host", request.headers.get("host") ?? request.nextUrl.host);
  const pathname = request.nextUrl.pathname;
  headers.set("x-current-path", pathname);
  const sessionToken = request.cookies.get(process.env.SESSION_COOKIE_NAME ?? "cms_admin_session")?.value;

  if (pathname.startsWith("/admin") && pathname !== ADMIN_LOGIN_PATH && !sessionToken) {
    const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next({
    request: {
      headers
    }
  });
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"]
};
