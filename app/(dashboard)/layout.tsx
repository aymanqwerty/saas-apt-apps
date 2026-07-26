import { redirect } from "next/navigation";

import { AppSidebar } from "@/shared/components/AppSidebar";
import { DemoBanner } from "@/shared/components/DemoBanner";
import { Topbar } from "@/shared/components/Topbar";
import { getServerDoctor, isDemoSession } from "@/shared/services/api/auth.server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [doctor, isDemo] = await Promise.all([
    getServerDoctor(),
    isDemoSession(),
  ]);
  if (!doctor) {
    redirect("/login");
  }

  return (
    <div className="bg-background flex min-h-screen">
      <aside className="bg-card sticky top-0 hidden h-screen w-64 shrink-0 border-r md:flex">
        <AppSidebar />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        {isDemo && <DemoBanner />}
        <Topbar doctorName={doctor.full_name} />
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
