"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface TableColumn<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  className?: string;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  emptyMessage,
  initialPageSize = 10,
}: {
  columns: TableColumn<T>[];
  data: T[];
  emptyMessage: string;
  initialPageSize?: number;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Reset to first page whenever the dataset filters/updates
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  const totalRecords = data.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  
  // Safe bounds check
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRecords);
  const paginatedData = data.slice(startIndex, endIndex);

  return (
    <Card className="overflow-hidden p-0 border border-line bg-white shadow-sm flex flex-col justify-between">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line text-left">
          <thead className="bg-mist/60">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-5 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-fog font-mono border-b border-line"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-white">
            {paginatedData.length ? (
              paginatedData.map((item) => (
                <tr key={item.id} className="transition hover:bg-mist/30">
                  {columns.map((column) => (
                    <td key={column.key} className="px-5 py-3.5 align-middle text-sm text-black">
                      <div className={column.className}>{column.render(item)}</div>
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-12 text-center text-sm text-fog font-medium"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer Dashboard Controls */}
      {totalRecords > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-3.5 border-t border-line bg-white/70 backdrop-blur-sm">
          {/* Record statistics */}
          <div className="text-xs text-fog font-medium">
            Showing <span className="font-semibold text-black">{totalRecords === 0 ? 0 : startIndex + 1}</span> to{" "}
            <span className="font-semibold text-black">{endIndex}</span> of{" "}
            <span className="font-semibold text-black">{totalRecords}</span> entries
          </div>

          {/* Interactive controls */}
          <div className="flex items-center gap-4">
            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-fog font-medium">Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-8 rounded-lg border border-line bg-white px-2 py-1 text-xs font-semibold text-black focus:border-black focus:outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Previous/Next button group */}
            <div className="flex items-center gap-1.5">
              <Button
                variant="secondary"
                className="h-8 w-8 p-0"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={activePage === 1}
              >
                <ChevronLeft size={14} />
              </Button>
              
              <div className="text-xs font-semibold text-black font-mono bg-mist px-2.5 py-1 rounded-md">
                Page {activePage} of {totalPages}
              </div>

              <Button
                variant="secondary"
                className="h-8 w-8 p-0"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={activePage === totalPages}
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
