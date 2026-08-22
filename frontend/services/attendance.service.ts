export const attendanceService = {
  async bulkUpload(records: any[]): Promise<any> {
    const isServer = typeof window === "undefined";
    const baseUrl = isServer ? (process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : (process.env.NODE_ENV === "development" ? "http://localhost:3000" : ""))) : "";
    
    let fetchHeaders: HeadersInit = {
      "Content-Type": "application/json"
    };

    if (isServer) {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const authToken = cookieStore.get("auth_token")?.value;
      if (authToken) {
        fetchHeaders["Cookie"] = `auth_token=${authToken}`;
      }
    }

    const res = await fetch(`${baseUrl}/api/proxy/attendance/bulk`, {
      method: "POST",
      headers: fetchHeaders,
      body: JSON.stringify({ records })
    });
    
    if (!res.ok) {
      throw new Error(`Failed to upload attendance: ${res.statusText}`);
    }
    
    return res.json();
  },

  async getDepartmentAttendance(deptName: string, date: string): Promise<any> {
    const isServer = typeof window === "undefined";
    const baseUrl = isServer ? (process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : (process.env.NODE_ENV === "development" ? "http://localhost:3000" : ""))) : "";
    
    let fetchHeaders: HeadersInit = {};

    if (isServer) {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const authToken = cookieStore.get("auth_token")?.value;
      if (authToken) {
        fetchHeaders["Cookie"] = `auth_token=${authToken}`;
      }
    }

    const res = await fetch(`${baseUrl}/api/proxy/attendance/department?dept=${encodeURIComponent(deptName)}&date=${encodeURIComponent(date)}`, {
      method: "GET",
      headers: fetchHeaders,
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch attendance: ${res.statusText}`);
    }
    
    return res.json();
  }
};
