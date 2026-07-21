export type ClinicStatus = "ACTIVE" | "INACTIVE";

export interface Clinic {
  id: string;
  clinic_name: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string;
  country: string;
  postal_code: string | null;
  google_maps_url: string | null;
  phone_number: string | null;
  consultation_fee: string | null;
  timezone: string;
  description: string | null;
  status: ClinicStatus;
}
