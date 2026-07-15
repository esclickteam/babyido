import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
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

export default function middleware(request: NextRequest) {
  const stripped = stripLegacyLocalePrefix(request.nextUrl.pathname);

  if (stripped) {
    const url = request.nextUrl.clone();
    url.pathname = stripped;
    return NextResponse.redirect(url, 308);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
