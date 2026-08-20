import { z } from "zod";

export const baseSubAdminSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  departments: z.array(z.string()).min(1, "Select at least one department"),
  status: z.enum(["Active", "Inactive"]),
  profileImage: z.union([
    z.custom<File>((val) => val instanceof File, "Please provide a valid file"),
    z.string()
  ]).optional(),
});

export const createSubAdminSchema = baseSubAdminSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const updateSubAdminSchema = baseSubAdminSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
}).refine((data) => {
  if (data.password && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// We keep a combined type for the form fields
export type SubAdminFormValues = z.infer<typeof updateSubAdminSchema>;
