import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";

  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);

  const backendUrl = `${process.env.BACKEND_URL || "http://localhost:3001"}/assets/inventory-log${params.toString() ? `?${params.toString()}` : ""}`;

  const res = await fetch(backendUrl, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Cookie: `auth_token=${token}` } : {}),
    },
    cache: "no-store",
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
