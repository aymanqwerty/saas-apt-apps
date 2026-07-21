"use client";

import { useQuery } from "@tanstack/react-query";

import { getDashboard } from "@/shared/services/api/dashboard.service";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
  });
}
