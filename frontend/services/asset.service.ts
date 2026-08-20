import { AssetCategory } from "@/types";
import { AssetCategoryArraySchema } from "@/lib/validations/asset";

export const assetService = {
  async getCategories(): Promise<AssetCategory[]> {
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

    const res = await fetch(`${baseUrl}/api/assets/categories`, {
      cache: "no-store",
      headers: fetchHeaders,
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch assets');
    }
    const data = await res.json();
    return data as AssetCategory[];
  },

  async getDepartmentAssets(): Promise<any[]> {
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

    const res = await fetch(`${baseUrl}/api/assets/department`, {
      cache: "no-store",
      headers: fetchHeaders,
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch department assets');
    }
    return res.json();
  },

  async createCategory(name: string, prefix?: string): Promise<AssetCategory> {
    const res = await fetch('/api/assets/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, prefix })
    });
    if (!res.ok) {
      throw new Error('Failed to create category');
    }
    return res.json();
  },

  async createAsset(data: any): Promise<any> {
    const res = await fetch('/api/assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      throw new Error('Failed to create asset');
    }
    return res.json();
  },

  async assignAsset(assetId: string, employeeId: string, condition?: string, notes?: string): Promise<any> {
    const res = await fetch(`/api/assets/${assetId}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId, condition, notes })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to assign asset');
    }
    return res.json();
  }
};
