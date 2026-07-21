"use client";

import { useRouter } from "next/navigation";

import {
  ClinicForm,
  toClinicPayload,
} from "@/features/clinics/components/ClinicForm";
import { useCreateClinic } from "@/features/clinics/hooks/useClinics";
import type { ClinicFormValues } from "@/features/clinics/validation/clinic_schema";
import { ApiError } from "@/shared/services/api/client";

export function CreateClinic() {
  const router = useRouter();
  const createMutation = useCreateClinic();

  const handleSubmit = (values: ClinicFormValues) => {
    createMutation.mutate(toClinicPayload(values), {
      onSuccess: () => router.push("/dashboard/clinics"),
    });
  };

  const serverError =
    createMutation.error instanceof ApiError
      ? createMutation.error.message
      : createMutation.isError
        ? "Unable to create the clinic. Please try again."
        : null;

  return (
    <ClinicForm
      onSubmit={handleSubmit}
      isPending={createMutation.isPending}
      serverError={serverError}
      submitLabel="Create Clinic"
    />
  );
}
