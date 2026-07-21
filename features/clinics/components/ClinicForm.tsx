"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  clinicSchema,
  type ClinicFormValues,
} from "@/features/clinics/validation/clinic_schema";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import type { ClinicPayload } from "@/shared/services/api/clinic.service";
import type { Clinic } from "@/shared/types/clinic";

function toFormValues(clinic?: Clinic): ClinicFormValues {
  return {
    clinic_name: clinic?.clinic_name ?? "",
    address_line_1: clinic?.address_line_1 ?? "",
    address_line_2: clinic?.address_line_2 ?? "",
    city: clinic?.city ?? "",
    state: clinic?.state ?? "",
    country: clinic?.country ?? "India",
    postal_code: clinic?.postal_code ?? "",
    google_maps_url: clinic?.google_maps_url ?? "",
    phone_number: clinic?.phone_number ?? "",
    consultation_fee: clinic?.consultation_fee ?? "",
    description: clinic?.description ?? "",
  };
}

export function toClinicPayload(values: ClinicFormValues): ClinicPayload {
  return {
    clinic_name: values.clinic_name,
    address_line_1: values.address_line_1,
    address_line_2: values.address_line_2?.trim() || null,
    city: values.city,
    state: values.state,
    country: values.country,
    postal_code: values.postal_code?.trim() || null,
    google_maps_url: values.google_maps_url?.trim() || null,
    phone_number: values.phone_number?.trim() || null,
    consultation_fee: values.consultation_fee?.trim() || null,
    description: values.description?.trim() || null,
  };
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}

interface ClinicFormProps {
  clinic?: Clinic;
  onSubmit: (values: ClinicFormValues) => void;
  isPending: boolean;
  serverError: string | null;
  submitLabel: string;
}

export function ClinicForm({
  clinic,
  onSubmit,
  isPending,
  serverError,
  submitLabel,
}: ClinicFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClinicFormValues>({
    resolver: zodResolver(clinicSchema),
    defaultValues: toFormValues(clinic),
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex max-w-2xl flex-col gap-6"
      noValidate
    >
      <Card>
        <CardHeader>
          <CardTitle>Clinic Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field
              label="Clinic Name"
              htmlFor="clinic_name"
              error={errors.clinic_name?.message}
            >
              <Input id="clinic_name" {...register("clinic_name")} />
            </Field>
          </div>
          <Field
            label="Address Line 1"
            htmlFor="address_line_1"
            error={errors.address_line_1?.message}
          >
            <Input id="address_line_1" {...register("address_line_1")} />
          </Field>
          <Field
            label="Address Line 2 (optional)"
            htmlFor="address_line_2"
            error={errors.address_line_2?.message}
          >
            <Input id="address_line_2" {...register("address_line_2")} />
          </Field>
          <Field label="City" htmlFor="city" error={errors.city?.message}>
            <Input id="city" {...register("city")} />
          </Field>
          <Field label="State" htmlFor="state" error={errors.state?.message}>
            <Input id="state" {...register("state")} />
          </Field>
          <Field
            label="Country"
            htmlFor="country"
            error={errors.country?.message}
          >
            <Input id="country" {...register("country")} />
          </Field>
          <Field
            label="Postal Code (optional)"
            htmlFor="postal_code"
            error={errors.postal_code?.message}
          >
            <Input id="postal_code" {...register("postal_code")} />
          </Field>
          <Field
            label="Phone Number (optional)"
            htmlFor="phone_number"
            error={errors.phone_number?.message}
          >
            <Input id="phone_number" {...register("phone_number")} />
          </Field>
          <Field
            label="Consultation Fee (optional)"
            htmlFor="consultation_fee"
            error={errors.consultation_fee?.message}
          >
            <Input
              id="consultation_fee"
              inputMode="decimal"
              placeholder="500.00"
              {...register("consultation_fee")}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field
              label="Google Maps URL (optional)"
              htmlFor="google_maps_url"
              error={errors.google_maps_url?.message}
            >
              <Input
                id="google_maps_url"
                placeholder="https://maps.google.com/..."
                {...register("google_maps_url")}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field
              label="Description (optional)"
              htmlFor="description"
              error={errors.description?.message}
            >
              <textarea
                id="description"
                rows={3}
                className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex w-full rounded-lg border bg-transparent px-3 py-2 text-sm shadow-xs transition-colors outline-none focus-visible:ring-3"
                {...register("description")}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      {serverError && (
        <p className="text-destructive text-sm" role="alert">
          {serverError}
        </p>
      )}

      <div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
