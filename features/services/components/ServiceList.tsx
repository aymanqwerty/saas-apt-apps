"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { ServiceFormDialog } from "@/features/services/components/ServiceFormDialog";
import {
  useDeleteService,
  useServices,
} from "@/features/services/hooks/useServices";
import { Button } from "@/shared/components/ui/button";
import type { Service } from "@/shared/types/service";

export function ServiceList() {
  const { data, isPending, isError } = useServices();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Service | undefined>(undefined);

  const openCreate = () => {
    setEditing(undefined);
    setDialogOpen(true);
  };

  const openEdit = (service: Service) => {
    setEditing(service);
    setDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={openCreate}>
          <Plus className="size-4" />
          Add Service
        </Button>
      </div>

      {isPending ? (
        <p className="text-muted-foreground text-sm">Loading services...</p>
      ) : isError ? (
        <p className="text-destructive text-sm">Unable to load services.</p>
      ) : data.length === 0 ? (
        <p className="text-muted-foreground bg-card rounded-xl border p-10 text-center text-sm shadow-sm">
          No services yet. Add the treatments you offer to show them on your
          website.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {data.map((service) => (
            <ServiceRow
              key={service.id}
              service={service}
              onEdit={() => openEdit(service)}
            />
          ))}
        </ul>
      )}

      <ServiceFormDialog
        key={editing?.id ?? "new"}
        service={editing}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}

function ServiceRow({
  service,
  onEdit,
}: {
  service: Service;
  onEdit: () => void;
}) {
  const deleteMutation = useDeleteService();

  return (
    <li className="bg-card flex items-center justify-between gap-4 rounded-xl border p-4 shadow-sm">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium">{service.title}</span>
          <span
            className={
              service.status === "ACTIVE"
                ? "rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"
                : "bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium"
            }
          >
            {service.status}
          </span>
        </div>
        {service.description && (
          <p className="text-muted-foreground truncate text-sm">
            {service.description}
          </p>
        )}
      </div>
      <div className="flex shrink-0 gap-2">
        <Button variant="outline" size="sm" onClick={onEdit}>
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => deleteMutation.mutate(service.id)}
          disabled={deleteMutation.isPending}
        >
          Delete
        </Button>
      </div>
    </li>
  );
}
