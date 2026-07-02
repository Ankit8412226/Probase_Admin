import Link from "next/link";
import { ShieldAlert, Server, Lock, Fingerprint, Activity, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Security & Data Partitioning - Probase Solutions",
  description: "Learn about tenant isolation, database logical separation, biometrics encryption, and socket security protocols.",
};

export default function SecurityPage() {
  const blocks = [
    {
      icon: Server,
      title: "Tenant Database Isolation",
      desc: "Every workspace operates in a logical partition. Database indexes enforce row-level checks against organization identifiers, making context leakage impossible."
    },
    {
      icon: Fingerprint,
      title: "Client-Side Biometrics Parsing",
      desc: "No video feeds are streamed to external endpoints. The face recognition neural network matches mathematical vectors directly in the local browser."
    },
    {
      icon: Lock,
      title: "Encrypted Socket Storage",
      desc: "Paired WhatsApp session codes and QR tokens are saved in organization database containers using military-grade encryption keys."
    },
    {
      icon: Activity,
      title: "JWT HTTP-Only Cookies",
      desc: "Dashboard navigation relies on signed JWT payloads stored in secure HTTP-only cookies, stopping cross-site scripting (XSS) risks."
    }
  ];

  return (
    <div className="py-20 w-full px-6">
      {/* Header */}
      <div className="text-center w-full mb-16">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-medium mb-4">
          <ShieldAlert size={13} />
          <span>Security Compliance</span>
        </span>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mt-2">
          Strict database isolation and encrypted biometrics.
        </h1>
        <p className="mt-6 text-base text-slate-400 leading-relaxed">
          Operational software must respect corporate security parameters. Probase Solutions builds logical barriers around active client budgets, salary releases, and contractor profiles to maintain complete tenant privacy.
        </p>
      </div>

      {/* Grid */}
      <div className="grid gap-6 md:grid-cols-2 mt-12">
        {blocks.map((block, idx) => {
          const Icon = block.icon;
          return (
            <div key={idx} className="border border-slate-900 bg-slate-950 p-8 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 bg-indigo-650/15 text-indigo-400 rounded-xl flex items-center justify-center mb-6">
                  <Icon size={18} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{block.title}</h3>
                <p className="text-xs text-slate-450 leading-relaxed">{block.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* GDPR compliance details */}
      <div className="mt-20 border border-slate-900 bg-slate-900/10 rounded-3xl p-8 w-full text-left space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">GDPR & CCPA Compatibility</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Because biometrics are computed locally and stored as encrypted numeric arrays, employee identities are shielded from vector tracing. Workspace administrators have the ability to purge all organization indices, contractor profiles, and session hashes on request, fulfilling the corporate right-to-be-forgotten.
        </p>
      </div>
    </div>
  );
}
