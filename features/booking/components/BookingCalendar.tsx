"use client";

import { ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";

import { cn } from "@/shared/lib/utils";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function isoOf(year: number, month: number, day: number): string {
  return `${year}-${pad2(month + 1)}-${pad2(day)}`;
}

export function BookingCalendar({
  year,
  month,
  todayIso,
  selected,
  availableDates,
  onSelect,
  onPrev,
  onNext,
  canPrev,
  canNext,
  loading,
}: {
  year: number;
  month: number;
  todayIso: string;
  selected: string;
  availableDates: Set<string>;
  onSelect: (iso: string) => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  loading: boolean;
}) {
  const monthName = new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "long",
  });
  const startPad = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="rounded-xl border p-4">
      <div className="mb-3 flex items-center justify-between">
        <CalNavButton onClick={onPrev} disabled={!canPrev} label="Previous month">
          <ChevronLeft className="size-4" />
        </CalNavButton>
        <span className="text-sm font-medium">
          {monthName} {year}
        </span>
        <CalNavButton onClick={onNext} disabled={!canNext} label="Next month">
          <ChevronRight className="size-4" />
        </CalNavButton>
      </div>

      <div className="text-muted-foreground mb-1 grid grid-cols-7 gap-1 text-center text-xs">
        {WEEKDAYS.map((w) => (
          <span key={w} className="py-1">
            {w}
          </span>
        ))}
      </div>

      <div className="relative">
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, index) => {
            if (day === null) return <span key={`pad-${index}`} />;
            const iso = isoOf(year, month, day);
            const isSelected = iso === selected;
            const enabled = iso >= todayIso && availableDates.has(iso);
            return (
              <button
                key={iso}
                type="button"
                disabled={!enabled}
                onClick={() => onSelect(iso)}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-lg text-sm transition-colors",
                  isSelected
                    ? "bg-primary text-primary-foreground font-semibold"
                    : enabled
                      ? "hover:bg-accent hover:text-accent-foreground font-medium"
                      : "text-muted-foreground/40 cursor-default",
                )}
              >
                {day}
              </button>
            );
          })}
        </div>

        {loading && (
          <div className="bg-card/60 absolute inset-0 flex items-center justify-center rounded-lg">
            <LoaderCircle className="text-muted-foreground size-5 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}

function CalNavButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="hover:bg-muted flex size-8 items-center justify-center rounded-lg transition-colors disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  );
}
