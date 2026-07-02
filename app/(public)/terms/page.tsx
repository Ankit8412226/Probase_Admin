export const metadata = {
  title: "Terms of Service - Probase Solutions",
  description: "Read the Terms of Service governing subscriptions, WhatsApp features, and biometric attendance checks.",
};

export default function TermsPage() {
  const sections = [
    {
      title: "1. Workspace Subscriptions",
      content:
        "Probase Solutions provides isolated multi-tenant workspaces. By creating an organization account, you agree to pay the fees corresponding to the selected plan (Starter, Professional, or Enterprise). Subscription renewals are handled automatically on monthly or annual cycles depending on your preference. Accounts may be cancelled at any time; however, billing balances will not be refunded for partial usage periods.",
    },
    {
      title: "2. Database Security & Tenant Isolation",
      content:
        "Each tenant workspace is strictly partitioned from others. You are solely responsible for all actions occurring under your workspace logins. Any attempt to exploit, bypass, or gain unauthorized access to another tenant's schema is a direct violation of these terms and will result in immediate permanent termination of service without refund.",
    },
    {
      title: "3. WhatsApp CRM Integrations",
      content:
        "Probase Solutions facilitates connection to standard WhatsApp profiles using standard web sockets. We do not provide WhatsApp phone numbers. You agree to use the bulk WhatsApp broadcast feature in full compliance with local anti-spam guidelines and WhatsApp's own Terms of Service. Probase Solutions is not responsible for any numbers blocked or restricted by Meta due to abusive broadcasting practices.",
    },
    {
      title: "4. Webcam Biometric Check-ins",
      content:
        "Our face attendance system is client-based. Facial structures are processed on the local machine to generate numeric facial descriptors, which are verified against database files. It is the responsibility of the organization administrator to obtain valid and legal consent from employees before enabling face recognition check-ins in accordance with regional privacy legislations.",
    },
    {
      title: "5. Limitation of Liability",
      content:
        "Probase Solutions is provided 'as is' without warranty of any kind. While we guarantee a 99.9% database availability SLA for Enterprise plans, we will not be held liable for any data loss, service interruptions, or business disruptions arising from WhatsApp platform changes or network issues.",
    },
  ];

  return (
    <div className="py-20 max-w-4xl mx-auto px-6">
      {/* Header */}
      <div className="border-b border-slate-900 pb-10 mb-12">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-indigo-400">
          Legal Agreement
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-white mt-3">Terms of Service</h1>
        <p className="mt-2 text-xs text-slate-500">Last updated: July 2, 2026</p>
      </div>

      {/* Structured sections */}
      <div className="space-y-10">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">{section.title}</h2>
            <p className="text-xs text-slate-455 leading-relaxed">{section.content}</p>
          </div>
        ))}
      </div>

      {/* Info warning */}
      <div className="mt-16 border border-amber-500/10 bg-amber-500/5 p-6 rounded-2xl">
        <h3 className="text-sm font-semibold text-amber-400">Important Operational Note</h3>
        <p className="text-[11px] text-slate-400 leading-relaxed mt-2">
          By signing up, you explicitly acknowledge that the payments in this application may run on simulated payment modules. You agree to use the platform only for legitimate administrative purposes and respect standard API connection limits.
        </p>
      </div>
    </div>
  );
}
