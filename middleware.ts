import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "./utils/auth";

export function middleware(request: NextRequest) {
  // Check if the user is authenticated
  const isUserAuthenticated = isAuthenticated();

  // Redirect to auth page if not authenticated and trying to access protected routes
  if (request.nextUrl.pathname.startsWith("/garage") && !isUserAuthenticated) {
    const redirectUrl = new URL("/auth", request.url);
    redirectUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect to garage if already authenticated and trying to access auth page
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
