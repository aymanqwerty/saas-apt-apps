import type {
  Gender,
  PatientRelationship,
} from "@/shared/types/patient-account";

export function relationshipLabel(value: PatientRelationship | null): string {
  if (!value) return "";
  const map: Record<PatientRelationship, string> = {
    SELF: "Myself",
    SPOUSE: "Spouse",
    FATHER: "Father",
    MOTHER: "Mother",
    SON: "Son",
    DAUGHTER: "Daughter",
    BROTHER: "Brother",
    SISTER: "Sister",
    GUARDIAN: "Guardian",
    OTHER: "Other",
  };
  return map[value];
}

export function genderLabel(value: Gender | null): string {
  if (!value) return "";
  const map: Record<Gender, string> = {
    MALE: "Male",
    FEMALE: "Female",
    OTHER: "Other",
    PREFER_NOT_TO_SAY: "Prefer not to say",
  };
  return map[value];
}

/** "34 yrs · Male" style meta line, skipping missing parts. */
export function personMeta(
  age: number | null,
  gender: Gender | null,
): string {
  return [age != null ? `${age} yrs` : null, genderLabel(gender) || null]
    .filter(Boolean)
    .join(" · ");
}
