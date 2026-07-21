import { z } from "zod";

export const patientDetailsSchema = z.object({
  name: z.string().min(1, "Name is required").max(150),
  phone_number: z.string().min(7, "Enter a valid phone number").max(20),
  email: z.union([z.email("Enter a valid email"), z.literal("")]).optional(),
  age: z
    .string()
    .optional()
    .refine(
      (value) => !value || (/^\d{1,3}$/.test(value) && Number(value) <= 150),
      "Enter a valid age",
    ),
  gender: z
    .enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY", ""])
    .optional(),
  reason: z.string().max(1000).optional(),
});

export type PatientDetailsValues = z.infer<typeof patientDetailsSchema>;
