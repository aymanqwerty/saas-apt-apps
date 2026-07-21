import { z } from "zod";

import { MEMBER_RELATIONSHIPS } from "@/shared/types/patient-account";

export const phoneStepSchema = z.object({
  phone_number: z.string().min(7, "Enter a valid phone number").max(20),
});
export type PhoneStepValues = z.infer<typeof phoneStepSchema>;

export const otpStepSchema = z.object({
  code: z.string().regex(/^\d{4,10}$/, "Enter the code you received"),
});
export type OtpStepValues = z.infer<typeof otpStepSchema>;

export const passwordLoginSchema = z.object({
  phone_number: z.string().min(7, "Enter a valid phone number").max(20),
  password: z.string().min(1, "Enter your password"),
});
export type PasswordLoginValues = z.infer<typeof passwordLoginSchema>;

const genderField = z
  .enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY", ""])
  .optional();

const emailField = z
  .union([z.email("Enter a valid email"), z.literal("")])
  .optional();

const dobField = z
  .string()
  .optional()
  .refine(
    (value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value),
    "Enter a valid date",
  );

export const profileSchema = z.object({
  full_name: z.string().min(1, "Name is required").max(150),
  gender: genderField,
  date_of_birth: dobField,
  email: emailField,
});
export type ProfileFormValues = z.infer<typeof profileSchema>;

export const memberSchema = z.object({
  full_name: z.string().min(1, "Name is required").max(150),
  relationship: z.enum(MEMBER_RELATIONSHIPS as [string, ...string[]]),
  phone_number: z
    .string()
    .max(20)
    .optional()
    .refine((v) => !v || v.length >= 7, "Enter a valid phone number"),
  gender: genderField,
  date_of_birth: dobField,
  email: emailField,
});
export type MemberFormValues = z.infer<typeof memberSchema>;

export const setPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Use at least 8 characters")
    .max(128, "Too long"),
});
export type SetPasswordValues = z.infer<typeof setPasswordSchema>;
