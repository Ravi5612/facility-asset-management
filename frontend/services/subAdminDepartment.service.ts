import { z } from "zod";

const API_URL = "/api/proxy";

// Rule #19 — Zod schema for API response validation
export const myDepartmentsSchema = z.object({
  departments: z.array(z.string()),
  assignedTo: z.string().nullable().optional(),
});

export type MyDepartments = z.infer<typeof myDepartmentsSchema>;

export const subAdminDepartmentService = {
  // GET /users/my-departments — Sub-Admin k assigned departments
  async getMyDepartments(): Promise<MyDepartments> {
    const res = await fetch(`${API_URL}/users/my-departments`, {
      credentials: "include", // sends HttpOnly cookie — Rule #20 ✅
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message || "Failed to fetch departments");
    }
    const raw = await res.json();
    // Validate API response with Zod — Rule #19 ✅
    return myDepartmentsSchema.parse(raw);
  },
};
