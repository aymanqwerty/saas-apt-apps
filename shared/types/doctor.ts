export type DoctorStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export interface Doctor {
  id: string;
  full_name: string;
  slug: string;
  email: string;
  phone_number: string;
  profile_photo: string | null;
  qualification: string | null;
  specialization: string;
  experience_years: number;
  registration_number: string | null;
  about: string | null;
  languages: string[] | null;
  status: DoctorStatus;
}
