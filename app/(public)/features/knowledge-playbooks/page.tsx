import Link from "next/link";
import { BookOpen, Search, Shield, Files, Cpu, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Knowledge & Operations Playbooks - Probase Solutions",
  description: "Maintain a secure repository for sales playbooks, team SOPs, training manuals, and RAG-ready context indexes.",
};

export default function KnowledgePlaybooksPage() {
  const points = [
    {
      icon: Files,
      title: "Shared Team SOP Directory",
      desc: "Upload training files, sales scripts, and operational guidelines. Keep standard playbooks accessible to sales agents and managers."
    },
    {
      icon: Search,
      title: "Context-Indexed Queries",
      desc: "Perform sub-second searches across uploaded training indexes. Retrieve product details and script suggestions on client calls."
    },
    {
      icon: Cpu,
      title: "AI RAG Context Integration",
      desc: "Integrate playbooks directly with the AI Objections Co-Pilot. RAG logic references playbooks context to suggest accurate sales briefs."
    },
    {
      icon: Shield,
      title: "Isolated Tenant Storage",
      desc: "Keep playbooks restricted. Your files are encrypted and partitioned, ensuring intellectual property never leaks to other accounts."
    }
  ];

  return (
    <div className="py-20 max-w-5xl mx-auto px-6">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-medium mb-4">
          <BookOpen size={13} />
          <span>Intellectual Repository</span>
        </span>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mt-2">
          Centralized team playbooks and RAG operations guidelines.
        </h1>
        <p className="mt-6 text-base text-slate-400 leading-relaxed">
          Forcing sales and delivery teams to dig through folders for scripts slow down response times. Probase Solutions catalogs your training playbooks in a structured directory, enabling dynamic AI objections retrieval during warm outreach.
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
          <h2 className="text-2xl font-bold text-white tracking-tight">Consolidate team know-how.</h2>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">
            Train agents using unified playbooks and Objection coping models. Setup your tenant workspace to get started.
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
