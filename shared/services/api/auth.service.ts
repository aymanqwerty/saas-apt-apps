import { apiFetch } from "@/shared/services/api/client";
import type { Doctor } from "@/shared/types/doctor";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginData {
  token: string;
  doctor: Doctor;
}

export function login(payload: LoginPayload): Promise<LoginData> {
  return apiFetch<LoginData>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getMe(): Promise<Doctor> {
  return apiFetch<Doctor>("/auth/me");
}

export function logout(): Promise<null> {
  return apiFetch<null>("/auth/logout", { method: "POST" });
}
