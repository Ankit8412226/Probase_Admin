export const metadata = {
  title: "Privacy Policy - Probase Solutions",
  description: "Learn how Probase Solutions protects your workspace data, database logs, and face biometric signatures.",
};

export default function PrivacyPage() {
  const policies = [
    {
      title: "Data Partitioning & Architecture",
      text: "Our multi-tenant database uses rigid row-level security and tenant-filtering indexes. No employee, client, or lead data can leak across workspaces. Your organization's details are strictly isolated in a private context, accessible only to authorized dashboard sessions.",
    },
    {
      title: "Biometric Data & Face Recognition",
      text: "The webcam attendance system processes camera images directly on the user's local device. Using client-side neural nets, we extract a 128-dimensional floating point descriptor. This numeric descriptor is stored in our secure database for comparison during clock-in. We do not store, stream, or transmit raw camera video files.",
    },
    {
      title: "WhatsApp Tokenization & Storage",
      text: "To facilitate bulk broadcast capabilities, we store QR pairing authentication tokens. These credentials are fully encrypted and kept in your workspace's database container. They are never shared, sold, or exposed to third-party integrations.",
    },
    {
      title: "Payment Processing & Card Security",
      text: "All payment checkouts are encrypted over secure channels. Simulated payment checkouts are logged locally within your private organization dashboard and never communicated to outside entities.",
    },
  ];

  return (
    <div className="py-20 max-w-4xl mx-auto px-6">
      {/* Header */}
      <div className="border-b border-slate-900 pb-10 mb-12">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-indigo-400">
          Privacy Policy
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-white mt-3">Data Protection Policy</h1>
        <p className="mt-2 text-xs text-slate-500">Last updated: July 2, 2026</p>
      </div>

      {/* Intro text */}
      <p className="text-sm text-slate-400 leading-relaxed mb-10">
        At Probase Solutions, we respect your team's privacy. This document explains how we handle database storage, lead lists, salary rosters, and webcam face signatures. We stand by strict enterprise security practices.
      </p>

      {/* Grid panels */}
      <div className="grid gap-6 md:grid-cols-2">
        {policies.map((policy, idx) => (
          <div key={idx} className="border border-slate-900 bg-slate-950 p-6 rounded-2xl">
            <h3 className="text-sm font-bold text-white mb-3">{policy.title}</h3>
            <p className="text-xs text-slate-450 leading-relaxed">{policy.text}</p>
          </div>
        ))}
      </div>

      {/* Rights banner */}
      <div className="mt-12 border border-slate-900 bg-slate-900/10 p-8 rounded-2xl text-xs text-slate-400 leading-relaxed">
        <h4 className="font-semibold text-white mb-2">Your Privacy Controls</h4>
        <p>
          Workspace administrators have full access to view, update, or purge all data points (leads, employees, attendances, and linked sessions). Under GDPR and CCPA, users can request full deletion of their records directly by submitting an inquiry via the Support Contact form.
        </p>
      </div>
    </div>
  );
}
