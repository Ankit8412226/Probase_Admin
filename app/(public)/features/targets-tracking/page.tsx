import Link from "next/link";
import { Target, TrendingUp, Award, BarChart3, Users, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Performance Targets & KPIs - Probase Solutions",
  description: "Establish sales targets, track lead conversion counts, and monitor contract revenues against monthly quotas in a premium tracking cockpit.",
};

export default function TargetsTrackingPage() {
  const points = [
    {
      icon: TrendingUp,
      title: "Revenue & Sales Quotas",
      desc: "Configure monthly sales targets for representatives and managers. Watch collections progress update automatically against quotas."
    },
    {
      icon: Award,
      title: "Conversion Performance rates",
      desc: "Log lead closure rates across agents. Filter by warm lead dispositions and count successful upgrades to active clients status."
    },
    {
      icon: BarChart3,
      title: "Interactive Progress Metrics",
      desc: "Executive command widgets display performance statuses. Get early signals on target completion margins to optimize outreach."
    },
    {
      icon: Users,
      title: "Individual Agent Targets",
      desc: "Assign personalized volume targets to sales divisions. Transparent tracking fosters competition and highlights top performers."
    }
  ];

  return (
    <div className="py-20 max-w-5xl mx-auto px-6">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-medium mb-4">
          <Target size={13} />
          <span>Performance Management</span>
        </span>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mt-2">
          Track sales volumes and conversion targets live.
        </h1>
        <p className="mt-6 text-base text-slate-400 leading-relaxed">
          Operational targets are often disconnected from daily lead flows and payroll structures. Probase Solutions maps employee targets directly onto active clients proposals, enabling automated computations on compensation incentives.
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
          <h2 className="text-2xl font-bold text-white tracking-tight">Motivate team performance.</h2>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">
            Configure clear objectives and monitor progress inside your command center. Professional plans include full target tracking.
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
