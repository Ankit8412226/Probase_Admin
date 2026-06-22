import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value?: string) {
  if (!value) {
    return "—";
  }

  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = isDateOnly ? new Date(`${value}T00:00:00Z`) : new Date(value);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(isDateOnly ? { timeZone: "UTC" } : {}),
  }).format(date);
}

export function formatMonth(value: string) {
  const date = new Date(`${value}-01T00:00:00Z`);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}
