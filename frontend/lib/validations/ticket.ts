import { z } from "zod";

export const TicketStatusSchema = z.enum(["Pending", "In Progress", "Completed"]);
export const PrioritySchema = z.enum(["High", "Medium", "Low"]);

export const TicketSchema = z.object({
  id: z.string(),
  subject: z.string(),
  raisedByDept: z.string(),
  assignedToDept: z.string(),
  handler: z.string().nullable(),
  status: TicketStatusSchema,
  priority: PrioritySchema,
  dateRaised: z.string(),
});

export const TicketArraySchema = z.array(TicketSchema);
