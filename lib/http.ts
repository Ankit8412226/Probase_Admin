import { NextResponse } from "next/server";

import type { ApiError, ApiSuccess } from "@/types";

export function apiSuccess<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiSuccess<T>>({ success: true, data }, init);
}

export function apiError(
  message: string,
  status = 400,
  issues?: string[],
  init?: ResponseInit,
) {
  return NextResponse.json<ApiError>(
    {
      success: false,
      message,
      issues,
    },
    {
      status,
      ...init,
    },
  );
}

export async function parseJson<T>(request: Request) {
  try {
    return (await request.json()) as T;
  } catch {
    throw new Error("Invalid JSON payload.");
  }
}
