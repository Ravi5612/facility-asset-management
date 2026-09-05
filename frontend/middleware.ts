import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/"];
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

// Maps URL prefix → allowed roles
const ROUTE_ROLE_MAP: Record<string, string[]> = {
  "/superadmin": ["SUPER_ADMIN"],
  "/sub-admin": ["SUB_ADMIN"],
  "/hod": ["HOD"],
  "/employee": ["EMPLOYEE"],
};

// Manual JWT decode — works in Edge Runtime without any package
function getTokenPayload(token: string): any {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

function getRedirectUrlForRole(payload: any, baseUrl: string): string {
  if (!payload || !payload.role) return new URL("/login", baseUrl).toString();
  
  switch (payload.role) {
    case "SUPER_ADMIN": return new URL("/superadmin", baseUrl).toString();
    case "SUB_ADMIN":   return new URL("/sub-admin/dashboard", baseUrl).toString();
    case "HOD": {
      const deptSlug = payload.departmentName 
        ? payload.departmentName.toLowerCase().replace(/\s+/g, '-') 
        : "general";
      return new URL(`/hod/${deptSlug}/dashboard`, baseUrl).toString();
    }
    case "EMPLOYEE":    return new URL("/employee/dashboard", baseUrl).toString();
    default:            return new URL("/login", baseUrl).toString();
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  let tokenValue = request.cookies.get("auth_token")?.value;
  const refreshTokenCookie = request.cookies.get("refresh_token");

  console.log(`[Middleware] Path: ${pathname} | HasAuthToken: ${!!tokenValue} | HasRefreshToken: ${!!refreshTokenCookie}`);

  // If no auth token, but we have a refresh token → attempt silent refresh
  if (!tokenValue && refreshTokenCookie?.value) {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          Cookie: `refresh_token=${refreshTokenCookie.value}`,
        },
      });

      if (res.ok) {
        // Backend sets auth_token via Set-Cookie header (not in body)
        // Forward those cookies and extract the new auth_token value
        const setCookies = res.headers.getSetCookie?.() ?? 
          (res.headers.get("set-cookie") ? [res.headers.get("set-cookie")!] : []);

        const response = NextResponse.next();

        for (const cookieStr of setCookies) {
          response.headers.append("Set-Cookie", cookieStr);

          // Extract auth_token value so we can proceed with role check
          const authMatch = cookieStr.match(/^auth_token=([^;]+)/);
          if (authMatch) {
            tokenValue = authMatch[1];
          }
        }

        if (tokenValue) {
          // Successfully refreshed — continue to role check below
        } else {
          // Refresh endpoint returned ok but no auth_token cookie — redirect to login
          const loginUrl = new URL("/login", request.url);
          loginUrl.searchParams.set("from", pathname);
          return NextResponse.redirect(loginUrl);
        }

        return response;
      }
    } catch (err) {
      console.error("Silent refresh failed in middleware", err);
    }
  }

  // No token at all → redirect to login
  if (!tokenValue) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ✅ ROLE CHECK: Decode token and verify the user has the right role for this route
  const userPayload = getTokenPayload(tokenValue);
  const userRole = userPayload?.role;

  for (const [routePrefix, allowedRoles] of Object.entries(ROUTE_ROLE_MAP)) {
    if (pathname.startsWith(routePrefix)) {
      if (!userRole || !allowedRoles.includes(userRole)) {
        // User is logged in but wrong role — redirect to their actual dashboard
        const redirectUrl = getRedirectUrlForRole(userPayload, request.url);
        return NextResponse.redirect(redirectUrl);
      }
      break;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/superadmin/:path*", "/sub-admin/:path*", "/hod/:path*", "/employee/:path*"],
};
