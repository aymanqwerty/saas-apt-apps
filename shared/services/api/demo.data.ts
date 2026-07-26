import type { Page } from "@/shared/types/appointment";
import type { DashboardSummary } from "@/shared/types/dashboard";
import type { Doctor } from "@/shared/types/doctor";
import type { DoctorSettings } from "@/shared/types/settings";

/**
 * Empty payloads served to a demo session.
 *
 * Every dashboard read resolves here instead of hitting the API, so the demo
 * shows the full structure of the product (navigation, pages, tables, forms,
 * empty states) without a single record of real data.
 */

export const DEMO_READ_ONLY_MESSAGE =
  "This is a demo session — changes cannot be saved. Sign in with your account to make edits.";

export const DEMO_DOCTOR: Doctor = {
  id: "00000000-0000-0000-0000-000000000000",
  full_name: "Demo Doctor",
  slug: "demo",
  email: "",
  phone_number: "",
  profile_photo: null,
  qualification: null,
  specialization: "",
  experience_years: 0,
  registration_number: null,
  about: null,
  languages: null,
  status: "ACTIVE",
};

const DEMO_SETTINGS: DoctorSettings = {
  booking_enabled: false,
  gallery_enabled: false,
  show_consultation_fee: false,
  show_contact_information: false,
  payment_required: false,
};

const DEMO_SUMMARY: DashboardSummary = {
  today_count: 0,
  upcoming_count: 0,
  total_patients: 0,
  total_clinics: 0,
  published_posts: 0,
  today_appointments: [],
  recent_activity: [],
};

/** Public and patient-facing endpoints stay on the real API during a demo. */
const BYPASS_PREFIXES = [
  "/public",
  "/doctors/public",
  "/patient-auth",
  "/patient-account",
];

/** Writes a demo session may perform locally instead of being rejected. */
const ALLOWED_WRITE_PATHS = ["/auth/logout"];

const EMPTY_LIST_PATHS = [
  "/clinics",
  "/services",
  "/gallery",
  "/availability",
  "/availability/exceptions",
];

const EMPTY_PAGE_PATHS = ["/appointments", "/patients", "/payments", "/slots"];

function splitPath(path: string): { pathname: string; query: URLSearchParams } {
  const [pathname, search = ""] = path.split("?");
  return { pathname, query: new URLSearchParams(search) };
}

function emptyPage(query: URLSearchParams): Page<never> {
  const page = Number(query.get("page")) || 1;
  const limit = Number(query.get("limit")) || 20;
  return { items: [], meta: { page, limit, total: 0, total_pages: 0 } };
}

export function isDemoBypassPath(path: string): boolean {
  const { pathname } = splitPath(path);
  return BYPASS_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isDemoWriteAllowed(path: string): boolean {
  const { pathname } = splitPath(path);
  return ALLOWED_WRITE_PATHS.includes(pathname);
}

/**
 * Resolve a demo read. Unknown paths (detail endpoints, which are unreachable
 * because every list is empty) resolve to null so callers show their
 * "unable to load" state rather than crashing.
 */
export function getDemoPayload(path: string): unknown {
  const { pathname, query } = splitPath(path);

  if (pathname === "/auth/me" || pathname === "/doctors/profile") {
    return DEMO_DOCTOR;
  }
  if (pathname === "/dashboard") return DEMO_SUMMARY;
  if (pathname === "/settings") return DEMO_SETTINGS;
  if (pathname === "/health") return { status: "demo", database: "demo" };
  if (EMPTY_PAGE_PATHS.includes(pathname)) return emptyPage(query);
  if (EMPTY_LIST_PATHS.includes(pathname)) return [];
  if (/^\/patients\/[^/]+\/appointments$/.test(pathname)) return [];

  return null;
}
