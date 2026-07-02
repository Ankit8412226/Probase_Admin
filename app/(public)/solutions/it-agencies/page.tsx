import Link from "next/link";
import { Sparkles, Terminal, FileText, Users, DollarSign, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Solutions for IT Agencies - Probase Solutions",
  description: "Synchronize client delivery, engineer shift rosters, milestone invoices, and sales playbooks in one unified agency dashboard.",
};

export default function ItAgenciesPage() {
  const requirements = [
    {
      icon: Terminal,
      title: "Project Delivery Timelines",
      desc: "Assign projects to specific software engineers, track milestones budget compliance, and link project states directly to active client logs."
    },
    {
      icon: FileText,
      title: "Structured Proposal Dispatch",
      desc: "Draft professional scopes of work and send payment schedules directly to client decision makers. Export contracts to PDF instantly."
    },
    {
      icon: Users,
      title: "Engineers Shifts Roster",
      desc: "Track engineers attendance compliance across morning or evening standby schedules. Prevent buddy-punching using biometric check-ins."
    },
    {
      icon: DollarSign,
      title: "Flexible Payroll Adjustments",
      desc: "Generate professional monthly payslips factoring in active contract values and automatic shift grace thresholds deductions."
    }
  ];

  return (
    <div className="py-20 w-full px-6">
      <div className="text-center w-full mb-16">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-medium mb-4">
          <Sparkles size={13} />
          <span>Professional Service Firms</span>
        </span>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mt-2">
          The complete cockpit for high-scale IT services agencies.
        </h1>
        <p className="mt-6 text-base text-slate-400 leading-relaxed">
          IT agencies lose margin when toggling between developer task managers, invoice builders, and HR biometric systems. Probase Solutions consolidates software delivery pipelines with employee payroll schedules and WhatsApp CRM broadcasts under one isolated tenant schema.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-12">
        {requirements.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="border border-slate-900 bg-slate-950 p-8 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 bg-indigo-600/15 text-indigo-400 rounded-xl flex items-center justify-center mb-6">
                  <Icon size={18} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-20 border border-slate-900 bg-slate-900/10 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 w-full">
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-white tracking-tight">Scale your agency operations.</h2>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">
            Unify engineering schedules, client ledgers, and sales objection coaching. Setup your tenant workspace.
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
