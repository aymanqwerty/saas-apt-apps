export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface PaymentListItem {
  id: string;
  amount: string;
  currency: string;
  status: PaymentStatus;
  provider: string;
  patient_name: string;
  clinic_name: string;
  appointment_id: string | null;
  provider_payment_id: string | null;
  created_at: string;
}
