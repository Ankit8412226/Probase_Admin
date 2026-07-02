import { Shield, Users, Zap, Building, Lock } from "lucide-react";

export const metadata = {
  title: "About Probase Solutions",
  description: "Learn about the mission, capabilities, and tenant security structure of Probase Solutions.",
};

export default function AboutPage() {
  const coreValues = [
    {
      icon: Building,
      title: "Strict Tenant Isolation",
      desc: "Every organization on Probase gets a logically partitioned database schema, ensuring your sensitive customer data, salaries, and lead details are completely separated and secure.",
    },
    {
      icon: Lock,
      title: "Zero-Trust Biometrics",
      desc: "Our webcam Face-ID rosters run fully in the browser client using secure facial descriptors. No raw video feed ever reaches our servers, keeping employee privacy safe.",
    },
    {
      icon: Zap,
      title: "Optimized Integrations",
      desc: "We leverage browser WebSockets to interact directly with standard WhatsApp instances. This bypasses high API rates, providing unlimited broadcasting for free.",
    },
    {
      icon: Shield,
      title: "JWT Cookie Security",
      desc: "Dashboard access controls rely on HTTP-only cryptographically signed tokens. Protection is built directly into Next.js middleware layers for maximum resilience.",
    },
  ];

  return (
    <div className="py-20 max-w-5xl mx-auto px-6">
      {/* Header section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-indigo-400">
          Our Mission
        </span>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mt-4">
          Operate your services agency with zero friction.
        </h1>
        <p className="mt-6 text-base text-slate-400 leading-relaxed">
          Probase Solutions was founded to solve a major pain point for IT services teams, marketing agencies, and operations networks: the sheer fragmentation of operational tools. By combining lead management, customer billing, shifts tracking, face check-ins, and bulk communications, we provide a unified cockpit for growth.
        </p>
      </div>

      {/* Grid values */}
      <div className="grid gap-6 md:grid-cols-2 mt-12">
        {coreValues.map((value, idx) => {
          const Icon = value.icon;
          return (
            <div
              key={idx}
              className="border border-slate-900 bg-slate-900/10 p-8 rounded-2xl hover:border-slate-800 transition duration-300 group"
            >
              <div className="h-10 w-10 bg-indigo-600/10 text-indigo-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Icon size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">{value.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{value.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Philosophy section */}
      <div className="mt-20 border border-slate-900 bg-slate-950 p-8 rounded-3xl relative overflow-hidden text-left max-w-4xl mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
        <h2 className="text-2xl font-bold text-white relative z-10">Our Commitment to Quality</h2>
        <p className="text-xs text-slate-400 leading-relaxed mt-4 relative z-10">
          We believe operational software shouldn't look or feel boring. That's why we maintain a high standard of visual excellence. From smooth sub-millisecond route transitions to polished dashboards and real-time biometric analysis logs, Probase Solutions is built to feel state-of-the-art.
        </p>
        <div className="flex gap-8 mt-6 text-xs text-indigo-400 font-mono relative z-10">
          <div>
            <span className="block text-xl font-bold text-white font-sans">99.9%</span>
            Tenant Uptime SLA
          </div>
          <div>
            <span className="block text-xl font-bold text-white font-sans">100%</span>
            Client Isolation
          </div>
          <div>
            <span className="block text-xl font-bold text-white font-sans">10M+</span>
            Messages Delivered
          </div>
        </div>
      </div>
    </div>
  );
}
