import { getHealth, type HealthStatus } from "@/shared/services/api/health.service";

export const dynamic = "force-dynamic";

async function fetchHealth(): Promise<HealthStatus | null> {
  try {
    return await getHealth();
  } catch {
    return null;
  }
}

export default async function Home() {
  const health = await fetchHealth();
  const apiOnline = health !== null;
  const databaseConnected = health?.database === "connected";

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-24">
      <main className="flex w-full max-w-xl flex-col items-center gap-6 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          Doctor Management Platform
        </h1>
        <p className="text-muted-foreground text-lg">
          Multi-tenant platform for doctors: professional website, appointment
          booking, and practice management.
        </p>

        <dl className="grid w-full max-w-sm grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border p-4">
            <dt className="text-muted-foreground">API</dt>
            <dd className="mt-1 font-medium">
              {apiOnline ? "Online" : "Offline"}
            </dd>
          </div>
          <div className="rounded-lg border p-4">
            <dt className="text-muted-foreground">Database</dt>
            <dd className="mt-1 font-medium">
              {databaseConnected ? "Connected" : "Disconnected"}
            </dd>
          </div>
        </dl>
      </main>
    </div>
  );
}
