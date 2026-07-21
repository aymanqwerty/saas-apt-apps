import type { Metadata } from "next";

import { DashboardHome } from "@/features/dashboard/components/DashboardHome";
import { getServerDoctor } from "@/shared/services/api/auth.server";

export const metadata: Metadata = {
  title: "Dashboard | Doctor Management Platform",
};

export default async function DashboardPage() {
  const doctor = await getServerDoctor();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Welcome back, {doctor?.full_name}
        </h2>
        <p className="text-muted-foreground text-sm">{today}</p>
      </div>
      <DashboardHome />
    </div>
  );
}
