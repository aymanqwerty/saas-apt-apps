"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { useProfile } from "@/features/doctor/hooks/useProfile";
import { useUpdateProfile } from "@/features/doctor/hooks/useUpdateProfile";
import {
  profileSchema,
  type ProfileFormValues,
} from "@/features/doctor/validation/profile_schema";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { API_ORIGIN, ApiError } from "@/shared/services/api/client";
import { uploadImage } from "@/shared/services/api/media.service";
import type { Doctor } from "@/shared/types/doctor";

function toFormValues(doctor: Doctor): ProfileFormValues {
  return {
    full_name: doctor.full_name,
    email: doctor.email,
    phone_number: doctor.phone_number,
    specialization: doctor.specialization,
    experience_years: doctor.experience_years,
    qualification: doctor.qualification ?? "",
    registration_number: doctor.registration_number ?? "",
    about: doctor.about ?? "",
    languages: doctor.languages?.join(", ") ?? "",
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

export function ProfileForm() {
  const { data: doctor, isPending, isError } = useProfile();

  if (isPending) {
    return <p className="text-muted-foreground">Loading profile...</p>;
  }
  if (isError || !doctor) {
    return (
      <p className="text-destructive">
        Unable to load your profile. Please refresh the page.
      </p>
    );
  }

  return <ProfileFormInner doctor={doctor} />;
}

function ProfileFormInner({ doctor }: { doctor: Doctor }) {
  const updateMutation = useUpdateProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(doctor.profile_photo);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: toFormValues(doctor),
  });

  const handlePhotoChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoError(null);
    setIsUploading(true);
    try {
      const { url } = await uploadImage(file);
      setPhotoUrl(url);
    } catch (error) {
      setPhotoError(
        error instanceof ApiError ? error.message : "Upload failed. Try again.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = (values: ProfileFormValues) => {
    setSaved(false);
    const languages = (values.languages ?? "")
      .split(",")
      .map((language) => language.trim())
      .filter(Boolean);

    updateMutation.mutate(
      {
        full_name: values.full_name,
        email: values.email,
        phone_number: values.phone_number,
        specialization: values.specialization,
        experience_years: values.experience_years,
        qualification: values.qualification?.trim() || null,
        registration_number: values.registration_number?.trim() || null,
        about: values.about?.trim() || null,
        languages: languages.length > 0 ? languages : null,
        profile_photo: photoUrl,
      },
      { onSuccess: () => setSaved(true) },
    );
  };

  const serverError =
    updateMutation.error instanceof ApiError
      ? updateMutation.error.message
      : updateMutation.isError
        ? "Unable to reach the server. Please try again."
        : null;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex max-w-2xl flex-col gap-6"
      noValidate
    >
      <Card>
        <CardHeader>
          <CardTitle>Profile Photo</CardTitle>
          <CardDescription>Shown on your public website.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          {photoUrl ? (
            <Image
              src={`${API_ORIGIN}${photoUrl}`}
              alt="Profile photo"
              width={80}
              height={80}
              className="size-20 rounded-full border object-cover"
            />
          ) : (
            <div className="bg-muted text-muted-foreground flex size-20 items-center justify-center rounded-full border text-xs">
              No photo
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handlePhotoChange}
            />
            <Button
              type="button"
              variant="outline"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? "Uploading..." : "Upload photo"}
            </Button>
            {photoError && (
              <p className="text-destructive text-sm">{photoError}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Full Name"
            htmlFor="full_name"
            error={errors.full_name?.message}
          >
            <Input id="full_name" {...register("full_name")} />
          </Field>
          <Field
            label="Specialization"
            htmlFor="specialization"
            error={errors.specialization?.message}
          >
            <Input id="specialization" {...register("specialization")} />
          </Field>
          <Field
            label="Qualification"
            htmlFor="qualification"
            error={errors.qualification?.message}
          >
            <Input
              id="qualification"
              placeholder="MBBS, MS (Orthopedics)"
              {...register("qualification")}
            />
          </Field>
          <Field
            label="Years of Experience"
            htmlFor="experience_years"
            error={errors.experience_years?.message}
          >
            <Input
              id="experience_years"
              type="number"
              min={0}
              {...register("experience_years", { valueAsNumber: true })}
            />
          </Field>
          <Field
            label="Registration Number"
            htmlFor="registration_number"
            error={errors.registration_number?.message}
          >
            <Input
              id="registration_number"
              {...register("registration_number")}
            />
          </Field>
          <Field
            label="Languages"
            htmlFor="languages"
            error={errors.languages?.message}
          >
            <Input
              id="languages"
              placeholder="English, Hindi"
              {...register("languages")}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          <Field label="Biography" htmlFor="about" error={errors.about?.message}>
            <textarea
              id="about"
              rows={5}
              className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex w-full rounded-lg border bg-transparent px-3 py-2 text-sm shadow-xs transition-colors outline-none focus-visible:ring-3"
              {...register("about")}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Email" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" {...register("email")} />
          </Field>
          <Field
            label="Phone Number"
            htmlFor="phone_number"
            error={errors.phone_number?.message}
          >
            <Input id="phone_number" {...register("phone_number")} />
          </Field>
        </CardContent>
      </Card>

      {serverError && (
        <p className="text-destructive text-sm" role="alert">
          {serverError}
        </p>
      )}
      {saved && !updateMutation.isPending && (
        <p className="text-sm text-green-600" role="status">
          Profile updated successfully.
        </p>
      )}

      <div>
        <Button type="submit" disabled={updateMutation.isPending || isUploading}>
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
