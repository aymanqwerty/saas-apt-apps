import { apiFetch } from "@/shared/services/api/client";
import type { Page } from "@/shared/types/appointment";
import type { Slot, SlotStatus } from "@/shared/types/slot";

export interface SlotFilters {
  clinic_id?: string;
  slot_date?: string;
  date_from?: string;
  date_to?: string;
  status?: SlotStatus;
  page?: number;
  limit?: number;
}

export interface SlotUpdatePayload {
  is_blocked?: boolean;
  block_reason?: string | null;
  capacity?: number;
}

export function listSlots(filters: SlotFilters = {}): Promise<Page<Slot>> {
  const params = new URLSearchParams();
  if (filters.clinic_id) params.set("clinic_id", filters.clinic_id);
  if (filters.slot_date) params.set("slot_date", filters.slot_date);
  if (filters.date_from) params.set("date_from", filters.date_from);
  if (filters.date_to) params.set("date_to", filters.date_to);
  if (filters.status) params.set("status", filters.status);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  const query = params.toString();
  return apiFetch<Page<Slot>>(`/slots${query ? `?${query}` : ""}`);
}

export function updateSlot(
  slotId: string,
  payload: SlotUpdatePayload,
): Promise<Slot> {
  return apiFetch<Slot>(`/slots/${slotId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
