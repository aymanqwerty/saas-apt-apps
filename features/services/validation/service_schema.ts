import { z } from "zod";

export const serviceSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  sort_order: z
    .number("Sort order must be a number")
    .int()
    .min(0, "Cannot be negative"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;
