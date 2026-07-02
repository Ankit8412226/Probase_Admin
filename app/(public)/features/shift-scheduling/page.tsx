import Link from "next/link";
import { Calendar, Clock, Settings, UserCheck, Timer, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Employee Shifts & Rostering - Probase Solutions",
  description: "Schedule employee shift hours, establish grace thresholds, assign teams, and sync roster compliance statistics dynamically.",
};

export default function ShiftSchedulingPage() {
  const points = [
    {
      icon: Clock,
      title: "Custom Shift Timing Slots",
      desc: "Define custom work shifts with specific start hours, end times, and late check-in grace thresholds (e.g. 15-minute margin)."
    },
    {
      icon: Settings,
      title: "Grace Periods & Deductions",
      desc: "Determine automated deduction rules. Set late arrival frequencies to calculate payroll penalties without manual inputs."
    },
    {
      icon: Calendar,
      title: "Roster Allocation Controls",
      desc: "Assign employees to morning, evening, or night shift schedules. Roster changes sync with worker portals instantly."
    },
    {
      icon: Timer,
      title: "Real-time Attendance Syncing",
      desc: "Worker check-in stamps are cross-referenced with assigned shifts. Compliance metrics display on manager dashboards automatically."
    }
  ];

  return (
    <div className="py-20 max-w-5xl mx-auto px-6">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-medium mb-4">
          <Calendar size={13} />
          <span>Roster Automations</span>
        </span>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mt-2">
          Adaptive team shifts scheduling and grace timing rules.
        </h1>
        <p className="mt-6 text-base text-slate-400 leading-relaxed">
          Static spreadsheets fail to track dynamic staff rotas, leading to incorrect payroll logs. Probase Solutions bundles shift scheduling controls directly with face verification feeds, generating automated calculations on worker compliance rates.
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
          <h2 className="text-2xl font-bold text-white tracking-tight">Streamline shift compliance schedules.</h2>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">
            Configure flexible grace periods and attendance rules. Professional plans feature dynamic shifts and roster maps.
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
