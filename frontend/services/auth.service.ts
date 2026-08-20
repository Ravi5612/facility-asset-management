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

export const authService = {
  // Calls our Next.js API Route (/api/auth/login)
  // which sets the httpOnly cookie — Rule #20 compliant ✅
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

    // Validate response with Zod — Rule #19 ✅
    const parsed = loginResponseSchema.safeParse(raw);
    if (!parsed.success) {
      throw new Error("Unexpected response from server");
    }

    return parsed.data;
  },

  logout: async (): Promise<void> => {
    // Clear UI user data
    localStorage.removeItem("auth_user");
    await fetch("/api/auth/logout", { method: "POST" });
  },
};
