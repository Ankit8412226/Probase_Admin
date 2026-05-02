export type ExportRow = object;

function normalizeValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeValue(item)).join(" | ");
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function escapeCsvValue(value: string) {
  const escaped = value.replace(/"/g, '""');
  return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
}

export function buildCsv(rows: ExportRow[]) {
  if (!rows.length) {
    return "";
  }

  const headers = Array.from(
    new Set(rows.flatMap((row) => Object.keys(row))),
  );

  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) =>
          escapeCsvValue(normalizeValue((row as Record<string, unknown>)[header])),
        )
        .join(","),
    ),
  ];

  return lines.join("\n");
}

function triggerDownload(filename: string, content: string, type: string) {
  if (typeof window === "undefined") {
    return;
  }

  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadCsv(filename: string, rows: ExportRow[]) {
  const content = buildCsv(rows);

  if (!content) {
    return;
  }

  triggerDownload(`${filename}.csv`, content, "text/csv;charset=utf-8;");
}

export function downloadJson(filename: string, data: unknown) {
  triggerDownload(
    `${filename}.json`,
    JSON.stringify(data, null, 2),
    "application/json;charset=utf-8;",
  );
}
