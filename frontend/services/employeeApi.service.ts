import { z } from "zod";

const API_URL = "/api/proxy";

export const employeeSchema = z.object({
  id: z.string(),
  employeeCode: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  email: z.string().email(),
  departmentName: z.string().nullable().optional(),
  designation: z.string().nullable().optional(),
  status: z.string(),
  role: z.string(),
  createdAt: z.string(),
});

export type EmployeeUser = z.infer<typeof employeeSchema>;

export const employeeApi = {
  getEmployees: async (): Promise<EmployeeUser[]> => {
    const res = await fetch(`${API_URL}/users/employees`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch employees");
    const data = await res.json();
    return data as EmployeeUser[];
  },

  createEmployee: async (data: Record<string, unknown>): Promise<void> => {
    const res = await fetch(`${API_URL}/users/employees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to create Employee");
    }
  },
};
