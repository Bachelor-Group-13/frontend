import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("user")?.value;
  const isUserAuthenticated = Boolean(token);

  if (request.nextUrl.pathname.startsWith("/garage") && !isUserAuthenticated) {
    const redirectUrl = new URL("/auth", request.url);
    redirectUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (
    (request.nextUrl.pathname === "/" ||
      request.nextUrl.pathname.startsWith("/auth")) &&
    isUserAuthenticated
  ) {
    return NextResponse.redirect(new URL("/garage", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth", "/garage/:path*", "/"],
};
