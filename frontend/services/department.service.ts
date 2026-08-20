import { z } from "zod";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Schema to parse individual department from backend
export const departmentSchema = z.object({
  id: z.string(),
  organizationId: z.string().optional(),
  code: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  hodId: z.string().nullable().optional(),
  hodName: z.string().nullable().optional(),
  status: z.string().default("ACTIVE"),
  _count: z.object({
    employees: z.number().optional(),
  }).optional(),
  employeeCount: z.number().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Department = z.infer<typeof departmentSchema>;

export const departmentService = {
  getDepartments: async (): Promise<any[]> => {
    const res = await fetch(`${API_URL}/departments`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch departments");
    const data = await res.json();
    const parsed = z.array(departmentSchema).parse(data);
    return parsed.map(d => ({
      ...d,
      hod: d.hodId ? "Assigned" : "Unassigned",
      employeeCount: d._count?.employees || 0,
      employees: new Array(d._count?.employees || 0) // some components check employees.length
    }));
  },

  createDepartment: async (data: { name: string; code: string; description?: string }): Promise<Department> => {
    const res = await fetch(`${API_URL}/departments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to create department");
    }
    const result = await res.json();
    return departmentSchema.parse(result);
  },

  getDepartmentById: async (id: string): Promise<any> => {
    const res = await fetch(`${API_URL}/departments/${id}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch department details");
    const dept = await res.json();
    return {
      ...dept,
      hod: dept.hod?.fullName || dept.hodId || "Unassigned",
      employeeCount: dept.employees?.length || 0,
      employees: dept.employees || []
    };
  },

  updateDepartment: async (id: string, data: { name?: string; code?: string; description?: string }): Promise<void> => {
    const res = await fetch(`${API_URL}/departments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to update department");
    }
  },

  deleteDepartment: async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/departments/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to delete department");
    }
  }
};
