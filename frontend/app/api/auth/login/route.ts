import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

// Zod schema for login request body
const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Zod schema for backend response
const backendLoginSchema = z.object({
  success: z.boolean(),
  accessToken: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    organizationId: z.string(),
    role: z.string(),
    departmentName: z.string().optional().nullable(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Validate request body
    const body = await request.json();
    const parsed = loginBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid request data" },
        { status: 400 }
      );
    }

    // 2. Call NestJS backend
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

    // 3. Validate backend response with Zod
    const rawData = await backendRes.json();
    const validated = backendLoginSchema.safeParse(rawData);
    if (!validated.success) {
      return NextResponse.json(
        { message: "Unexpected response from server" },
        { status: 500 }
      );
    }

    const { accessToken, user } = validated.data;

    // 4. Set access token in httpOnly cookie (Rule #20)
    // NO localStorage, NO document.cookie in client code
    const response = NextResponse.json({
      success: true,
      user, // Return safe user data (no token in body)
    });

    response.cookies.set("auth_token", accessToken, {
      httpOnly: true,       // JS cannot read this — XSS safe ✅
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60,      // 15 minutes (access token expiry)
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
