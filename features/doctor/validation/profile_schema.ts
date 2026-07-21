import { z } from "zod";

export const profileSchema = z.object({
  full_name: z.string().min(1, "Name is required").max(150),
  email: z.email("Enter a valid email address"),
  phone_number: z.string().min(7, "Enter a valid phone number").max(20),
  specialization: z.string().min(1, "Specialization is required").max(150),
  experience_years: z
    .number("Experience must be a number")
    .int()
    .min(0, "Cannot be negative")
    .max(80),
  qualification: z.string().max(500).optional(),
  registration_number: z.string().max(100).optional(),
  about: z.string().max(5000).optional(),
  // Comma-separated in the form; mapped to string[] before submission.
  languages: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
