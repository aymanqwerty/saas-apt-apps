"use client";

import {
  BookOpenText,
  Building2,
  CalendarCheck,
  CalendarRange,
  ClipboardPlus,
  Users,
  UserRoundCog,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import { Button } from "@/shared/components/ui/button";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { cn } from "@/shared/lib/utils";
import type { DashboardSummary } from "@/shared/types/dashboard";

interface StatDef {
  label: string;
  value: (d: DashboardSummary) => number;
  icon: LucideIcon;
  tint: string;
}

const STATS: StatDef[] = [
  {
    label: "Today's Appointments",
    value: (d) => d.today_count,
    icon: CalendarCheck,
    tint: "bg-blue-50 text-blue-600",
  },
  {
    label: "Upcoming Appointments",
    value: (d) => d.upcoming_count,
    icon: CalendarRange,
    tint: "bg-indigo-50 text-indigo-600",
  },
  {
    label: "Total Patients",
    value: (d) => d.total_patients,
    icon: Users,
    tint: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Total Clinics",
    value: (d) => d.total_clinics,
    icon: Building2,
    tint: "bg-amber-50 text-amber-600",
  },
  {
    label: "Published Stories",
    value: (d) => d.published_posts,
    icon: BookOpenText,
    tint: "bg-violet-50 text-violet-600",
  },
];

const QUICK_ACTIONS = [
  { href: "/dashboard/clinics/new", label: "Add Clinic", icon: Building2 },
  { href: "/dashboard/availability", label: "Set Availability", icon: CalendarRange },
  { href: "/dashboard/appointments", label: "Appointments", icon: ClipboardPlus },
  { href: "/dashboard/profile", label: "Edit Profile", icon: UserRoundCog },
];

function humanizeAction(action: string): string {
  return action
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function DashboardHome() {
  const { data, isPending, isError } = useDashboard();

  if (isPending) {
    return <p className="text-muted-foreground">Loading dashboard...</p>;
  }
  if (isError || !data) {
    return <p className="text-destructive">Unable to load the dashboard.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-card rounded-xl border p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-2xl font-semibold tracking-tight">
                    {stat.value(data)}
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {stat.label}
                  </p>
                </div>
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-lg",
                    stat.tint,
                  )}
                >
                  <Icon className="size-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.href}
              variant="outline"
              size="sm"
              render={<Link href={action.href} />}
            >
              <Icon className="size-4" />
              {action.label}
            </Button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's appointments */}
        <section className="bg-card rounded-xl border shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="font-semibold">Today&apos;s Appointments</h2>
            <Link
              href="/dashboard/appointments"
              className="text-primary text-sm font-medium hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="p-3">
            {data.today_appointments.length === 0 ? (
              <p className="text-muted-foreground px-2 py-6 text-center text-sm">
                No appointments scheduled for today.
              </p>
            ) : (
              <ul className="flex flex-col">
                {data.today_appointments.map((appt) => (
                  <li key={appt.id}>
                    <Link
                      href={`/dashboard/appointments/${appt.id}`}
                      className="hover:bg-muted flex items-center justify-between gap-4 rounded-lg px-3 py-2.5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 text-primary flex min-w-14 flex-col items-center rounded-md px-2 py-1 text-xs font-semibold">
                          {appt.start_time.slice(0, 5)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {appt.patient_name}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {appt.clinic_name}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={appt.appointment_status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Recent activity */}
        <section className="bg-card rounded-xl border shadow-sm">
          <div className="border-b px-5 py-4">
            <h2 className="font-semibold">Recent Activity</h2>
          </div>
          <div className="p-5">
            {data.recent_activity.length === 0 ? (
              <p className="text-muted-foreground py-6 text-center text-sm">
                No recent activity.
              </p>
            ) : (
              <ul className="flex flex-col gap-3 text-sm">
                {data.recent_activity.map((entry, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <span className="bg-primary/50 size-1.5 shrink-0 rounded-full" />
                    <span className="flex-1">{humanizeAction(entry.action)}</span>
                    <span className="text-muted-foreground text-xs">
                      {entry.created_at.slice(0, 10)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
