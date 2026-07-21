"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  listSlots,
  updateSlot,
  type SlotFilters,
  type SlotUpdatePayload,
} from "@/shared/services/api/slot.service";

export const SLOTS_QUERY_KEY = ["slots"] as const;

export function useSlots(filters: SlotFilters) {
  return useQuery({
    queryKey: [...SLOTS_QUERY_KEY, filters],
    queryFn: () => listSlots(filters),
    enabled: Boolean(filters.clinic_id),
  });
}

export function useUpdateSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { slotId: string; payload: SlotUpdatePayload }) =>
      updateSlot(input.slotId, input.payload),
    meta: { successMessage: "Slot updated" },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: SLOTS_QUERY_KEY }),
  });
}
