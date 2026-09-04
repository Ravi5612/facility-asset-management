import { AssetCategory } from "@/types";
import { AssetCategoryArraySchema } from "@/lib/validations/asset";

export interface CreateAssetPayload {
  assetName: string;
  categoryId: string;
  departmentId?: string;
  serialNumber: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  notes?: string;
}

export const assetService = {
  async getCategories(): Promise<any> {
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

  async getDepartmentAssets(viewMode?: string): Promise<any[]> {
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

    const url = viewMode
      ? `${baseUrl}/api/assets/department?viewMode=${viewMode}`
      : `${baseUrl}/api/assets/department`;

    const res = await fetch(url, {
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

  async createAsset(data: CreateAssetPayload): Promise<AssetCategory> {
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

  async assignAsset(assetId: string, employeeId: string | undefined, condition?: string, notes?: string, networkDetails?: any, replaceExisting?: boolean, existingSerialNumber?: string, swapAction?: string): Promise<any> {
    const res = await fetch(`/api/assets/${assetId}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId, condition, notes, ...networkDetails, replaceExisting, existingSerialNumber, swapAction })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to assign asset');
    }
    return res.json();
  },

  async shiftAsset(assetId: string, departmentId: string, notes?: string, networkDetails?: any): Promise<any> {
    const res = await fetch(`/api/assets/${assetId}/shift`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ departmentId, notes, ...networkDetails })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to shift asset');
    }
    return res.json();
  },

  async unassignAsset(assetId: string, notes?: string, returnedTo?: string): Promise<any> {
    const res = await fetch(`/api/proxy/assets/${assetId}/unassign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes, returnedTo })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to unassign asset');
    }
    return res.json();
  },

  async updateAssetStatus(assetId: string, status: string, notes?: string): Promise<any> {
    const res = await fetch(`/api/assets/${assetId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update asset status');
    }
    return res.json();
  },

  async getAssignedToMeAssets(): Promise<any[]> {
    const res = await fetch("/api/assets/assigned-to-me", {
      cache: "no-store",
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || "Failed to fetch assigned assets");
    }
    return res.json();
  }
};
