import { z } from "zod";

export const subAdminSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").optional(), // Optional for edits, required for creation handled in form if needed
  confirmPassword: z.string().optional(),
  profileImage: z.any().optional(),
  departments: z.array(z.string()).min(1, "Select at least one department"),
  status: z.enum(["Active", "Suspend"]).default("Active"),
}).refine((data) => {
  if (data.password && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type SubAdminFormValues = z.infer<typeof subAdminSchema>;
