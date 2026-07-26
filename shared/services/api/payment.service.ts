import { apiFetch } from "@/shared/services/api/client";
import type { Page } from "@/shared/types/appointment";
import type { PaymentListItem, PaymentStatus } from "@/shared/types/payment";

export interface PaymentFilters {
  status?: PaymentStatus;
  clinic_id?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export function listPayments(
  filters: PaymentFilters = {},
): Promise<Page<PaymentListItem>> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  const query = params.toString();
  return apiFetch<Page<PaymentListItem>>(`/payments${query ? `?${query}` : ""}`);
}
