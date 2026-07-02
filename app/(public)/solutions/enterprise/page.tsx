import Link from "next/link";
import { Layers, ShieldAlert, Cpu, Database, HardDrive, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Enterprise Database Isolation - Probase Solutions",
  description: "Dedicated database logical isolation, custom API integrations, and SLA-guaranteed uptime for large-scale operations.",
};

export default function EnterpriseSolutionPage() {
  const points = [
    {
      icon: Database,
      title: "Isolated Database Partitioning",
      desc: "Ensure absolute data isolation. Enterprise structures leverage strictly partitioned multi-tenant logical schemas, shielding client directories."
    },
    {
      icon: HardDrive,
      title: "Dedicated Gateway Instances",
      desc: "Avoid shared queues bottleneck. Allocate private API gateway endpoints to trigger WhatsApp broadcasts and biometric check-ins instantly."
    },
    {
      icon: Cpu,
      title: "Custom RAG Playbook sync",
      desc: "Train the AI objects copilots on custom training data. Feed proprietary SOP playbooks securely into private vector indices."
    },
    {
      icon: ShieldAlert,
      title: "SLA Guaranteed Availability",
      desc: "Sustain mission-critical workflows with a 99.9% uptime contract. Access dedicated support engineers for configurations help."
    }
  ];

  return (
    <div className="py-20 w-full px-6">
      <div className="text-center w-full mb-16">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-medium mb-4">
          <Layers size={13} />
          <span>Scale & Infrastructure</span>
        </span>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mt-2">
          Enterprise operations with rigid row-level database partitioning.
        </h1>
        <p className="mt-6 text-base text-slate-400 leading-relaxed">
          Large operations need strict guarantees that sensitive client list and salaries details are completely isolated. Probase Solutions bundles dedicated logical structures, private WhatsApp gateways, and vector training indices under a custom SLA contract.
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
          <h2 className="text-2xl font-bold text-white tracking-tight">Deploy dedicated tenant structures.</h2>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">
            Obtain private database containers, custom training integrations, and SLA coverage. Contact operations to request details.
          </p>
        </div>
        <Link href="/request-demo">
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-6 py-3.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 shrink-0 transition active:scale-95">
            Book Live Demo
            <ArrowRight size={14} />
          </button>
        </Link>
      </div>
    </div>
  );
}
