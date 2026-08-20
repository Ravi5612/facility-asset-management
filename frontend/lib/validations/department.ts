import { z } from "zod";

export const EmployeeSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
  status: z.enum(["Active", "Inactive"]),
  assetsAssigned: z.number().optional(),
  attendance: z.string().optional(),
  salary: z.string().optional(),
  performance: z.string().optional(),
});

export const DepartmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  hod: z.string(),
  employeeCount: z.number(),
  status: z.enum(["Active", "Inactive"]),
  dateCreated: z.string(),
  description: z.string(),
  employees: z.array(EmployeeSchema),
});

export const DepartmentArraySchema = z.array(DepartmentSchema);

export const AddDepartmentFormSchema = z.object({
  deptName: z.string().min(2, "Department name is required"),
  hodName: z.string().min(2, "HOD name is required"),
  hodEmail: z.string().email("Invalid email address"),
  hodPassword: z.string().min(6, "Password must be at least 6 characters"),
  hodConfirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
  description: z.string().optional(),
}).refine(data => data.hodPassword === data.hodConfirmPassword, {
  message: "Passwords do not match",
  path: ["hodConfirmPassword"],
});

export type AddDepartmentFormValues = z.infer<typeof AddDepartmentFormSchema>;
