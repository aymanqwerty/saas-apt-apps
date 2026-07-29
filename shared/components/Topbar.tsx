"use client";

import { usePathname } from "next/navigation";

import { LogoutButton } from "@/features/authentication/components/LogoutButton";
import { MobileSidebar } from "@/shared/components/MobileSidebar";

const TITLES: Record<string, string> = {
  "": "Dashboard",
  appointments: "Appointments",
  patients: "Patients",
  clinics: "Clinics",
  services: "Services",
  availability: "Availability",
  slots: "Slots",
  payments: "Payments",
  gallery: "Blog",
  settings: "Website Settings",
  profile: "Profile",
};

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Topbar({ doctorName }: { doctorName: string }) {
  const pathname = usePathname();
  const segment = pathname.replace(/^\/dashboard\/?/, "").split("/")[0] ?? "";
  const title = TITLES[segment] ?? "Dashboard";

  return (
    <header className="bg-card/80 sticky top-0 z-10 flex h-16 items-center justify-between border-b px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-2">
        <MobileSidebar />
        <h1 className="text-base font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-full text-xs font-semibold">
            {initialsOf(doctorName)}
          </div>
          <span className="hidden text-sm font-medium sm:inline">
            {doctorName}
          </span>
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}
