export const dashboardService = {
  async getSuperadminDashboard(): Promise<any> {
    const isServer = typeof window === "undefined";
    const baseUrl = isServer ? (process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")) : "";
    
    let fetchHeaders: any = {};
    if (isServer) {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const authToken = cookieStore.get("auth_token")?.value;
      if (authToken) {
        fetchHeaders["Cookie"] = `auth_token=${authToken}`;
      }
    }

    const res = await fetch(`${baseUrl}/api/proxy/dashboard/superadmin`, {
      cache: "no-store",
      headers: fetchHeaders,
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch dashboard data');
    }
    return res.json();
  }
};
