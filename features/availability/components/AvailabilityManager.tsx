"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { ExceptionFormDialog } from "@/features/availability/components/ExceptionFormDialog";
import { RuleFormDialog } from "@/features/availability/components/RuleFormDialog";
import {
  useDeleteException,
  useDeleteRule,
  useExceptions,
  useRules,
} from "@/features/availability/hooks/useAvailability";
import { useClinics } from "@/features/clinics/hooks/useClinics";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import type { AvailabilityRule } from "@/shared/types/availability";

function formatTime(value: string): string {
  return value.slice(0, 5);
}

function titleCase(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

export function AvailabilityManager() {
  const { data: rules, isPending: rulesPending } = useRules();
  const { data: exceptions, isPending: exceptionsPending } = useExceptions();
  const { data: clinics } = useClinics();
  const deleteRule = useDeleteRule();
  const deleteException = useDeleteException();

  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AvailabilityRule | undefined>();
  const [ruleToDelete, setRuleToDelete] = useState<AvailabilityRule | null>(null);
  const [exceptionDialogOpen, setExceptionDialogOpen] = useState(false);

  const confirmDeleteRule = () => {
    if (!ruleToDelete) return;
    deleteRule.mutate(ruleToDelete.id, {
      onSuccess: () => setRuleToDelete(null),
    });
  };

  const clinicName = (clinicId: string | null) =>
    clinicId
      ? (clinics?.find((c) => c.id === clinicId)?.clinic_name ?? "Unknown clinic")
      : "All clinics";

  const openCreateRule = () => {
    setEditingRule(undefined);
    setRuleDialogOpen(true);
  };
  const openEditRule = (rule: AvailabilityRule) => {
    setEditingRule(rule);
    setRuleDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Weekly Availability</h2>
          <Button size="sm" onClick={openCreateRule}>
            <Plus className="size-4" />
            Add Rule
          </Button>
        </div>

        {rulesPending ? (
          <p className="text-muted-foreground text-sm">Loading rules...</p>
        ) : !rules || rules.length === 0 ? (
          <p className="text-muted-foreground bg-card rounded-xl border p-10 text-center text-sm shadow-sm">
            No availability rules yet. Add one to auto-generate booking slots.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {rules.map((rule) => (
              <li
                key={rule.id}
                className="bg-card flex items-center justify-between gap-4 rounded-xl border p-4 shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{titleCase(rule.weekday)}</span>
                    <span className="text-muted-foreground text-sm">
                      {formatTime(rule.start_time)}–{formatTime(rule.end_time)}
                    </span>
                    {rule.status === "INACTIVE" && (
                      <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {clinicName(rule.clinic_id)} · {rule.slot_duration_minutes} min ·{" "}
                    {rule.patients_per_slot}/slot
                    {rule.buffer_minutes > 0 && ` · ${rule.buffer_minutes} min buffer`}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditRule(rule)}>
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setRuleToDelete(rule)}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Exceptions</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExceptionDialogOpen(true)}
          >
            <Plus className="size-4" />
            Add Exception
          </Button>
        </div>

        {exceptionsPending ? (
          <p className="text-muted-foreground text-sm">Loading exceptions...</p>
        ) : !exceptions || exceptions.length === 0 ? (
          <p className="text-muted-foreground bg-card rounded-xl border p-10 text-center text-sm shadow-sm">
            No exceptions. Add holidays, leave, or custom hours to override your
            weekly schedule.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {exceptions.map((exc) => (
              <li
                key={exc.id}
                className="bg-card flex items-center justify-between gap-4 rounded-xl border p-4 shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{exc.exception_date}</span>
                    <span className="bg-muted rounded-full px-2 py-0.5 text-xs">
                      {titleCase(exc.exception_type)}
                    </span>
                    <span
                      className={
                        exc.is_available
                          ? "rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"
                          : "rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700"
                      }
                    >
                      {exc.is_available ? "Available" : "Unavailable"}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {clinicName(exc.clinic_id)}
                    {exc.is_available &&
                      exc.custom_start_time &&
                      ` · ${formatTime(exc.custom_start_time)}–${formatTime(
                        exc.custom_end_time ?? "",
                      )}`}
                    {exc.reason && ` · ${exc.reason}`}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteException.mutate(exc.id)}
                  disabled={deleteException.isPending}
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <RuleFormDialog
        key={editingRule?.id ?? "new-rule"}
        rule={editingRule}
        open={ruleDialogOpen}
        onOpenChange={setRuleDialogOpen}
      />
      <ExceptionFormDialog
        open={exceptionDialogOpen}
        onOpenChange={setExceptionDialogOpen}
      />

      <Dialog
        open={ruleToDelete !== null}
        onOpenChange={(open) => !open && setRuleToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete availability rule</DialogTitle>
            <DialogDescription>
              {ruleToDelete && ruleToDelete.upcoming_booked_count > 0 ? (
                <>
                  This rule has {ruleToDelete.upcoming_booked_count} upcoming
                  booked appointment
                  {ruleToDelete.upcoming_booked_count === 1 ? "" : "s"}. Those
                  appointments will be kept, but their slots will stop accepting
                  new bookings. Remaining open slots for this rule will be
                  removed.
                </>
              ) : (
                "This removes the rule and its future open slots. Existing appointments are always kept."
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRuleToDelete(null)}
              disabled={deleteRule.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteRule}
              disabled={deleteRule.isPending}
            >
              {deleteRule.isPending ? "Deleting..." : "Delete rule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
