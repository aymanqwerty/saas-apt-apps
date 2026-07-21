"use client";

import { useDeleteClinic } from "@/features/clinics/hooks/useClinics";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { ApiError } from "@/shared/services/api/client";
import type { Clinic } from "@/shared/types/clinic";

interface DeleteClinicDialogProps {
  clinic: Clinic;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteClinicDialog({
  clinic,
  open,
  onOpenChange,
}: DeleteClinicDialogProps) {
  const deleteMutation = useDeleteClinic();

  const handleDelete = () => {
    deleteMutation.mutate(clinic.id, {
      onSuccess: () => onOpenChange(false),
    });
  };

  const serverError =
    deleteMutation.error instanceof ApiError
      ? deleteMutation.error.message
      : deleteMutation.isError
        ? "Unable to delete the clinic. Please try again."
        : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete clinic</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete “{clinic.clinic_name}”? This cannot
            be undone.
          </DialogDescription>
        </DialogHeader>
        {serverError && (
          <p className="text-destructive text-sm" role="alert">
            {serverError}
          </p>
        )}
        <DialogFooter>
          <DialogClose
            render={
              <Button variant="outline" disabled={deleteMutation.isPending}>
                Cancel
              </Button>
            }
          />
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
