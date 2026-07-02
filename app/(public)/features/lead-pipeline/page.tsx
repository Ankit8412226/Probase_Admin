import Link from "next/link";
import { UserRoundSearch, Shield, Bot, Flame, BarChart, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Lead Acquisition Pipeline - Probase Solutions",
  description: "Track lead pipelines, qualification levels, deal values, and leverage AI objections copilots to close service contracts faster.",
};

export default function LeadPipelinePage() {
  const points = [
    {
      icon: Bot,
      title: "AI Objections Co-Pilot",
      desc: "Instant deal advice. The co-pilot reads client specifics, rates qualification chances, predicts common hurdles, and drafts custom sales response templates."
    },
    {
      icon: Flame,
      title: "Real-time Deal Values",
      desc: "Assign projected values to pipelines. Watch total pipeline metrics update live across sales agents, providing executive visibility."
    },
    {
      icon: UserRoundSearch,
      title: "Convert to Client Record",
      desc: "Convert a warm lead with one click. This moves them into the Active Client Directory, creating corresponding project profiles automatically."
    },
    {
      icon: BarChart,
      title: "Lead Campaign tracking",
      desc: "Trace leads back to their custom WhatsApp campaign sources. Understand which broadcasts generated high-value client engagements."
    }
  ];

  return (
    <div className="py-20 max-w-5xl mx-auto px-6">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-medium mb-4">
          <UserRoundSearch size={13} />
          <span>Outbound Conversion</span>
        </span>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mt-2">
          Close agencies contracts with an AI objections co-pilot.
        </h1>
        <p className="mt-6 text-base text-slate-400 leading-relaxed">
          Loose tracking leads to leaking lead conversions. Probase Solutions bundles sales pipelines directly with your CRM directory. Combined with built-in AI deal briefings, your sales representatives can qualify customer budgets and dispatch structured proposals instantly.
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
          <h2 className="text-2xl font-bold text-white tracking-tight">Supercharge your pipeline today.</h2>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">
            Organize lead channels and trigger AI Objections reports. Setup your tenant workspace in minutes.
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
