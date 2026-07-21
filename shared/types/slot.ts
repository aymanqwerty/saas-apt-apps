export type SlotStatus =
  | "AVAILABLE"
  | "FULL"
  | "BLOCKED"
  | "COMPLETED"
  | "EXPIRED";

export interface Slot {
  id: string;
  clinic_id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  booked_count: number;
  status: SlotStatus;
  is_manually_blocked: boolean;
  block_reason: string | null;
}
