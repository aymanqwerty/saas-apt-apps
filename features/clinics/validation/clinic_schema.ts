import { z } from "zod";

export const clinicSchema = z.object({
  clinic_name: z.string().min(1, "Clinic name is required").max(200),
  address_line_1: z.string().min(1, "Address is required").max(255),
  address_line_2: z.string().max(255).optional(),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  country: z.string().min(1, "Country is required").max(100),
  postal_code: z.string().max(15).optional(),
  google_maps_url: z
    .union([z.url("Enter a valid URL"), z.literal("")])
    .optional(),
  phone_number: z.string().max(20).optional(),
  consultation_fee: z
    .string()
    .optional()
    .refine(
      (value) => !value || /^\d+(\.\d{1,2})?$/.test(value),
      "Enter a valid amount",
    ),
  description: z.string().max(2000).optional(),
});

export type ClinicFormValues = z.infer<typeof clinicSchema>;
