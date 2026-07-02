import Link from "next/link";
import { DollarSign, Percent, Calculator, CalendarClock, MessageSquare, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Payroll & Salaries Engine - Probase Solutions",
  description: "Automate organization payroll calculations. Sync employee clock-ins, configure late penalties, and generate PDF payslips.",
};

export default function PayrollEnginePage() {
  const points = [
    {
      icon: CalendarClock,
      title: "Shifts compliance sync",
      desc: "Synchronize salaries automatically with custom shift configurations. Roster schedules calculate grace periods and mark late flags dynamically."
    },
    {
      icon: Calculator,
      title: "Automatic Deductions",
      desc: "Base salary rates adapt to attendance records. Late clock-ins apply configured salary deductions automatically, leaving zero room for human errors."
    },
    {
      icon: DollarSign,
      title: "Salary Releases ledger",
      desc: "Approve and release salaries in bulk. Create structured digital payslips showing gross compensation, deductions breakdown, and net payout."
    },
    {
      icon: MessageSquare,
      title: "WhatsApp Dispatch Link",
      desc: "Send PDF download links directly to employee mobile devices via direct WhatsApp notifications as soon as payroll is released."
    }
  ];

  return (
    <div className="py-20 max-w-5xl mx-auto px-6">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-medium mb-4">
          <DollarSign size={13} />
          <span>Compensation Controls</span>
        </span>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mt-2">
          Adaptive payroll processing based on team rosters.
        </h1>
        <p className="mt-6 text-base text-slate-400 leading-relaxed">
          HR operations waste hours manually computing late arrivals and salary cuts from spreadsheet tables. Probase Solutions maps shift parameters directly onto biometric logs to release salary logs and PDF payslips automatically in one clean cockpit.
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
          <h2 className="text-2xl font-bold text-white tracking-tight">Simplify organization compensation.</h2>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">
            Eliminate operational overhead on monthly releases. Sync Shifts with Salaries inside your private tenant environment.
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
