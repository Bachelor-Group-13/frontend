import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Public paths that don't require authentication
  const publicPaths = ["/auth"];
  const isPublicPath = publicPaths.some(
    (path) =>
      request.nextUrl.pathname === path ||
      request.nextUrl.pathname.startsWith(path)
  );

  if (request.nextUrl.pathname === "/" && token) {
    return NextResponse.redirect(new URL("/garage", request.url));
  }

  // Redirect authenticated users away from public paths
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/garage", request.url));
  }

  // Protected paths that require authentication
  const protectedPaths = ["/garage", "/settings", "/license-plate"];
  const isProtectedPath = protectedPaths.some(
    (path) =>
      request.nextUrl.pathname === path ||
      request.nextUrl.pathname.startsWith(path)
  );

  // Redirect unauthenticated users away from protected paths
  if (isProtectedPath && !token) {
    const redirectUrl = new URL("/auth", request.url);
    redirectUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/auth",
    "/garage/:path*",
    "/settings/:path*",
    "/license-plate/:path*",
  ],
};
