import { apiFetch } from "@/shared/services/api/client";
import type { Service, ServiceStatus } from "@/shared/types/service";

export interface ServicePayload {
  title: string;
  description?: string | null;
  image_url?: string | null;
  sort_order?: number;
  status?: ServiceStatus;
}

export function listServices(): Promise<Service[]> {
  return apiFetch<Service[]>("/services");
}

export function createService(payload: ServicePayload): Promise<Service> {
  return apiFetch<Service>("/services", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateService(
  serviceId: string,
  payload: Partial<ServicePayload>,
): Promise<Service> {
  return apiFetch<Service>(`/services/${serviceId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteService(serviceId: string): Promise<null> {
  return apiFetch<null>(`/services/${serviceId}`, { method: "DELETE" });
}
