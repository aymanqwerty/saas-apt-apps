import { apiFetch } from "@/shared/services/api/client";
import type { DashboardSummary } from "@/shared/types/dashboard";

export function getDashboard(): Promise<DashboardSummary> {
  return apiFetch<DashboardSummary>("/dashboard");
}
