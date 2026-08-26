import { z } from "zod";
import { LoginFormData } from "@/lib/validations/auth";

// Zod schema for the response from our own Next.js API route
const loginResponseSchema = z.object({
  success: z.boolean(),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    organizationId: z.string(),
    role: z.string(),
    departmentName: z.string().optional().nullable(),
  }),
});

export type AuthUser = z.infer<typeof loginResponseSchema>["user"];
export type LoginResponse = z.infer<typeof loginResponseSchema>;

const API_URL = "/api/proxy";

export const authService = {
  login: async (data: LoginFormData): Promise<LoginResponse> => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const raw = await res.json();

    if (!res.ok) {
      throw new Error(raw?.message || "Invalid email or password");
    }

    const parsed = loginResponseSchema.safeParse(raw);
    if (!parsed.success) {
      throw new Error("Unexpected response from server");
    }

    return parsed.data;
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem("auth_user");
    await fetch("/api/auth/logout", { method: "POST" });
  },

  verifyPassword: async (password: string): Promise<boolean> => {
    const res = await fetch(`${API_URL}/auth/verify-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
      credentials: "include",
    });
    if (!res.ok) {
      throw new Error("Incorrect password");
    }
    return true;
  },

  getMe: async (): Promise<any> => {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    // Backend returns { success: true, user: {...} } — return just user
    return data?.user || data || null;
  },
};
