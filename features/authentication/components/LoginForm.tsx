"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  loginSchema,
  type LoginFormValues,
} from "@/features/authentication/validation/login_schema";
import { useDemoLogin } from "@/features/authentication/hooks/useDemoLogin";
import { useLogin } from "@/features/authentication/hooks/useLogin";
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

export function LoginForm() {
  const loginMutation = useLogin();
  const startDemo = useDemoLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  const serverError =
    loginMutation.error instanceof ApiError
      ? loginMutation.error.message
      : loginMutation.isError
        ? "Unable to reach the server. Please try again."
        : null;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Doctor Login</CardTitle>
        <CardDescription>
          Sign in to manage your practice and appointments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-destructive text-sm">{errors.email.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-destructive text-sm">
                {errors.password.message}
              </p>
            )}
          </div>

          {serverError && (
            <p className="text-destructive text-sm" role="alert">
              {serverError}
            </p>
          )}

          <Button type="submit" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <span className="bg-border h-px flex-1" />
          <span className="text-muted-foreground text-xs uppercase">or</span>
          <span className="bg-border h-px flex-1" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={startDemo}
        >
          Explore the demo
        </Button>
        <p className="text-muted-foreground mt-2 text-center text-xs">
          Browse every screen with no account. Demo sessions show no data and
          cannot save changes.
        </p>
      </CardContent>
    </Card>
  );
}
