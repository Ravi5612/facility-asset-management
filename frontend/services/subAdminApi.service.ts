import { z } from "zod";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// 1. Zod Schemas for API Response Safety (Rule #19)
export const subAdminSchema = z.object({
  id: z.string(),
  employeeCode: z.string().nullable().optional(),
  email: z.string().email(),
  name: z.string().nullable().optional(),
  status: z.string(),
  role: z.string(),
  departments: z.array(z.string()).optional().default([]),
  createdAt: z.string(),
  assignedAssets: z.number().optional().default(0),
  profileImage: z.string().optional(),
});

export const subAdminListSchema = z.array(subAdminSchema);
export const toggleStatusSchema = z.object({
  id: z.string(),
  status: z.string(),
});

export type SubAdminUser = z.infer<typeof subAdminSchema>;

export const subAdminApiService = {
  async getSubAdmins(): Promise<SubAdminUser[]> {
    const res = await fetch(`${API_URL}/users/sub-admins`, {
      credentials: "include", // Sends HttpOnly cookie automatically
    });
    if (!res.ok) throw new Error("Failed to fetch sub-admins");
    const raw = await res.json();
    return subAdminListSchema.parse(raw); // Validate with Zod
  },

  async createSubAdmin(data: {
    name: string;
    email: string;
    password: string;
    departmentIds: string[];
  }): Promise<SubAdminUser> {
    const res = await fetch(`${API_URL}/users/sub-admins`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message || "Failed to create sub-admin");
    }
    const raw = await res.json();
    return subAdminSchema.parse(raw); // Validate with Zod
  },

  async toggleStatus(id: string): Promise<{ id: string; status: string }> {
    const res = await fetch(`${API_URL}/users/sub-admins/${id}/toggle`, {
      method: "PATCH",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to toggle status");
    const raw = await res.json();
    return toggleStatusSchema.parse(raw); // Validate with Zod
  },

  async deleteSubAdmin(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/users/sub-admins/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to delete sub-admin");
  },
};
