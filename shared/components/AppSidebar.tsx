"use client";

import {
  BookOpenText,
  Building2,
  CalendarCheck,
  CalendarRange,
  Clock,
  HeartPulse,
  LayoutDashboard,
  Receipt,
  Settings,
  Stethoscope,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/shared/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Scheduling",
    items: [
      { href: "/dashboard/appointments", label: "Appointments", icon: CalendarCheck },
      { href: "/dashboard/availability", label: "Availability", icon: CalendarRange },
      { href: "/dashboard/slots", label: "Slots", icon: Clock },
      { href: "/dashboard/payments", label: "Payments", icon: Receipt },
    ],
  },
  {
    label: "Records",
    items: [
      { href: "/dashboard/patients", label: "Patients", icon: Users },
      { href: "/dashboard/clinics", label: "Clinics", icon: Building2 },
      { href: "/dashboard/services", label: "Services", icon: Stethoscope },
    ],
  },
  {
    label: "Website",
    items: [
      { href: "/dashboard/gallery", label: "Blog", icon: BookOpenText },
      { href: "/dashboard/settings", label: "Website Settings", icon: Settings },
      { href: "/dashboard/profile", label: "Profile", icon: UserRound },
    ],
  },
];

function isActive(pathname: string, href: string): boolean {
  return href === "/dashboard"
    ? pathname === "/dashboard"
    : pathname.startsWith(href);
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b px-5">
        <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-xl">
          <HeartPulse className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">CarePanel</p>
          <p className="text-muted-foreground text-[11px]">Practice Admin</p>
        </div>
      </div>

      <nav className="scrollbar-thin flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-muted-foreground mb-1.5 px-3 text-[11px] font-semibold tracking-wider uppercase">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-accent text-accent-foreground"
                          : "text-sidebar-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-[18px] shrink-0",
                          active ? "text-primary" : "text-muted-foreground",
                        )}
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}
