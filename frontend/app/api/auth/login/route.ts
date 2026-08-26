import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const backendLoginSchema = z.object({
  success: z.boolean(),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    organizationId: z.string(),
    role: z.string(),
    departmentName: z.string().optional().nullable(),
    themeColor: z.string().optional(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid request data" }, { status: 400 });
    }

    const backendRes = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    if (!backendRes.ok) {
      const err = await backendRes.json().catch(() => ({}));
      return NextResponse.json(
        { message: err?.message || "Invalid email or password" },
        { status: backendRes.status }
      );
    }

    const rawData = await backendRes.json();
    const validated = backendLoginSchema.safeParse(rawData);
    if (!validated.success) {
      return NextResponse.json({ message: "Unexpected response from server" }, { status: 500 });
    }

    const { user } = validated.data;

    const response = NextResponse.json({ success: true, user });

    // Forward ALL cookies set by NestJS backend (auth_token + refresh_token)
    if (backendRes.headers.getSetCookie) {
      const setCookies = backendRes.headers.getSetCookie();
      setCookies.forEach((cookieStr) => {
        response.headers.append("Set-Cookie", cookieStr);
      });
    } else {
      const rawCookie = backendRes.headers.get("set-cookie");
      if (rawCookie) {
        response.headers.append("Set-Cookie", rawCookie);
      }
    }

    // Set theme color cookie (non-sensitive, can be readable)
    if (user.themeColor) {
      response.cookies.set("app-theme-color", user.themeColor, { path: "/", maxAge: 365 * 24 * 60 * 60 });
    }

    return response;
  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
