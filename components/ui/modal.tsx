"use client";

import { X } from "lucide-react";

import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  className,
}: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-10 backdrop-blur-sm">
      <div className={cn("surface max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6", className)}>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            {description ? <p className="mt-1 text-sm text-fog">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="subtle-ring rounded-full border border-line p-2 text-fog transition hover:bg-mist hover:text-black"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
