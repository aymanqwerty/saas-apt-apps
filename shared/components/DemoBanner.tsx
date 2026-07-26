import { Info } from "lucide-react";

export function DemoBanner() {
  return (
    <div className="flex items-center justify-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900">
      <Info className="size-3.5 shrink-0" />
      <span>
        Demo session — every screen is browsable, but no data is loaded and
        changes cannot be saved.
      </span>
    </div>
  );
}
