import Link from "next/link";
import { Building, ShieldCheck, Clock, Users, MessageSquare, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Solutions for Staffing Firms - Probase Solutions",
  description: "Verify contractor compliance with browser face biometrics, organize shifting slots, and broadcast roster updates via WhatsApp.",
};

export default function StaffingFirmsPage() {
  const points = [
    {
      icon: ShieldCheck,
      title: "Buddy-Proof Face Attendance",
      desc: "Contractors sign in via contactless webcam scans. The browser parses facial landmarks to guarantee biometric identity, stopping buddy-punching."
    },
    {
      icon: Clock,
      title: "Shifts compliance tracking",
      desc: "Assign contractors to morning or evening slots. Roster late thresholds calculate attendance deductions dynamically on payouts."
    },
    {
      icon: MessageSquare,
      title: "Bulk Contractor Messaging",
      desc: "Broadcast shift openings or timing updates directly to contractor phone lists using standard WhatsApp Web sockets, bypassing Meta pricing."
    },
    {
      icon: Users,
      title: "Consolidated HR Ledger",
      desc: "Track payroll statuses, base salary allocations, compliance histories, and contract releases under a unified dashboard."
    }
  ];

  return (
    <div className="py-20 w-full px-6">
      <div className="text-center w-full mb-16">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-medium mb-4">
          <Building size={13} />
          <span>Staffing & Recruitment</span>
        </span>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mt-2">
          Biometric verification and roster dispatch for staffing groups.
        </h1>
        <p className="mt-6 text-base text-slate-400 leading-relaxed">
          HR staffing firms waste massive resources calculating contractor hours and coordinating daily schedules. Probase Solutions bundles webcam biometrics, shift rosters, and direct WhatsApp integrations to automate contractor schedules compliance in real-time.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-12">
        {points.map((item, idx) => {
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
          <h2 className="text-2xl font-bold text-white tracking-tight">Protect staffing margins today.</h2>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">
            Verify contractor identities and send schedule notices automatically. Professional plans include biometric face models.
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
