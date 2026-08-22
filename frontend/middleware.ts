import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/"];
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  const tokenCookie = request.cookies.get("auth_token");
  const refreshTokenCookie = request.cookies.get("refresh_token");

  // If no auth token, but we have a refresh token -> attempt silent refresh
  if (!tokenCookie?.value && refreshTokenCookie?.value) {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          Cookie: `refresh_token=${refreshTokenCookie.value}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.accessToken) {
          // Success! Create the response and attach the new token
          const response = NextResponse.next();
          response.cookies.set("auth_token", data.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60, // 15 mins
            path: "/",
          });
          if (data.user?.themeColor) {
            response.cookies.set("app-theme-color", data.user.themeColor, { path: "/", maxAge: 365 * 24 * 60 * 60 });
          }
          return response;
        }
      }
    } catch (err) {
      console.error("Silent refresh failed in middleware", err);
    }
  }

  // If still no auth token after attempting refresh, redirect to login
  if (!tokenCookie?.value && !refreshTokenCookie?.value) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/superadmin/:path*", "/sub-admin/:path*", "/hod/:path*", "/employee/:path*"],
};
