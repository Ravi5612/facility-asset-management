import { z } from "zod";

const API_URL = "/api/proxy";

export const hodSchema = z.object({
  id: z.string(),
  employeeCode: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  email: z.string().email(),
  departmentName: z.string().nullable().optional(),
  status: z.string(),
  role: z.string(),
  createdAt: z.string(),
});

export type HOD = z.infer<typeof hodSchema>;

export const hodApi = {
  getHods: async (): Promise<HOD[]> => {
    const res = await fetch(`${API_URL}/users/hod`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch HODs");
    const data = await res.json();
    return z.array(hodSchema).parse(data);
  },

  createHod: async (data: Record<string, any>): Promise<void> => {
    const res = await fetch(`${API_URL}/users/hod`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to create HOD");
    }
  },
};
