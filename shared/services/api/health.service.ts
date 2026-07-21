import { apiFetch } from "@/shared/services/api/client";

export interface HealthStatus {
  status: string;
  database: string;
}

export function getHealth(): Promise<HealthStatus> {
  return apiFetch<HealthStatus>("/health");
}
