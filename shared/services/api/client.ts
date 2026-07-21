import type { ApiResponse } from "@/shared/types/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

// API origin without the /api/v1 suffix — used for media URLs.
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

export class ApiError extends Error {
  readonly status: number;
  readonly errorCode?: string;

  constructor(message: string, status: number, errorCode?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errorCode = errorCode;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const body = (await response.json()) as ApiResponse<T> & {
    error_code?: string;
  };

  if (!response.ok || !body.success) {
    throw new ApiError(
      body.message ?? "Request failed",
      response.status,
      body.error_code,
    );
  }

  return body.data;
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  return handleResponse<T>(response);
}

/** Multipart upload variant: lets the browser set the Content-Type boundary. */
export async function apiUpload<T>(
  path: string,
  formData: FormData,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  return handleResponse<T>(response);
}
