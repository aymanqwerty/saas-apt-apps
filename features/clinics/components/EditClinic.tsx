"use client";

import { useRouter } from "next/navigation";

import {
  ClinicForm,
  toClinicPayload,
} from "@/features/clinics/components/ClinicForm";
import { useClinic, useUpdateClinic } from "@/features/clinics/hooks/useClinics";
import type { ClinicFormValues } from "@/features/clinics/validation/clinic_schema";
import { ApiError } from "@/shared/services/api/client";

export function EditClinic({ clinicId }: { clinicId: string }) {
  const router = useRouter();
  const { data: clinic, isPending, isError } = useClinic(clinicId);
  const updateMutation = useUpdateClinic(clinicId);

  if (isPending) {
    return <p className="text-muted-foreground">Loading clinic...</p>;
  }
  if (isError || !clinic) {
    return <p className="text-destructive">Unable to load this clinic.</p>;
  }

  const handleSubmit = (values: ClinicFormValues) => {
    updateMutation.mutate(toClinicPayload(values), {
      onSuccess: () => router.push("/dashboard/clinics"),
    });
  };

  const serverError =
    updateMutation.error instanceof ApiError
      ? updateMutation.error.message
      : updateMutation.isError
        ? "Unable to update the clinic. Please try again."
        : null;

  return (
    <ClinicForm
      clinic={clinic}
      onSubmit={handleSubmit}
      isPending={updateMutation.isPending}
      serverError={serverError}
      submitLabel="Save Changes"
    />
  );
}
