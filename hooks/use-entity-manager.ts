"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { ApiResponse } from "@/types";

export function useEntityManager<T extends { id: string }, TPayload>({
  endpoint,
  initialItems,
}: {
  endpoint: string;
  initialItems: T[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  async function request<TResponse>(url: string, method: string, payload?: unknown) {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: payload ? JSON.stringify(payload) : undefined,
      });

      const result = (await response.json()) as ApiResponse<TResponse>;

      if (!response.ok || !result.success) {
        throw new Error(result.success ? "Request failed" : result.message);
      }

      router.refresh();
      return result.data;
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : "Request could not be completed.";
      setError(message);
      throw requestError;
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    items,
    setItems,
    isSubmitting,
    error,
    clearError: () => setError(null),
    createItem: async (payload: TPayload) => {
      const created = await request<T>(endpoint, "POST", payload);
      setItems((current) => [created, ...current]);
      return created;
    },
    updateItem: async (id: string, payload: Partial<TPayload>) => {
      const updated = await request<T>(`${endpoint}/${id}`, "PATCH", payload);
      setItems((current) => current.map((item) => (item.id === id ? updated : item)));
      return updated;
    },
    deleteItem: async (id: string) => {
      await request<{ deleted: boolean }>(`${endpoint}/${id}`, "DELETE");
      setItems((current) => current.filter((item) => item.id !== id));
    },
  };
}
