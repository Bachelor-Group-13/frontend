import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("user")?.value;
  let isUserAuthenticated = false;

  if (token) {
    try {
      const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64").toString()
      );
      const isExpired = Date.now() >= payload.exp * 1000;

      if (!isExpired) {
        isUserAuthenticated = true;
      }
    } catch (error) {
      console.error("Error parsing token:", error);
    }
  }

  if (request.nextUrl.pathname === "/" && !isUserAuthenticated) {
    return NextResponse.next();
  }

  if (isUserAuthenticated) {
    if (
      request.nextUrl.pathname === "/" ||
      request.nextUrl.pathname.startsWith("/auth")
    ) {
      return NextResponse.redirect(new URL("/garage", request.url));
    }
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/garage")) {
    const redirectUrl = new URL("/auth", request.url);
    redirectUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth", "/garage/:path*", "/"],
};
