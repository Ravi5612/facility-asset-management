import { z } from "zod";

// Base Schema for API validation
export const visitorBaseSchema = z.object({
  id: z.string(),
  visitorName: z.string().min(2, "Name must be at least 2 characters"),
  visitorCompany: z.string().optional(),
  phone: z.string().min(10, "Valid phone number required"),
  purpose: z.string().min(3, "Please specify the purpose of visit"),
  hostName: z.string().min(2, "Host name is required"),
  hostEmpCode: z.string().min(2, "Host employee code is required"),
  approvalStatus: z.enum(["Pending", "Approved", "Rejected"]),
  visitState: z.enum(["Expected", "Inside", "Checked Out"]),
  date: z.string(),
  timeIn: z.string().nullable(),
  timeOut: z.string().nullable(),
});

export const VisitorArraySchema = z.array(visitorBaseSchema);

// Schema for frontend form (Create)
export const createVisitorFormSchema = z.object({
  visitorName: z.string().min(2, "Name must be at least 2 characters"),
  visitorCompany: z.string().optional(),
  phone: z.string().min(10, "Valid phone number required"),
  purpose: z.string().min(3, "Please specify the purpose of visit"),
  hostName: z.string().min(2, "Host name is required"),
  hostEmpCode: z.string().min(2, "Host employee code is required"),
});

export type CreateVisitorFormValues = z.infer<typeof createVisitorFormSchema>;
