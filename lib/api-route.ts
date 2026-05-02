import { ZodError, type ZodSchema } from "zod";

import { AuthError } from "@/lib/auth";
import { apiError } from "@/lib/http";
import { formatValidationIssues } from "@/lib/validation/schemas";

export function handleApiException(error: unknown) {
  if (error instanceof AuthError) {
    return apiError(error.message, error.status);
  }

  if (error instanceof ZodError) {
    return apiError("Validation failed", 422, formatValidationIssues(error));
  }

  if (error instanceof Error) {
    return apiError(error.message, 400);
  }

  return apiError("Unexpected server error", 500);
}

export async function validateRequest<T>(request: Request, schema: ZodSchema<T>) {
  const payload = await request.json();
  return schema.parse(payload);
}

export function normalizeEmpty<T extends Record<string, unknown>>(
  payload: T,
  keys: Array<keyof T>,
) {
  const copy = { ...payload } as Record<string, unknown>;

  keys.forEach((key) => {
    if (copy[String(key)] === "") {
      copy[String(key)] = undefined;
    }
  });

  return copy as T;
}
