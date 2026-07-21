"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, MessageSquareText, Phone } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { useUpsertProfile } from "@/features/patient-account/hooks/usePatientAccount";
import {
  usePasswordLogin,
  useRequestOtp,
  useVerifyOtp,
} from "@/features/patient-account/hooks/usePatientAuth";
import {
  otpStepSchema,
  passwordLoginSchema,
  phoneStepSchema,
  profileSchema,
  type OtpStepValues,
  type PasswordLoginValues,
  type PhoneStepValues,
  type ProfileFormValues,
} from "@/features/patient-account/validation/schemas";
import { NativeSelect } from "@/shared/components/NativeSelect";
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
import { ApiError } from "@/shared/services/api/client";
import type { Gender, PatientAuthData } from "@/shared/types/patient-account";

type Step = "phone" | "code" | "profile" | "password";

function errorText(error: unknown, fallback: string): string | null {
  if (error instanceof ApiError) return error.message;
  return error ? fallback : null;
}

export function PatientAuthFlow({ slug }: { slug: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo =
    params.get("redirect") === "book"
      ? `/dr/${slug}/book`
      : `/dr/${slug}/account`;

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [debugCode, setDebugCode] = useState<string | null>(null);

  const requestOtp = useRequestOtp();
  const verifyOtp = useVerifyOtp();
  const passwordLogin = usePasswordLogin();
  const upsertProfile = useUpsertProfile();

  const finish = () => {
    router.push(redirectTo);
    router.refresh();
  };

  const afterAuth = (data: PatientAuthData) => {
    if (data.account.profile_complete) {
      finish();
    } else {
      setStep("profile");
    }
  };

  const sendOtp = (targetPhone: string) => {
    requestOtp.mutate(
      { slug, phone: targetPhone },
      {
        onSuccess: (res) => {
          setPhone(targetPhone);
          setDebugCode(res.debug_code);
          setStep("code");
        },
      },
    );
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>
          {step === "profile" ? "Complete your profile" : "Sign in to book"}
        </CardTitle>
        <CardDescription>
          {step === "phone" &&
            "Enter your mobile number and we'll send you a verification code."}
          {step === "code" && `Enter the code sent to ${phone}.`}
          {step === "profile" &&
            "Tell us a bit about yourself so we can pre-fill your bookings."}
          {step === "password" && "Sign in with your mobile number and password."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {step === "phone" && (
          <PhoneStep
            pending={requestOtp.isPending}
            error={errorText(requestOtp.error, "Could not send the code.")}
            onSubmit={(v) => sendOtp(v.phone_number)}
            onUsePassword={() => setStep("password")}
          />
        )}

        {step === "code" && (
          <CodeStep
            debugCode={debugCode}
            pending={verifyOtp.isPending}
            resending={requestOtp.isPending}
            error={errorText(verifyOtp.error, "Could not verify the code.")}
            onSubmit={(v) =>
              verifyOtp.mutate(
                { slug, phone, code: v.code },
                { onSuccess: afterAuth },
              )
            }
            onResend={() => sendOtp(phone)}
            onChangeNumber={() => {
              verifyOtp.reset();
              setStep("phone");
            }}
          />
        )}

        {step === "profile" && (
          <ProfileStep
            pending={upsertProfile.isPending}
            error={errorText(upsertProfile.error, "Could not save your profile.")}
            onSubmit={(payload) =>
              upsertProfile.mutate(payload, { onSuccess: finish })
            }
          />
        )}

        {step === "password" && (
          <PasswordStep
            pending={passwordLogin.isPending}
            error={errorText(passwordLogin.error, "Could not sign you in.")}
            onSubmit={(v) =>
              passwordLogin.mutate(
                { slug, phone: v.phone_number, password: v.password },
                { onSuccess: afterAuth },
              )
            }
            onUseOtp={() => setStep("phone")}
          />
        )}
      </CardContent>
    </Card>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-destructive text-sm">{message}</p>;
}

function ServerError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="text-destructive text-sm" role="alert">
      {message}
    </p>
  );
}

function PhoneStep({
  pending,
  error,
  onSubmit,
  onUsePassword,
}: {
  pending: boolean;
  error: string | null;
  onSubmit: (v: PhoneStepValues) => void;
  onUsePassword: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PhoneStepValues>({
    resolver: zodResolver(phoneStepSchema),
    defaultValues: { phone_number: "" },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone_number">Mobile number</Label>
        <Input
          id="phone_number"
          type="tel"
          autoComplete="tel"
          placeholder="+91..."
          {...register("phone_number")}
        />
        <FieldError message={errors.phone_number?.message} />
      </div>
      <ServerError message={error} />
      <Button type="submit" disabled={pending}>
        <MessageSquareText className="size-4" />
        {pending ? "Sending..." : "Send code"}
      </Button>
      <button
        type="button"
        onClick={onUsePassword}
        className="text-muted-foreground hover:text-foreground text-sm"
      >
        Sign in with a password instead
      </button>
    </form>
  );
}

function CodeStep({
  debugCode,
  pending,
  resending,
  error,
  onSubmit,
  onResend,
  onChangeNumber,
}: {
  debugCode: string | null;
  pending: boolean;
  resending: boolean;
  error: string | null;
  onSubmit: (v: OtpStepValues) => void;
  onResend: () => void;
  onChangeNumber: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpStepValues>({
    resolver: zodResolver(otpStepSchema),
    defaultValues: { code: "" },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
      noValidate
    >
      {debugCode && (
        <p className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-800">
          Development mode — your code is{" "}
          <span className="font-mono font-semibold">{debugCode}</span>
        </p>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="code">Verification code</Label>
        <Input
          id="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="6-digit code"
          {...register("code")}
        />
        <FieldError message={errors.code?.message} />
      </div>
      <ServerError message={error} />
      <Button type="submit" disabled={pending}>
        {pending ? "Verifying..." : "Verify & continue"}
      </Button>
      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={onChangeNumber}
          className="text-muted-foreground hover:text-foreground"
        >
          Change number
        </button>
        <button
          type="button"
          onClick={onResend}
          disabled={resending}
          className="text-primary disabled:opacity-50 hover:underline"
        >
          {resending ? "Sending..." : "Resend code"}
        </button>
      </div>
    </form>
  );
}

function ProfileStep({
  pending,
  error,
  onSubmit,
}: {
  pending: boolean;
  error: string | null;
  onSubmit: (payload: {
    full_name: string;
    gender: Gender | null;
    date_of_birth: string | null;
    email: string | null;
  }) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: "", gender: "", date_of_birth: "", email: "" },
  });

  return (
    <form
      onSubmit={handleSubmit((v) =>
        onSubmit({
          full_name: v.full_name,
          gender: (v.gender || null) as Gender | null,
          date_of_birth: v.date_of_birth || null,
          email: v.email || null,
        }),
      )}
      className="flex flex-col gap-4"
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="full_name">Full name</Label>
        <Input id="full_name" {...register("full_name")} />
        <FieldError message={errors.full_name?.message} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="gender">Gender</Label>
          <NativeSelect id="gender" {...register("gender")}>
            <option value="">Prefer not to say</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date_of_birth">Date of birth</Label>
          <Input id="date_of_birth" type="date" {...register("date_of_birth")} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email (optional)</Label>
        <Input id="email" type="email" {...register("email")} />
        <FieldError message={errors.email?.message} />
      </div>
      <ServerError message={error} />
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save & continue"}
      </Button>
    </form>
  );
}

function PasswordStep({
  pending,
  error,
  onSubmit,
  onUseOtp,
}: {
  pending: boolean;
  error: string | null;
  onSubmit: (v: PasswordLoginValues) => void;
  onUseOtp: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordLoginValues>({
    resolver: zodResolver(passwordLoginSchema),
    defaultValues: { phone_number: "", password: "" },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pw_phone">Mobile number</Label>
        <Input
          id="pw_phone"
          type="tel"
          autoComplete="tel"
          {...register("phone_number")}
        />
        <FieldError message={errors.phone_number?.message} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pw_password">Password</Label>
        <Input
          id="pw_password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
        />
        <FieldError message={errors.password?.message} />
      </div>
      <ServerError message={error} />
      <Button type="submit" disabled={pending}>
        <KeyRound className="size-4" />
        {pending ? "Signing in..." : "Sign in"}
      </Button>
      <button
        type="button"
        onClick={onUseOtp}
        className="text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 text-sm"
      >
        <Phone className="size-3.5" />
        Sign in with a code instead
      </button>
    </form>
  );
}
