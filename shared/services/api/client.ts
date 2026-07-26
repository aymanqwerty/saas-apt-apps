import { AUTH_COOKIE_NAME } from "@/shared/constants/auth";
import { isDemoToken } from "@/shared/constants/demo";
import {
  DEMO_READ_ONLY_MESSAGE,
  getDemoPayload,
  isDemoBypassPath,
  isDemoWriteAllowed,
} from "@/shared/services/api/demo.data";
import type { ApiResponse } from "@/shared/types/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

// API origin without the /api/v1 suffix — used for media URLs.
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

/**
 * Read the auth token from the (non-httpOnly) first-party cookie in the browser.
 * Returns null on the server (no `document`) — server callers pass their own
 * Authorization header instead. Lets client fetches authenticate a cross-domain
 * API with a Bearer header rather than relying on cross-site cookies.
 */
function getClientToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${AUTH_COOKIE_NAME}=`));
  return match ? decodeURIComponent(match.slice(match.indexOf("=") + 1)) : null;
}

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

/** Strip the "Bearer " prefix from a caller-supplied Authorization header. */
function tokenFromHeader(header: string): string {
  return header.replace(/^Bearer\s+/i, "");
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  // Server components pass their own Authorization header; on the client we
  // read the bearer token from the first-party cookie.
  const presetAuth = headers.Authorization ?? headers.authorization;
  const token = presetAuth ? tokenFromHeader(presetAuth) : getClientToken();

  // A demo session never reaches the API: reads resolve to empty payloads and
  // writes are rejected, so the app is fully browsable with no data in it.
  if (isDemoToken(token) && !isDemoBypassPath(path)) {
    const method = (init?.method ?? "GET").toUpperCase();
    if (method !== "GET" && !isDemoWriteAllowed(path)) {
      throw new ApiError(DEMO_READ_ONLY_MESSAGE, 403, "DEMO_READ_ONLY");
    }
    return getDemoPayload(path) as T;
  }

  // Reaching here with a demo token means a bypassed public endpoint — send it
  // unauthenticated rather than with the sentinel token.
  if (!presetAuth && token && !isDemoToken(token)) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...init,
    headers,
  });

  return handleResponse<T>(response);
}

/** Multipart upload variant: lets the browser set the Content-Type boundary. */
export async function apiUpload<T>(
  path: string,
  formData: FormData,
): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getClientToken();
  if (isDemoToken(token)) {
    throw new ApiError(DEMO_READ_ONLY_MESSAGE, 403, "DEMO_READ_ONLY");
  }
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    credentials: "include",
    body: formData,
    headers,
  });

  return handleResponse<T>(response);
}
