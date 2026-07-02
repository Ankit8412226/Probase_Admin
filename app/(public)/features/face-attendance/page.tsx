import Link from "next/link";
import { Clock, ShieldCheck, Eye, RefreshCw, UserCheck, ShieldAlert, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Face Attendance Biometrics - Probase Solutions",
  description: "Webcam Face-ID check-in roster. Process facial descriptors securely in the browser using neural structures for zero buddy-punching.",
};

export default function FaceAttendancePage() {
  const steps = [
    {
      icon: Eye,
      title: "Contactless Biometric Scan",
      desc: "Employees simply step in front of any tablet or laptop webcam. The browser runs facial landmark analysis to identify structures instantly."
    },
    {
      icon: ShieldCheck,
      title: "Descriptor Extraction",
      desc: "Using client-side face models, the feed parses 128 distinct facial descriptors. No raw video streams or photo files are ever sent to our servers."
    },
    {
      icon: UserCheck,
      title: "Roster Match & Verify",
      desc: "Descriptors are securely matched against the tenant organization database. If verified, late status and clock-in logs update automatically."
    },
    {
      icon: RefreshCw,
      title: "Automated Payroll sync",
      desc: "Check-in logs sync with shifting thresholds. Late check-ins calculate payroll deductions in real-time, removing manual excel spreadsheets."
    }
  ];

  return (
    <div className="py-20 max-w-5xl mx-auto px-6">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-medium mb-4">
          <Clock size={13} />
          <span>Biometric HR Compliance</span>
        </span>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mt-2">
          Contactless Webcam Face-ID attendance check-in.
        </h1>
        <p className="mt-6 text-base text-slate-400 leading-relaxed">
          Standard attendance apps are vulnerable to buddy-punching or require expensive dedicated hardware. Probase Solutions implements browser-based face verification models to verify check-ins on standard devices, securing team compliance instantly.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-12">
        {steps.map((item, idx) => {
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
          <h2 className="text-2xl font-bold text-white tracking-tight">Upgrade employee compliance.</h2>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">
            Protect your payroll rosters from buddy-punching. Professional plans include full face biometric models and webcam pairing options.
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
