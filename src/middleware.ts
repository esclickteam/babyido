import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { getAuthUserId } from "@/lib/auth/session-user";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

function stripLegacyLocalePrefix(pathname: string): string | null {
  if (pathname === "/he" || pathname === "/en") {
    return "/";
  }
  if (pathname.startsWith("/he/") || pathname.startsWith("/en/")) {
    return pathname.replace(/^\/(he|en)/, "") || "/";
  }
  return null;
}

export default auth((request) => {
  const stripped = stripLegacyLocalePrefix(request.nextUrl.pathname);

  if (stripped) {
    const url = request.nextUrl.clone();
    url.pathname = stripped;
    return NextResponse.redirect(url, 308);
  }

  const userId = getAuthUserId(request.auth);
  const { pathname } = request.nextUrl;

  if (userId && (pathname === "/" || pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return intlMiddleware(request);
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
