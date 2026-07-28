"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  Banknote,
  Building2,
  CalendarDays,
  Check,
  ChevronLeft,
  CircleCheck,
  Clock,
  MapPin,
  Plus,
  ShieldCheck,
  Stethoscope,
  UserPlus,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import {
  BookingCalendar,
  isoOf,
} from "@/features/booking/components/BookingCalendar";
import { BookingConfirmationCard } from "@/features/booking/components/BookingConfirmationCard";
import {
  useAvailabilityDates,
  useConfirmBooking,
  usePublicDoctor,
  usePublicSettings,
  usePublicSlots,
  useStartBooking,
} from "@/features/booking/hooks/useBooking";
import {
  loadRazorpay,
  openRazorpayCheckout,
} from "@/features/booking/lib/razorpay";
import {
  patientDetailsSchema,
  type PatientDetailsValues,
} from "@/features/booking/validation/booking_schema";
import { MemberFormDialog } from "@/features/patient-account/components/MemberFormDialog";
import { useMyMembers } from "@/features/patient-account/hooks/usePatientAccount";
import {
  MY_MEMBERS_KEY,
  usePatientSession,
} from "@/features/patient-account/hooks/usePatientAuth";
import {
  personMeta,
  relationshipLabel,
} from "@/features/patient-account/lib/labels";
import { NativeSelect } from "@/shared/components/NativeSelect";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/lib/utils";
import { ApiError, mediaUrl } from "@/shared/services/api/client";
import { releaseBooking } from "@/shared/services/api/public.service";
import type {
  BookingConfirmation,
  PaymentOrderInfo,
  PublicClinic,
  PublicSlot,
} from "@/shared/types/booking";
import {
  MEMBER_RELATIONSHIPS,
  type PatientProfile,
} from "@/shared/types/patient-account";

interface Prefill {
  name: string;
  email?: string;
  contact: string;
}

/** "Someone else" — one-off details typed by a logged-in patient. */
interface ManualDetails {
  name: string;
  phone: string;
  email: string;
  age: string;
  gender: string;
  save_as_member: boolean;
  relationship: string;
}

const MANUAL_ID = "__manual__";

const STEPS = ["Clinic", "Date & time", "Your details"];
const CONTROL = "h-10";

function clinicAddress(clinic: PublicClinic): string {
  return [clinic.address_line_1, clinic.city, clinic.state]
    .filter(Boolean)
    .join(", ");
}

function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function BookingWizard({ slug }: { slug: string }) {
  const { data: profile, isPending, isError } = usePublicDoctor(slug);
  const { data: settings } = usePublicSettings(slug);
  const { data: session } = usePatientSession(slug);
  const loggedIn = Boolean(session);
  const { data: members } = useMyMembers(loggedIn);
  const startMutation = useStartBooking();
  const confirmMutation = useConfirmBooking();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(0);
  const [selectedClinicId, setSelectedClinicId] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState<PublicSlot | null>(null);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(
    null,
  );
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Logged-in patients book for a saved profile (self or a family member).
  const profiles = useMemo<PatientProfile[]>(
    () => (session?.profile ? [session.profile, ...(members ?? [])] : []),
    [session, members],
  );
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [accountReason, setAccountReason] = useState("");
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const activeProfileId = selectedProfileId || profiles[0]?.id || "";
  const activeProfile =
    profiles.find((p) => p.id === activeProfileId) ?? null;

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm<PatientDetailsValues>({
    resolver: zodResolver(patientDetailsSchema),
    defaultValues: {
      name: "",
      phone_number: "",
      email: "",
      age: "",
      gender: "",
      reason: "",
    },
  });

  const clinics = profile?.clinics ?? [];
  // Pre-select when there is only one clinic.
  const clinicId =
    selectedClinicId || (clinics.length === 1 ? clinics[0].id : "");
  const selectedClinic = clinics.find((c) => c.id === clinicId);

  const { data: slots, isFetching: slotsFetching } = usePublicSlots(
    slug,
    clinicId || null,
    date || null,
  );

  const selectClinic = (id: string) => {
    setSelectedClinicId(id);
    setDate("");
    setSlot(null);
  };
  const selectDate = (iso: string) => {
    setDate(iso);
    setSlot(null);
  };

  const resetAll = () => {
    startMutation.reset();
    confirmMutation.reset();
    resetForm();
    setStep(0);
    setSelectedClinicId("");
    setDate("");
    setSlot(null);
    setConfirmation(null);
    setProcessing(false);
    setPaymentError(null);
    setSelectedProfileId("");
    setAccountReason("");
  };

  // Advance payment applies only when the doctor requires it AND the clinic has
  // a positive fee. The server is the source of truth; this drives the UI label.
  const feeAmount = Number(selectedClinic?.consultation_fee ?? 0);
  const needsPayment = Boolean(
    settings?.payment_required && feeAmount > 0,
  );

  const runPayment = (
    holdId: string,
    payment: PaymentOrderInfo,
    prefill: Prefill,
  ) => {
    setProcessing(true);
    loadRazorpay().then((ready) => {
      if (!ready) {
        setProcessing(false);
        setPaymentError(
          "Could not load the payment gateway. Please try again.",
        );
        void releaseBooking(holdId).catch(() => {});
        return;
      }

      const opened = openRazorpayCheckout({
        key: payment.key_id,
        amount: payment.amount,
        currency: payment.currency,
        order_id: payment.order_id,
        name: payment.doctor_name,
        description: `Consultation at ${payment.clinic_name}`,
        prefill: {
          name: prefill.name,
          email: prefill.email,
          contact: prefill.contact,
        },
        theme: { color: "#2563eb" },
        handler: (response) => {
          confirmMutation
            .mutateAsync({
              holdId,
              payload: {
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              },
            })
            .then((conf) => setConfirmation(conf))
            .catch((err) =>
              setPaymentError(
                err instanceof ApiError
                  ? err.message
                  : "We couldn't verify your payment. Any amount debited will be refunded.",
              ),
            )
            .finally(() => setProcessing(false));
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            setPaymentError("Payment cancelled — your seat has been released.");
            void releaseBooking(holdId).catch(() => {});
          },
        },
      });

      if (!opened) {
        setProcessing(false);
        setPaymentError("Could not open the payment window. Please try again.");
        void releaseBooking(holdId).catch(() => {});
      }
    });
  };

  const handleStartResult = (
    result: Awaited<ReturnType<typeof startMutation.mutateAsync>>,
    prefill: Prefill,
  ) => {
    if (result.status === "confirmed" && result.appointment) {
      setConfirmation(result.appointment);
    } else if (result.payment && result.hold_id) {
      runPayment(result.hold_id, result.payment, prefill);
    }
  };

  // Guest booking — details typed into the form.
  const onSubmit = (values: PatientDetailsValues) => {
    if (!slot) return;
    setPaymentError(null);
    startMutation
      .mutateAsync({
        doctor_slug: slug,
        slot_id: slot.id,
        name: values.name,
        phone_number: values.phone_number,
        email: values.email ? values.email : null,
        age:
          values.age === "" || values.age === undefined
            ? null
            : Number(values.age),
        gender: values.gender ? values.gender : null,
        reason: values.reason?.trim() || null,
      })
      .then((result) =>
        handleStartResult(result, {
          name: values.name,
          email: values.email || undefined,
          contact: values.phone_number,
        }),
      )
      .catch(() => {
        // Surfaced via startMutation.error below.
      });
  };

  // Logged-in booking — for a chosen saved profile.
  const submitAccount = () => {
    if (!slot || !activeProfile) return;
    setPaymentError(null);
    startMutation
      .mutateAsync({
        doctor_slug: slug,
        slot_id: slot.id,
        account_member_id: activeProfile.id,
        reason: accountReason.trim() || null,
      })
      .then((result) =>
        handleStartResult(result, {
          name: activeProfile.full_name,
          email: activeProfile.email || undefined,
          contact: activeProfile.phone_number,
        }),
      )
      .catch(() => {
        // Surfaced via startMutation.error below.
      });
  };

  // Logged-in booking — for a one-off person typed in manually.
  const submitManual = (d: ManualDetails) => {
    if (!slot) return;
    setPaymentError(null);
    startMutation
      .mutateAsync({
        doctor_slug: slug,
        slot_id: slot.id,
        name: d.name,
        phone_number: d.phone,
        email: d.email || null,
        age: d.age ? Number(d.age) : null,
        gender: d.gender || null,
        save_as_member: d.save_as_member,
        relationship: d.save_as_member ? d.relationship : null,
        reason: accountReason.trim() || null,
      })
      .then((result) => {
        if (d.save_as_member) {
          void queryClient.invalidateQueries({ queryKey: MY_MEMBERS_KEY });
        }
        handleStartResult(result, {
          name: d.name,
          email: d.email || undefined,
          contact: d.phone,
        });
      })
      .catch(() => {
        // Surfaced via startMutation.error below.
      });
  };

  const submitting = startMutation.isPending || processing;

  const serverError =
    paymentError ??
    (startMutation.error instanceof ApiError
      ? startMutation.error.message
      : startMutation.isError
        ? "Unable to complete the booking. Please try again."
        : null);

  if (isPending) {
    return <p className="text-muted-foreground text-sm">Loading...</p>;
  }
  if (isError || !profile) {
    return <p className="text-destructive text-sm">Doctor not found.</p>;
  }

  if (confirmation) {
    return (
      <BookingConfirmationCard
        confirmation={confirmation}
        onBookAnother={resetAll}
      />
    );
  }

  if (clinics.length === 0) {
    return (
      <p className="text-muted-foreground bg-card rounded-xl border p-10 text-center text-sm shadow-sm">
        This doctor has no clinics available for booking yet.
      </p>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
      <div className="flex min-w-0 flex-col gap-6">
        <Stepper step={step} />

        <div className="bg-card rounded-2xl border p-6 shadow-sm">
          {step === 0 && (
            <ClinicStep
              clinics={clinics}
              clinicId={clinicId}
              onSelect={selectClinic}
              onContinue={() => setStep(1)}
            />
          )}

          {step === 1 && (
            <DateTimeStep
              slug={slug}
              clinicId={clinicId}
              date={date}
              slots={slots}
              slotsFetching={slotsFetching}
              selectedSlot={slot}
              onSelectDate={selectDate}
              onSelectSlot={setSlot}
              onBack={() => setStep(0)}
              onContinue={() => setStep(2)}
            />
          )}

          {step === 2 && loggedIn && (
            <WhoStep
              slug={slug}
              profiles={profiles}
              activeProfileId={activeProfileId}
              onSelect={setSelectedProfileId}
              onAddMember={() => setMemberDialogOpen(true)}
              reason={accountReason}
              onReasonChange={setAccountReason}
              needsPayment={needsPayment}
              fee={selectedClinic?.consultation_fee ?? null}
              serverError={serverError}
              submitting={submitting}
              startPending={startMutation.isPending}
              processing={processing}
              onBack={() => setStep(1)}
              onConfirm={submitAccount}
              onManualConfirm={submitManual}
            />
          )}

          {step === 2 && !loggedIn && (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-5"
              noValidate
            >
              <StepHeading
                title="Your details"
                subtitle="We'll use these to confirm your appointment."
              />
              <LoginPrompt slug={slug} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" className={CONTROL} {...register("name")} />
                  {errors.name && (
                    <p className="text-destructive text-sm">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="phone_number">Mobile number</Label>
                  <Input
                    id="phone_number"
                    className={CONTROL}
                    {...register("phone_number")}
                  />
                  {errors.phone_number && (
                    <p className="text-destructive text-sm">
                      {errors.phone_number.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">Email (optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    className={CONTROL}
                    {...register("email")}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="age">Age (optional)</Label>
                  <Input
                    id="age"
                    type="number"
                    min={0}
                    className={CONTROL}
                    {...register("age")}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="gender">Gender (optional)</Label>
                  <NativeSelect
                    id="gender"
                    className={CONTROL}
                    {...register("gender")}
                  >
                    <option value="">Prefer not to say</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </NativeSelect>
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label htmlFor="reason">Reason for visit (optional)</Label>
                  <textarea
                    id="reason"
                    rows={3}
                    className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3"
                    {...register("reason")}
                  />
                </div>
              </div>

              {needsPayment && (
                <p className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-800">
                  <ShieldCheck className="size-4 shrink-0" />
                  A secure payment of ₹{selectedClinic?.consultation_fee} is
                  required to confirm this appointment.
                </p>
              )}

              {serverError && (
                <p className="text-destructive text-sm" role="alert">
                  {serverError}
                </p>
              )}

              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  disabled={submitting}
                >
                  <ChevronLeft className="size-4" />
                  Back
                </Button>
                <Button type="submit" disabled={submitting}>
                  {processing
                    ? "Processing payment..."
                    : startMutation.isPending
                      ? "Please wait..."
                      : needsPayment
                        ? `Pay ₹${selectedClinic?.consultation_fee} & confirm`
                        : "Confirm booking"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      <BookingSummary
        doctorName={profile.doctor.full_name}
        specialization={profile.doctor.specialization}
        photo={profile.doctor.profile_photo}
        clinicName={selectedClinic?.clinic_name ?? null}
        date={date ? formatDate(date) : null}
        time={slot ? slot.start_time.slice(0, 5) : null}
        fee={selectedClinic?.consultation_fee ?? null}
      />

      <MemberFormDialog
        open={memberDialogOpen}
        onOpenChange={setMemberDialogOpen}
        onSaved={(saved) => setSelectedProfileId(saved.id)}
      />
    </div>
  );
}

function LoginPrompt({ slug }: { slug: string }) {
  return (
    <div className="bg-muted/40 flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm">
      <span className="text-muted-foreground">
        Have an account? Sign in to use your saved details.
      </span>
      <Link
        href={`/dr/${slug}/login?redirect=book`}
        className="text-primary font-medium hover:underline"
      >
        Sign in
      </Link>
    </div>
  );
}

function WhoStep({
  slug,
  profiles,
  activeProfileId,
  onSelect,
  onAddMember,
  reason,
  onReasonChange,
  needsPayment,
  fee,
  serverError,
  submitting,
  startPending,
  processing,
  onBack,
  onConfirm,
  onManualConfirm,
}: {
  slug: string;
  profiles: PatientProfile[];
  activeProfileId: string;
  onSelect: (id: string) => void;
  onAddMember: () => void;
  reason: string;
  onReasonChange: (value: string) => void;
  needsPayment: boolean;
  fee: string | null;
  serverError: string | null;
  submitting: boolean;
  startPending: boolean;
  processing: boolean;
  onBack: () => void;
  onConfirm: () => void;
  onManualConfirm: (details: ManualDetails) => void;
}) {
  const [manual, setManual] = useState({
    name: "",
    phone: "",
    email: "",
    age: "",
    gender: "",
  });
  const [saveMember, setSaveMember] = useState(false);
  const [relationship, setRelationship] = useState("OTHER");
  const [manualError, setManualError] = useState<string | null>(null);
  const isManual = activeProfileId === MANUAL_ID;

  const handleConfirm = () => {
    if (!isManual) {
      onConfirm();
      return;
    }
    if (!manual.name.trim() || !manual.phone.trim()) {
      setManualError("Name and phone number are required.");
      return;
    }
    setManualError(null);
    onManualConfirm({
      name: manual.name.trim(),
      phone: manual.phone.trim(),
      email: manual.email.trim(),
      age: manual.age,
      gender: manual.gender,
      save_as_member: saveMember,
      relationship,
    });
  };

  if (profiles.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <StepHeading
          title="Who is this appointment for?"
          subtitle="Complete your profile to continue."
        />
        <p className="text-muted-foreground text-sm">
          Add your details once and they&apos;ll be ready every time you book.
        </p>
        <Button render={<Link href={`/dr/${slug}/account`} />}>
          Go to my account
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <StepHeading
        title="Who is this appointment for?"
        subtitle="Choose a saved profile — we'll use their details."
      />

      <div className="grid gap-2">
        {profiles.map((p) => {
          const active = p.id === activeProfileId;
          const isSelf = p.relationship === "SELF";
          const meta = [
            isSelf ? "You" : relationshipLabel(p.relationship),
            personMeta(p.age, p.gender),
          ]
            .filter(Boolean)
            .join(" · ");
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p.id)}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                active
                  ? "border-primary ring-primary bg-primary/5 ring-1"
                  : "hover:bg-muted/50",
              )}
            >
              <span className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-full">
                <UserRound className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.full_name}</p>
                {meta && (
                  <p className="text-muted-foreground truncate text-xs">
                    {meta}
                  </p>
                )}
              </div>
              {active && (
                <CircleCheck className="text-primary size-5 shrink-0" />
              )}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onSelect(MANUAL_ID)}
          className={cn(
            "flex items-center gap-3 rounded-xl border p-3 text-left transition-colors",
            isManual
              ? "border-primary ring-primary bg-primary/5 ring-1"
              : "hover:bg-muted/50",
          )}
        >
          <span className="bg-muted text-muted-foreground flex size-9 items-center justify-center rounded-full">
            <UserPlus className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Someone else</p>
            <p className="text-muted-foreground text-xs">
              Enter their details manually
            </p>
          </div>
          {isManual && <CircleCheck className="text-primary size-5 shrink-0" />}
        </button>

        <button
          type="button"
          onClick={onAddMember}
          className="text-muted-foreground hover:border-primary hover:text-foreground flex items-center justify-center gap-2 rounded-xl border border-dashed p-3 text-sm transition-colors"
        >
          <Plus className="size-4" />
          Add a family member
        </button>
      </div>

      {isManual && (
        <div className="flex flex-col gap-4 rounded-xl border p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="manual_name">Full name</Label>
              <Input
                id="manual_name"
                className={CONTROL}
                value={manual.name}
                onChange={(e) =>
                  setManual((m) => ({ ...m, name: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="manual_phone">Mobile number</Label>
              <Input
                id="manual_phone"
                type="tel"
                className={CONTROL}
                value={manual.phone}
                onChange={(e) =>
                  setManual((m) => ({ ...m, phone: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="manual_email">Email (optional)</Label>
              <Input
                id="manual_email"
                type="email"
                className={CONTROL}
                value={manual.email}
                onChange={(e) =>
                  setManual((m) => ({ ...m, email: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="manual_age">Age (optional)</Label>
              <Input
                id="manual_age"
                type="number"
                min={0}
                className={CONTROL}
                value={manual.age}
                onChange={(e) =>
                  setManual((m) => ({ ...m, age: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="manual_gender">Gender (optional)</Label>
              <NativeSelect
                id="manual_gender"
                className={CONTROL}
                value={manual.gender}
                onChange={(e) =>
                  setManual((m) => ({ ...m, gender: e.target.value }))
                }
              >
                <option value="">Prefer not to say</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </NativeSelect>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4"
              checked={saveMember}
              onChange={(e) => setSaveMember(e.target.checked)}
            />
            Save to my family members for next time
          </label>

          {saveMember && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="manual_rel">Relationship</Label>
              <NativeSelect
                id="manual_rel"
                className={CONTROL}
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
              >
                {MEMBER_RELATIONSHIPS.map((rel) => (
                  <option key={rel} value={rel}>
                    {relationshipLabel(rel)}
                  </option>
                ))}
              </NativeSelect>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="account_reason">Reason for visit (optional)</Label>
        <textarea
          id="account_reason"
          rows={3}
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3"
        />
      </div>

      {needsPayment && (
        <p className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-800">
          <ShieldCheck className="size-4 shrink-0" />
          A secure payment of ₹{fee} is required to confirm this appointment.
        </p>
      )}

      {(manualError || serverError) && (
        <p className="text-destructive text-sm" role="alert">
          {manualError ?? serverError}
        </p>
      )}

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={submitting}
        >
          <ChevronLeft className="size-4" />
          Back
        </Button>
        <Button
          type="button"
          onClick={handleConfirm}
          disabled={submitting || !activeProfileId}
        >
          {processing
            ? "Processing payment..."
            : startPending
              ? "Please wait..."
              : needsPayment
                ? `Pay ₹${fee} & confirm`
                : "Confirm booking"}
        </Button>
      </div>
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <ol className="flex items-center">
      {STEPS.map((label, index) => {
        const done = index < step;
        const current = index === step;
        return (
          <li
            key={label}
            className={cn(
              "flex items-center",
              index < STEPS.length - 1 && "flex-1",
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full border text-xs font-semibold",
                  done || current
                    ? "bg-primary text-primary-foreground border-transparent"
                    : "text-muted-foreground",
                )}
              >
                {done ? <Check className="size-4" /> : index + 1}
              </span>
              <span
                className={cn(
                  "hidden text-sm sm:inline",
                  current
                    ? "text-foreground font-medium"
                    : done
                      ? "text-foreground"
                      : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <span
                className={cn(
                  "mx-3 h-0.5 flex-1 rounded",
                  index < step ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function StepHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-muted-foreground text-sm">{subtitle}</p>
    </div>
  );
}

function ClinicStep({
  clinics,
  clinicId,
  onSelect,
  onContinue,
}: {
  clinics: PublicClinic[];
  clinicId: string;
  onSelect: (id: string) => void;
  onContinue: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <StepHeading
        title="Choose a clinic"
        subtitle="Where would you like to be seen?"
      />
      <div className="grid gap-3">
        {clinics.map((clinic) => {
          const active = clinic.id === clinicId;
          return (
            <button
              key={clinic.id}
              type="button"
              onClick={() => onSelect(clinic.id)}
              className={cn(
                "flex items-start justify-between gap-4 rounded-xl border p-4 text-left transition-colors",
                active
                  ? "border-primary ring-primary bg-primary/5 ring-1"
                  : "hover:bg-muted/50",
              )}
            >
              <div className="flex items-start gap-3">
                <MapPin className="text-primary mt-0.5 size-5 shrink-0" />
                <div>
                  <p className="font-medium">{clinic.clinic_name}</p>
                  <p className="text-muted-foreground text-sm">
                    {clinicAddress(clinic)}
                  </p>
                  {clinic.consultation_fee && (
                    <p className="text-muted-foreground mt-0.5 text-sm">
                      Consultation fee: ₹{clinic.consultation_fee}
                    </p>
                  )}
                </div>
              </div>
              {active && (
                <CircleCheck className="text-primary size-5 shrink-0" />
              )}
            </button>
          );
        })}
      </div>
      <div className="flex justify-end">
        <Button onClick={onContinue} disabled={!clinicId}>
          Continue
        </Button>
      </div>
    </div>
  );
}

function DateTimeStep({
  slug,
  clinicId,
  date,
  slots,
  slotsFetching,
  selectedSlot,
  onSelectDate,
  onSelectSlot,
  onBack,
  onContinue,
}: {
  slug: string;
  clinicId: string;
  date: string;
  slots: PublicSlot[] | undefined;
  slotsFetching: boolean;
  selectedSlot: PublicSlot | null;
  onSelectDate: (iso: string) => void;
  onSelectSlot: (slot: PublicSlot) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const today = useMemo(() => new Date(), []);
  const todayIso = isoOf(today.getFullYear(), today.getMonth(), today.getDate());
  const [view, setView] = useState(() => {
    if (date) {
      const [y, m] = date.split("-").map(Number);
      return { year: y, month: m - 1 };
    }
    return { year: today.getFullYear(), month: today.getMonth() };
  });

  const monthFrom = isoOf(view.year, view.month, 1);
  const lastDay = new Date(view.year, view.month + 1, 0).getDate();
  const monthTo = isoOf(view.year, view.month, lastDay);

  const { data: availableRaw, isFetching: datesFetching } = useAvailabilityDates(
    slug,
    clinicId || null,
    monthFrom,
    monthTo,
  );
  const availableDates = useMemo(
    () => new Set(availableRaw ?? []),
    [availableRaw],
  );

  const currentIndex = today.getFullYear() * 12 + today.getMonth();
  const viewIndex = view.year * 12 + view.month;
  const shiftMonth = (delta: number) =>
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  return (
    <div className="flex flex-col gap-5">
      <StepHeading
        title="Pick a date & time"
        subtitle="Dates with open slots are selectable; others are greyed out."
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Date</p>
          <BookingCalendar
            year={view.year}
            month={view.month}
            todayIso={todayIso}
            selected={date}
            availableDates={availableDates}
            onSelect={onSelectDate}
            onPrev={() => shiftMonth(-1)}
            onNext={() => shiftMonth(1)}
            canPrev={viewIndex > currentIndex}
            canNext={viewIndex < currentIndex + 3}
            loading={datesFetching}
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">
            {date ? "Available times" : "Times"}
          </p>
          {!date ? (
            <div className="bg-muted/30 text-muted-foreground flex min-h-40 flex-1 items-center justify-center rounded-xl border p-6 text-center text-sm">
              Select a date to see available times.
            </div>
          ) : slotsFetching ? (
            <p className="text-muted-foreground text-sm">Loading times...</p>
          ) : !slots || slots.length === 0 ? (
            <div className="bg-muted/30 text-muted-foreground rounded-xl border p-6 text-center text-sm">
              No available times on this day. Try another date.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                {slots.map((s) => {
                  const active = selectedSlot?.id === s.id;
                  const bookable = s.available_count > 0;
                  const plenty = s.available_count > s.capacity / 2;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      disabled={!bookable}
                      onClick={() => onSelectSlot(s)}
                      className={cn(
                        "flex flex-col items-center rounded-lg border py-1.5 text-sm transition-colors",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : !bookable
                            ? "bg-muted text-muted-foreground/50 cursor-not-allowed"
                            : plenty
                              ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                              : "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100",
                      )}
                    >
                      <span className="font-medium">
                        {s.start_time.slice(0, 5)}
                      </span>
                      <span
                        className={cn(
                          "text-[11px]",
                          active
                            ? "text-primary-foreground/80"
                            : !bookable
                              ? "text-muted-foreground/60"
                              : plenty
                                ? "text-emerald-700"
                                : "text-amber-700",
                        )}
                      >
                        {bookable ? `${s.available_count} left` : "Full"}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  Available
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-amber-500" />
                  Filling fast
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="bg-muted-foreground/40 size-2 rounded-full" />
                  Full
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="size-4" />
          Back
        </Button>
        <Button onClick={onContinue} disabled={!selectedSlot}>
          Continue
        </Button>
      </div>
    </div>
  );
}

function BookingSummary({
  doctorName,
  specialization,
  photo,
  clinicName,
  date,
  time,
  fee,
}: {
  doctorName: string;
  specialization: string;
  photo: string | null;
  clinicName: string | null;
  date: string | null;
  time: string | null;
  fee: string | null;
}) {
  return (
    <aside className="bg-card h-fit rounded-2xl border p-5 shadow-sm lg:sticky lg:top-6">
      <div className="flex items-center gap-3">
        {photo ? (
          <Image
            src={mediaUrl(photo)}
            alt={doctorName}
            width={48}
            height={48}
            className="size-12 rounded-full border object-cover"
          />
        ) : (
          <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
            <Stethoscope className="size-6" />
          </div>
        )}
        <div>
          <p className="font-medium">{doctorName}</p>
          <p className="text-muted-foreground text-sm">{specialization}</p>
        </div>
      </div>

      <div className="bg-border my-4 h-px" />

      <dl className="flex flex-col gap-3">
        <SummaryRow icon={Building2} label="Clinic" value={clinicName} />
        <SummaryRow icon={CalendarDays} label="Date" value={date} />
        <SummaryRow icon={Clock} label="Time" value={time} />
        {fee && <SummaryRow icon={Banknote} label="Fee" value={`₹${fee}`} />}
      </dl>
    </aside>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <Icon className="text-muted-foreground size-4 shrink-0" />
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "ml-auto text-right font-medium",
          !value && "text-muted-foreground font-normal",
        )}
      >
        {value ?? "Not selected"}
      </span>
    </div>
  );
}
