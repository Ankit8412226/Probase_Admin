"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Download } from "lucide-react";

import { downloadCsv, downloadJson, type ExportRow } from "@/lib/export";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function ExportMenu({
  filename,
  csvRows,
  jsonData,
  label = "Export",
  className,
  align = "right",
}: {
  filename: string;
  csvRows?: ExportRow[];
  jsonData?: unknown;
  label?: string;
  className?: string;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hasCsv = Boolean(csvRows?.length);
  const hasJson = jsonData !== undefined;

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  if (!hasCsv && !hasJson) {
    return null;
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Button variant="secondary" onClick={() => setOpen((current) => !current)}>
        <Download size={15} />
        {label}
        <ChevronDown size={15} className={cn("transition", open && "rotate-180")} />
      </Button>
      {open ? (
        <div
          className={cn(
            "absolute top-[calc(100%+0.75rem)] z-30 min-w-[170px] rounded-[18px] border border-line bg-white p-2 shadow-panel",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {hasCsv ? (
            <button
              type="button"
              className="subtle-ring flex w-full items-center justify-between rounded-[14px] px-3 py-2 text-left text-sm font-medium transition hover:bg-mist"
              onClick={() => {
                downloadCsv(filename, csvRows ?? []);
                setOpen(false);
              }}
            >
              <span>Export CSV</span>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-fog">
                .csv
              </span>
            </button>
          ) : null}
          {hasJson ? (
            <button
              type="button"
              className="subtle-ring flex w-full items-center justify-between rounded-[14px] px-3 py-2 text-left text-sm font-medium transition hover:bg-mist"
              onClick={() => {
                downloadJson(filename, jsonData);
                setOpen(false);
              }}
            >
              <span>Export JSON</span>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-fog">
                .json
              </span>
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
