"use client";

import { useQuery } from "@tanstack/react-query";

import {
  listPayments,
  type PaymentFilters,
} from "@/shared/services/api/payment.service";

export function usePayments(filters: PaymentFilters) {
  return useQuery({
    queryKey: ["payments", filters],
    queryFn: () => listPayments(filters),
  });
}
