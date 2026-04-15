import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = "dokuntag_admin_session";

function getAdminAccessKey() {
  return process.env.ADMIN_ACCESS_KEY?.trim() || "";
}

function isProtectedPath(pathname: string) {
  return pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/api/admin/");
}

function isLoginPath(pathname: string) {
  return pathname === "/admin-login" || pathname === "/api/admin/login";
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!isProtectedPath(pathname) || isLoginPath(pathname)) {
    return NextResponse.next();
  }

  const adminKey = getAdminAccessKey();
  const sessionValue = request.cookies.get(ADMIN_COOKIE_NAME)?.value || "";

  if (adminKey && sessionValue === adminKey) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin/")) {
    return NextResponse.json(
      { ok: false, error: "Yetkisiz erişim." },
      { status: 401 }
    );
  }

  const loginUrl = new URL("/admin-login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"]
};