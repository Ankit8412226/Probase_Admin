import Link from "next/link";
import { FileText, Receipt, Layers, Printer, Wallet, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Invoices & Proposals Ledger - Probase Solutions",
  description: "Draft digital client proposals and generate PDF invoices automatically. Track collections and partial payments in one unified ledger.",
};

export default function InvoiceBillingPage() {
  const points = [
    {
      icon: FileText,
      title: "Digital Proposal Builder",
      desc: "Draft professional scope of work proposals inside your dashboard. Export to print-ready PDF configurations or share web links directly."
    },
    {
      icon: Receipt,
      title: "Dynamic PDF Invoices",
      desc: "Auto-compile tax percentages, client company fields, and project milestones. Download or print corporate-standard financial receipts instantly."
    },
    {
      icon: Wallet,
      title: "Collections & Partial Payments",
      desc: "Track invoice logs status (Paid, Pending, Overdue). Record partial transactions to maintain absolute accuracy over client account balances."
    },
    {
      icon: Printer,
      title: "WhatsApp Dispatch Integration",
      desc: "Trigger PDF download links directly to your client contacts via standard automated WhatsApp messages once milestone billing is approved."
    }
  ];

  return (
    <div className="py-20 max-w-5xl mx-auto px-6">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-medium mb-4">
          <Receipt size={13} />
          <span>Milestone Billing Ledger</span>
        </span>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mt-2">
          Unified proposals drafting and milestone PDF invoices.
        </h1>
        <p className="mt-6 text-base text-slate-400 leading-relaxed">
          Toggling between doc writers, billing spreadsheets, and accounting software leads to operational delays. Probase Solutions bundles client contracts, milestone delivery schedules, and dynamic invoicing receipts in one secure database structure.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-12">
        {points.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="border border-slate-900 bg-slate-950 p-8 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 bg-indigo-650/15 text-indigo-400 rounded-xl flex items-center justify-center mb-6">
                  <Icon size={18} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-20 border border-slate-900 bg-slate-900/10 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 max-w-4xl mx-auto">
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-white tracking-tight">Streamline your contract billing.</h2>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">
            Protect agency margins. Professional plans feature dynamic proposals, PDF exports, and WhatsApp invoice dispatch limits.
          </p>
        </div>
        <Link href="/signup">
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-6 py-3.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 shrink-0 transition active:scale-95">
            Start 15-Day Free Trial
            <ArrowRight size={14} />
          </button>
        </Link>
      </div>
    </div>
  );
}
