"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarDays,
  LogOut,
  Pencil,
  Plus,
  Trash2,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { MemberFormDialog } from "@/features/patient-account/components/MemberFormDialog";
import {
  useDeleteMember,
  useMyAppointments,
  useMyMembers,
  useUpsertProfile,
} from "@/features/patient-account/hooks/usePatientAccount";
import {
  usePatientLogout,
  usePatientSession,
  useSetPatientPassword,
} from "@/features/patient-account/hooks/usePatientAuth";
import { personMeta, relationshipLabel } from "@/features/patient-account/lib/labels";
import {
  profileSchema,
  setPasswordSchema,
  type ProfileFormValues,
  type SetPasswordValues,
} from "@/features/patient-account/validation/schemas";
import { NativeSelect } from "@/shared/components/NativeSelect";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import type { PatientProfile } from "@/shared/types/patient-account";

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AccountDashboard({ slug }: { slug: string }) {
  const { data: session, isPending } = usePatientSession(slug);

  if (isPending) {
    return <p className="text-muted-foreground text-sm">Loading...</p>;
  }

  if (!session) {
    return (
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle>You&apos;re not signed in</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-muted-foreground text-sm">
            Sign in to view your profile, family members and appointments.
          </p>
          <Button render={<Link href={`/dr/${slug}/login`} />}>Sign in</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ProfileCard slug={slug} profile={session.profile} phone={session.account.phone_number} />
      <MembersCard />
      <AppointmentsCard />
      <PasswordCard hasPassword={session.account.has_password} />
      <LogoutRow slug={slug} />
    </div>
  );
}

function SectionCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="text-base">{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function ProfileCard({
  slug,
  profile,
  phone,
}: {
  slug: string;
  profile: PatientProfile | null;
  phone: string;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <SectionCard
      title="Your profile"
      action={
        profile && (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="size-3.5" />
            Edit
          </Button>
        )
      }
    >
      {profile ? (
        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
          <Field label="Name" value={profile.full_name} />
          <Field label="Mobile" value={phone} />
          <Field label="Age / Gender" value={personMeta(profile.age, profile.gender) || "—"} />
          <Field label="Email" value={profile.email || "—"} />
        </dl>
      ) : (
        <div className="flex flex-col items-start gap-3">
          <p className="text-muted-foreground text-sm">
            Add your details so we can pre-fill your bookings.
          </p>
          <Button size="sm" onClick={() => setEditing(true)}>
            Complete profile
          </Button>
        </div>
      )}
      <ProfileEditDialog
        slug={slug}
        profile={profile}
        open={editing}
        onOpenChange={setEditing}
      />
    </SectionCard>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}

function ProfileEditDialog({
  slug,
  profile,
  open,
  onOpenChange,
}: {
  slug: string;
  profile: PatientProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  void slug;
  const mutation = useUpsertProfile();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      full_name: profile?.full_name ?? "",
      gender: profile?.gender ?? "",
      date_of_birth: profile?.date_of_birth ?? "",
      email: profile?.email ?? "",
    },
  });

  const onSubmit = (v: ProfileFormValues) => {
    mutation.mutate(
      {
        full_name: v.full_name,
        gender: (v.gender || null) as PatientProfile["gender"],
        date_of_birth: v.date_of_birth || null,
        email: v.email || null,
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="p_name">Full name</Label>
            <Input id="p_name" {...register("full_name")} />
            {errors.full_name && (
              <p className="text-destructive text-sm">
                {errors.full_name.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="p_gender">Gender</Label>
              <NativeSelect id="p_gender" {...register("gender")}>
                <option value="">Prefer not to say</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </NativeSelect>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="p_dob">Date of birth</Label>
              <Input id="p_dob" type="date" {...register("date_of_birth")} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="p_email">Email (optional)</Label>
            <Input id="p_email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-destructive text-sm">{errors.email.message}</p>
            )}
          </div>
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

function MembersCard() {
  const { data: members, isPending } = useMyMembers();
  const deleteMutation = useDeleteMember();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PatientProfile | undefined>(undefined);

  const openAdd = () => {
    setEditing(undefined);
    setDialogOpen(true);
  };
  const openEdit = (member: PatientProfile) => {
    setEditing(member);
    setDialogOpen(true);
  };
  const remove = (member: PatientProfile) => {
    if (window.confirm(`Remove ${member.full_name} from your family members?`)) {
      deleteMutation.mutate(member.id);
    }
  };

  return (
    <SectionCard
      title="Family members"
      action={
        <Button variant="outline" size="sm" onClick={openAdd}>
          <Plus className="size-3.5" />
          Add
        </Button>
      }
    >
      {isPending ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : !members || members.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No family members yet. Add one to book on their behalf without
          retyping their details.
        </p>
      ) : (
        <ul className="flex flex-col divide-y">
          {members.map((member) => (
            <li
              key={member.id}
              className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-3">
                <span className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-full">
                  <UserRound className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-medium">{member.full_name}</p>
                  <p className="text-muted-foreground text-xs">
                    {[
                      relationshipLabel(member.relationship),
                      personMeta(member.age, member.gender),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => openEdit(member)}
                  aria-label="Edit"
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => remove(member)}
                  aria-label="Remove"
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="text-destructive size-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <MemberFormDialog
        member={editing}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </SectionCard>
  );
}

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  COMPLETED: "bg-blue-50 text-blue-700 border-blue-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
  NO_SHOW: "bg-muted text-muted-foreground border-border",
};

function AppointmentsCard() {
  const { data: appointments, isPending } = useMyAppointments();

  return (
    <SectionCard title="My appointments">
      {isPending ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : !appointments || appointments.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          You have no appointments yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {appointments.map((appt) => (
            <li
              key={appt.id}
              className="flex flex-col gap-2 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{appt.patient_name}</span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                      STATUS_STYLES[appt.appointment_status] ??
                      "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {appt.appointment_status}
                  </span>
                </div>
                <p className="text-muted-foreground text-xs">
                  {appt.clinic_name} · Token {appt.token_number} ·{" "}
                  {appt.appointment_number}
                </p>
              </div>
              <div className="text-muted-foreground flex items-center gap-2 text-sm sm:flex-col sm:items-end sm:gap-0">
                <span className="text-foreground flex items-center gap-1.5 font-medium">
                  <CalendarDays className="size-3.5" />
                  {formatDate(appt.appointment_date)}
                </span>
                <span className="text-xs">
                  {appt.start_time.slice(0, 5)} – {appt.end_time.slice(0, 5)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

function PasswordCard({ hasPassword }: { hasPassword: boolean }) {
  const mutation = useSetPatientPassword();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SetPasswordValues>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: { password: "" },
  });

  return (
    <SectionCard title={hasPassword ? "Change password" : "Set a password"}>
      <form
        onSubmit={handleSubmit((v) =>
          mutation.mutate(v.password, { onSuccess: () => reset() }),
        )}
        className="flex flex-col gap-3 sm:flex-row sm:items-start"
        noValidate
      >
        <div className="flex flex-1 flex-col gap-1.5">
          <Input
            type="password"
            autoComplete="new-password"
            placeholder="New password (min 8 characters)"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-destructive text-sm">{errors.password.message}</p>
          )}
          <p className="text-muted-foreground text-xs">
            Optional — lets you sign in without waiting for a code next time.
          </p>
        </div>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Save password"}
        </Button>
      </form>
    </SectionCard>
  );
}

function LogoutRow({ slug }: { slug: string }) {
  const router = useRouter();
  const logout = usePatientLogout();

  return (
    <div className="flex justify-end">
      <Button
        variant="outline"
        onClick={() =>
          logout.mutate(undefined, {
            onSuccess: () => {
              router.push(`/dr/${slug}`);
              router.refresh();
            },
          })
        }
        disabled={logout.isPending}
      >
        <LogOut className="size-4" />
        Sign out
      </Button>
    </div>
  );
}
