import type { AppointmentListItem } from "@/shared/types/appointment";

export interface ActivityEntry {
  action: string;
  entity: string;
  description: string | null;
  created_at: string;
}

export interface DashboardSummary {
  today_count: number;
  upcoming_count: number;
  total_patients: number;
  total_clinics: number;
  published_posts: number;
  today_appointments: AppointmentListItem[];
  recent_activity: ActivityEntry[];
}
