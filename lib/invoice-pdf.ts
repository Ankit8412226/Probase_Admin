import { formatCurrency, formatDate, slugify } from "@/lib/utils";
import type { AuthUser, ClientRecord, InvoiceRecord, ProjectRecord } from "@/types";

export interface InvoicePdfData {
  invoiceNumber: string;
  companyName: string;
  companySubtitle: string;
  clientCompany: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  projectName: string;
  ownerName: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  status: InvoiceRecord["status"];
}

function num(value: number) {
  return Number(value.toFixed(2)).toString();
}

function escapePdfText(value: string) {
  return value
    .replace(/[^\x20-\x7E]/g, "?")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function clampText(value: string, maxLength: number) {
  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength - 3)}...` : normalized;
}

function pushText(
  commands: string[],
  x: number,
  y: number,
  text: string,
  options: { font?: "F1" | "F2"; size?: number; gray?: number; maxLength?: number } = {},
) {
  const { font = "F1", size = 12, gray = 0, maxLength = 80 } = options;

  commands.push("BT");
  commands.push(`/${font} ${size} Tf`);
  commands.push(`${gray} g`);
  commands.push(`1 0 0 1 ${num(x)} ${num(y)} Tm`);
  commands.push(`(${escapePdfText(clampText(text, maxLength))}) Tj`);
  commands.push("ET");
  commands.push("0 g");
}

function pushCenteredText(
  commands: string[],
  x: number,
  y: number,
  width: number,
  text: string,
  options: { font?: "F1" | "F2"; size?: number; gray?: number; maxLength?: number } = {},
) {
  const size = options.size ?? 12;
  const clippedText = clampText(text, options.maxLength ?? 32);
  const estimatedWidth = clippedText.length * size * 0.48;
  const startX = x + Math.max(10, (width - estimatedWidth) / 2);

  pushText(commands, startX, y, clippedText, options);
}

function pushFilledRect(commands: string[], x: number, y: number, width: number, height: number, gray: number) {
  commands.push(`${gray} g`);
  commands.push(`${num(x)} ${num(y)} ${num(width)} ${num(height)} re`);
  commands.push("f");
  commands.push("0 g");
}

function pushLine(
  commands: string[],
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  gray = 0.86,
  width = 1,
) {
  commands.push(`${gray} G`);
  commands.push(`${num(width)} w`);
  commands.push(`${num(x1)} ${num(y1)} m`);
  commands.push(`${num(x2)} ${num(y2)} l`);
  commands.push("S");
  commands.push("0 G");
}

function pushLabelValue(commands: string[], x: number, y: number, label: string, value: string) {
  pushText(commands, x, y, label.toUpperCase(), { size: 8, gray: 0.5, maxLength: 24 });
  pushText(commands, x, y - 16, value, { font: "F2", size: 11, maxLength: 26 });
}

function buildPdfDocument(objects: string[]) {
  let output = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets[index + 1] = output.length;
    output += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefStart = output.length;
  output += `xref\n0 ${objects.length + 1}\n`;
  output += "0000000000 65535 f \n";

  offsets.slice(1).forEach((offset) => {
    output += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });

  output += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  output += `startxref\n${xrefStart}\n%%EOF`;

  return output;
}

export function createInvoicePdfData({
  invoice,
  client,
  project,
  owner,
}: {
  invoice: InvoiceRecord;
  client?: ClientRecord | null;
  project?: ProjectRecord | null;
  owner?: AuthUser | null;
}): InvoicePdfData {
  return {
    invoiceNumber: invoice.invoiceNumber,
    companyName: "Probase Solutions",
    companySubtitle: "Enterprise technology, delivery, and operations",
    clientCompany: client?.company ?? "Unknown client",
    clientName: client?.name ?? "Primary contact unavailable",
    clientEmail: client?.email ?? "accounts@probase.io",
    clientPhone: client?.phone ?? "N/A",
    projectName: project?.name ?? "Managed service engagement",
    ownerName: owner?.name ?? "Unassigned owner",
    amount: invoice.amount,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    paidDate: invoice.paidDate,
    status: invoice.status,
  };
}

export function createInvoicePdfBlob(data: InvoicePdfData) {
  const balanceDue = data.status === "Paid" ? 0 : data.amount;
  const paymentSummary =
    data.status === "Paid"
      ? `Collected on ${formatDate(data.paidDate)}`
      : data.status === "Partially Paid"
        ? "Collections in progress"
        : data.status === "Overdue"
          ? "Payment is past due"
          : "Awaiting payment confirmation";
  const commands: string[] = [];

  pushText(commands, 48, 804, data.companyName, { font: "F2", size: 13, maxLength: 34 });
  pushText(commands, 48, 788, data.companySubtitle, { size: 10, gray: 0.5, maxLength: 50 });
  pushFilledRect(commands, 430, 796, 117, 26, 0);
  pushCenteredText(commands, 430, 805, 117, data.status.toUpperCase(), {
    font: "F2",
    size: 9,
    gray: 1,
    maxLength: 18,
  });
  pushText(commands, 390, 758, "Invoice", { font: "F2", size: 29, maxLength: 18 });
  pushText(commands, 390, 738, data.invoiceNumber, { size: 11, gray: 0.5, maxLength: 22 });

  pushFilledRect(commands, 48, 666, 499, 82, 0.96);
  pushLabelValue(commands, 64, 726, "Issue Date", formatDate(data.issueDate));
  pushLabelValue(commands, 186, 726, "Due Date", formatDate(data.dueDate));
  pushLabelValue(commands, 308, 726, "Owner", data.ownerName);
  pushLabelValue(commands, 430, 726, "Amount", formatCurrency(data.amount));

  pushText(commands, 48, 624, "Bill To", { font: "F2", size: 12, maxLength: 14 });
  pushText(commands, 48, 600, data.clientCompany, { font: "F2", size: 15, maxLength: 34 });
  pushText(commands, 48, 580, data.clientName, { size: 11, gray: 0.5, maxLength: 38 });
  pushText(commands, 48, 562, data.clientEmail, { size: 11, gray: 0.5, maxLength: 38 });
  pushText(commands, 48, 544, data.clientPhone, { size: 11, gray: 0.5, maxLength: 22 });

  pushText(commands, 316, 624, "Engagement", { font: "F2", size: 12, maxLength: 14 });
  pushText(commands, 316, 600, data.projectName, { font: "F2", size: 15, maxLength: 34 });
  pushText(commands, 316, 580, `Account owner: ${data.ownerName}`, {
    size: 11,
    gray: 0.5,
    maxLength: 38,
  });
  pushText(commands, 316, 562, `Status: ${data.status}`, { size: 11, gray: 0.5, maxLength: 34 });
  pushText(commands, 316, 544, paymentSummary, { size: 11, gray: 0.5, maxLength: 36 });

  pushLine(commands, 48, 514, 547, 514);

  pushFilledRect(commands, 48, 398, 499, 92, 0.98);
  pushText(commands, 64, 456, "Balance Due", { size: 9, gray: 0.5, maxLength: 14 });
  pushText(commands, 64, 424, formatCurrency(balanceDue), { font: "F2", size: 28, maxLength: 16 });
  pushLabelValue(commands, 316, 456, "Subtotal", formatCurrency(data.amount));
  pushLabelValue(commands, 316, 424, "Paid Date", data.paidDate ? formatDate(data.paidDate) : "Pending");
  pushLabelValue(commands, 430, 456, "Total", formatCurrency(data.amount));
  pushLabelValue(commands, 430, 424, "Reference", data.invoiceNumber);

  pushLine(commands, 48, 366, 547, 366);
  pushText(commands, 48, 340, "Payment Notes", { font: "F2", size: 11, maxLength: 18 });
  pushText(commands, 48, 320, paymentSummary, { size: 11, gray: 0.5, maxLength: 64 });
  pushText(commands, 48, 290, "Generated from the Probase Solutions Admin Dashboard invoice workspace.", {
    size: 10,
    gray: 0.5,
    maxLength: 72,
  });
  pushText(commands, 48, 272, "For billing support, contact accounts@probase.io.", {
    size: 10,
    gray: 0.5,
    maxLength: 56,
  });

  const stream = commands.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Count 1 /Kids [3 0 R] >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ];

  return new Blob([buildPdfDocument(objects)], { type: "application/pdf" });
}

export function openInvoicePdf(data: InvoicePdfData) {
  const url = URL.createObjectURL(createInvoicePdfBlob(data));
  const pdfWindow = window.open(url, "_blank", "noopener,noreferrer");

  if (!pdfWindow) {
    URL.revokeObjectURL(url);
    return false;
  }

  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return true;
}

export function downloadInvoicePdf(data: InvoicePdfData) {
  const url = URL.createObjectURL(createInvoicePdfBlob(data));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${slugify(data.invoiceNumber || "invoice")}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}
