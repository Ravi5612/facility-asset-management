import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function proxyRequest(request: NextRequest) {
  try {
    // Extract the path after /api/proxy/tickets/
    const pathname = request.nextUrl.pathname;
    const path = pathname.replace(/^\/api\/proxy\/tickets\//, "");
    
    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${BACKEND_URL}/tickets/${path}${searchParams ? `?${searchParams}` : ""}`;
    
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    
    const headers = new Headers();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    
    const contentType = request.headers.get("content-type");
    if (contentType) {
      headers.set("Content-Type", contentType);
    }
    
    const body = request.method !== "GET" && request.method !== "HEAD" ? await request.text() : undefined;
    
    const response = await fetch(url, {
      method: request.method,
      headers,
      body,
    });
    
    const data = await response.text();
    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (e) {
      return new NextResponse(data, { status: response.status });
    }
    
    return NextResponse.json(jsonData, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: "Proxy error", details: (error as Error).message }, { status: 500 });
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;