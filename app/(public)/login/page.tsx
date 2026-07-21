import type { Metadata } from "next";

import { LoginForm } from "@/features/authentication/components/LoginForm";

export const metadata: Metadata = {
  title: "Login | Doctor Management Platform",
};

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-24">
      <LoginForm />
    </div>
  );
}
