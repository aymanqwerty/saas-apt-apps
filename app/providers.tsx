"use client";

import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState } from "react";
import { Toaster, toast } from "sonner";

import { ApiError } from "@/shared/services/api/client";

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      // When set, a success toast with this message is shown automatically.
      successMessage?: string;
    };
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        // Global mutation feedback: success message from meta, errors always.
        mutationCache: new MutationCache({
          onSuccess: (_data, _vars, _ctx, mutation) => {
            const message = mutation.meta?.successMessage;
            if (message) toast.success(message);
          },
          onError: (error) => {
            const message =
              error instanceof ApiError
                ? error.message
                : "Something went wrong. Please try again.";
            toast.error(message);
          },
        }),
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 30_000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
