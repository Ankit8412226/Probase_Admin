"use client";

import { useEffect, useState } from "react";
import { Download, ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  createInvoicePdfBlob,
  downloadInvoicePdf,
  openInvoicePdf,
  type InvoicePdfData,
} from "@/lib/invoice-pdf";
import { formatCurrency, formatDate } from "@/lib/utils";

function getStatusTone(status: InvoicePdfData["status"]) {
  if (status === "Paid") {
    return "success";
  }

  if (status === "Overdue") {
    return "warning";
  }

  return "neutral";
}

export function InvoicePdfModal({
  invoiceData,
  open,
  onClose,
}: {
  invoiceData: InvoicePdfData | null;
  open: boolean;
  onClose: () => void;
}) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !invoiceData) {
      setPdfUrl(null);
      return;
    }

    const url = URL.createObjectURL(createInvoicePdfBlob(invoiceData));
    setPdfUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [invoiceData, open]);

  if (!open || !invoiceData) {
    return null;
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${invoiceData.invoiceNumber} PDF`}
      description="Preview the invoice document and download a shareable PDF."
      className="max-w-6xl"
    >
      <div className="space-y-5">
        <div className="flex flex-col gap-4 border-b border-line bg-mist px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-lg font-semibold">{invoiceData.clientCompany}</p>
              <Badge tone={getStatusTone(invoiceData.status)}>{invoiceData.status}</Badge>
            </div>
            <div className="grid gap-3 text-sm text-fog md:grid-cols-4">
              <p>Amount {formatCurrency(invoiceData.amount)}</p>
              <p>Issued {formatDate(invoiceData.issueDate)}</p>
              <p>Due {formatDate(invoiceData.dueDate)}</p>
              <p>Owner {invoiceData.ownerName}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => openInvoicePdf(invoiceData)}
            >
              <ExternalLink size={16} />
              Open PDF
            </Button>
            <Button onClick={() => downloadInvoicePdf(invoiceData)}>
              <Download size={16} />
              Download PDF
            </Button>
          </div>
        </div>

        <div className="px-6 pb-6">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              title={`${invoiceData.invoiceNumber} PDF preview`}
              className="h-[72vh] w-full rounded-[18px] border border-line bg-white"
            />
          ) : (
            <div className="flex h-[72vh] items-center justify-center rounded-[18px] border border-dashed border-line bg-mist text-sm text-fog">
              Preparing invoice preview...
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
