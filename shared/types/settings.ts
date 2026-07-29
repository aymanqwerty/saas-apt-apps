export interface DoctorSettings {
  booking_enabled: boolean;
  gallery_enabled: boolean;
  show_consultation_fee: boolean;
  show_contact_information: boolean;
  payment_required: boolean;
  /**
   * Public heading/nav wording for the blog section ("Success Stories",
   * "Achievements", …). Display-only — the URL segment is fixed so renaming
   * never breaks links. Nullable on the admin response, always present on the
   * public one (the API resolves the default there).
   */
  section_label?: string | null;
}
