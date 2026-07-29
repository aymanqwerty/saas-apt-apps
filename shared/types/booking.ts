export interface PublicClinic {
  id: string;
  clinic_name: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string;
  country: string;
  google_maps_url: string | null;
  phone_number: string | null;
  consultation_fee: string | null;
}

export interface PublicDoctor {
  full_name: string;
  slug: string;
  specialization: string;
  qualification: string | null;
  about: string | null;
  profile_photo: string | null;
  experience_years: number;
  languages: string[] | null;
}

export interface PublicDoctorProfile {
  doctor: PublicDoctor;
  clinics: PublicClinic[];
}

export interface PublicService {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
}

/** Same shape the blog listing returns — the /site aggregate embeds a few. */
export interface PublicGalleryPreview {
  id: string;
  title: string;
  slug: string;
  introduction: string;
  cover_image: string | null;
  category_name: string | null;
  category_slug: string | null;
  display_date: string | null;
  published_at: string | null;
}

export interface PublicSite {
  doctor: PublicDoctor;
  clinics: PublicClinic[];
  services: PublicService[];
  gallery: PublicGalleryPreview[];
}

export interface PublicSlot {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  remaining: number;
  available_count: number;
}

export interface BookingConfirmation {
  id: string;
  appointment_number: string;
  token_number: number;
  appointment_status: string;
  doctor_name: string;
  clinic_name: string;
  clinic_address: string;
  consultation_fee: string | null;
  appointment_date: string;
  start_time: string;
  end_time: string;
}

export interface PaymentOrderInfo {
  provider: string;
  order_id: string;
  amount: number; // smallest currency unit (paise)
  currency: string;
  key_id: string;
  display_amount: string;
  doctor_name: string;
  clinic_name: string;
}

export interface BookingStartResponse {
  status: "confirmed" | "payment_required";
  hold_id: string | null;
  appointment: BookingConfirmation | null;
  payment: PaymentOrderInfo | null;
}

export interface PublicSettings {
  booking_enabled: boolean;
  gallery_enabled: boolean;
  show_consultation_fee: boolean;
  show_contact_information: boolean;
  payment_required: boolean;
}
