"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  useAddMember,
  useUpdateMember,
} from "@/features/patient-account/hooks/usePatientAccount";
import { relationshipLabel } from "@/features/patient-account/lib/labels";
import {
  memberSchema,
  type MemberFormValues,
} from "@/features/patient-account/validation/schemas";
import { NativeSelect } from "@/shared/components/NativeSelect";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { ApiError } from "@/shared/services/api/client";
import {
  MEMBER_RELATIONSHIPS,
  type MemberPayload,
  type PatientProfile,
} from "@/shared/types/patient-account";

interface MemberFormDialogProps {
  member?: PatientProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (member: PatientProfile) => void;
}

function toDefaults(member?: PatientProfile): MemberFormValues {
  return {
    full_name: member?.full_name ?? "",
    relationship: (member?.relationship as MemberFormValues["relationship"]) ?? "OTHER",
    phone_number: member?.phone_number ?? "",
    gender: member?.gender ?? "",
    date_of_birth: member?.date_of_birth ?? "",
    email: member?.email ?? "",
  };
}

export function MemberFormDialog({
  member,
  open,
  onOpenChange,
  onSaved,
}: MemberFormDialogProps) {
  const isEdit = Boolean(member);
  const addMutation = useAddMember();
  const updateMutation = useUpdateMember(member?.id ?? "");
  const mutation = isEdit ? updateMutation : addMutation;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    values: toDefaults(member),
  });

  const onSubmit = (values: MemberFormValues) => {
    const payload: MemberPayload = {
      full_name: values.full_name,
      relationship: values.relationship as MemberPayload["relationship"],
      phone_number: values.phone_number?.trim() || null,
      gender: (values.gender || null) as MemberPayload["gender"],
      date_of_birth: values.date_of_birth || null,
      email: values.email || null,
    };
    const handlers = {
      onSuccess: (saved: PatientProfile) => {
        reset(toDefaults());
        onOpenChange(false);
        onSaved?.(saved);
      },
    };
    if (member) {
      updateMutation.mutate(payload, handlers);
    } else {
      addMutation.mutate(payload, handlers);
    }
  };

  const serverError =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.isError
        ? "Unable to save. Please try again."
        : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit family member" : "Add family member"}
          </DialogTitle>
          <DialogDescription>
            Saved people can be selected when booking, so you don&apos;t retype
            their details.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="m_name">Full name</Label>
            <Input id="m_name" {...register("full_name")} />
            {errors.full_name && (
              <p className="text-destructive text-sm">
                {errors.full_name.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="m_rel">Relationship</Label>
              <NativeSelect id="m_rel" {...register("relationship")}>
                {MEMBER_RELATIONSHIPS.map((rel) => (
                  <option key={rel} value={rel}>
                    {relationshipLabel(rel)}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="m_gender">Gender</Label>
              <NativeSelect id="m_gender" {...register("gender")}>
                <option value="">Not specified</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </NativeSelect>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="m_dob">Date of birth</Label>
              <Input id="m_dob" type="date" {...register("date_of_birth")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="m_phone">Phone (optional)</Label>
              <Input id="m_phone" type="tel" {...register("phone_number")} />
              {errors.phone_number && (
                <p className="text-destructive text-sm">
                  {errors.phone_number.message}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="m_email">Email (optional)</Label>
            <Input id="m_email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-destructive text-sm">{errors.email.message}</p>
            )}
          </div>

          {serverError && (
            <p className="text-destructive text-sm" role="alert">
              {serverError}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
