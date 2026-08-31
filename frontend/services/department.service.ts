// @ts-nocheck
import { z } from "zod";

const API_URL = "/api/proxy";

// Schema to parse individual department from backend
export const departmentSchema = z.object({
  id: z.string(),
  organizationId: z.string().optional(),
  code: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  floor: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
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
      hod: d.hodName || "Unassigned",
      employeeCount: d._count?.employees || 0,
      employees: new Array(d._count?.employees || 0) // some components check employees.length
    }));
  },

  createDepartment: async (data: { name: string; code: string; description?: string; image?: File }): Promise<Department> => {
    let headers: Record<string, string> = {};
    let body: unknown;

    if (data.image) {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('code', data.code);
      if (data.description) formData.append('description', data.description);
      formData.append('image', data.image);
      
      body = formData;
    } else {
      headers = { "Content-Type": "application/json" };
      const { image, ...restData } = data;
      body = JSON.stringify(restData);
    }

    const res = await fetch(`${API_URL}/departments`, {
      method: "POST",
      headers,
      body,
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
      hod: dept.hod ? `${dept.hod.firstName} ${dept.hod.lastName}` : (dept.hodId || "Unassigned"),
      employeeCount: dept.employees?.length || 0,
      employees: dept.employees || []
    };
  },

  updateDepartment: async (id: string, data: { name?: string; code?: string; description?: string; image?: File }): Promise<void> => {
    let headers: Record<string, string> = {};
    let body: unknown;

    if (data.image) {
      const formData = new FormData();
      if (data.name) formData.append('name', data.name);
      if (data.code) formData.append('code', data.code);
      if (data.description !== undefined) formData.append('description', data.description);
      formData.append('image', data.image);
      
      body = formData;
    } else {
      headers = { "Content-Type": "application/json" };
      const { image, ...restData } = data;
      body = JSON.stringify(restData);
    }

    const res = await fetch(`${API_URL}/departments/${id}`, {
      method: "PATCH",
      headers,
      body,
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
  },

  getDepartmentEmployees: async (departmentId: string): Promise<any[]> => {
    const res = await fetch(`${API_URL}/departments/${departmentId}/employees`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch employees");
    return res.json();
  }
};
