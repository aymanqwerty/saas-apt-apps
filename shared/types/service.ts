export type ServiceStatus = "ACTIVE" | "INACTIVE";

export interface Service {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  status: ServiceStatus;
}
