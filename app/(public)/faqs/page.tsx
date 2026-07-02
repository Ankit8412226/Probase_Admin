"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, HelpCircle, ArrowRight } from "lucide-react";

export default function FaqsPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  const faqItems = [
    {
      q: "Do I need a WhatsApp Business API account to use Probase?",
      a: "No! Probase Solutions interacts with the secure WhatsApp Web protocol via socket pairings. You can link any standard personal or business WhatsApp number in seconds just by scanning a QR code, avoiding Meta's platform charges."
    },
    {
      q: "How does the Webcam Face-ID Attendance check work?",
      a: "Probase features an in-browser face verification model. Employees stand in front of any camera, parsing facial landmarks to generate a 128-float descriptor. This descriptor is matched against database records securely for zero buddy-punching."
    },
    {
      q: "Is employee facial biometric data safe?",
      a: "Yes. Raw video streams or image files are never stored or sent to our servers. Only the mathematical vector descriptor is stored, which is encrypted and logical to your tenant schema. This aligns with GDPR and biometric consent frameworks."
    },
    {
      q: "What is database tenant isolation?",
      a: "We implement rigid row-level logical separation. Your leads, payroll logs, proposal contracts, and employee profiles are logical to your unique workspace ID, making it impossible for any other tenant to access or view your information."
    },
    {
      q: "How do late grace thresholds affect salary releases?",
      a: "You configure shift times and Grace timings (e.g. 15 minutes). If workers check in past the grace duration, the attendance model tags them as Late. Our payroll calculations automatically compute shift deductions on net releases."
    },
    {
      q: "Can I cancel my subscription or change plans?",
      a: "Yes. You can upgrade, downgrade, or cancel your workspace subscription at any time. Active balances are prorated automatically when modifying billing periods."
    }
  ];

  return (
    <div className="py-20 w-full px-6">
      {/* Header */}
      <div className="text-center w-full mb-16">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-medium mb-4">
          <HelpCircle size={13} />
          <span>Help Center</span>
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-white mt-2">Frequently Asked FAQs</h1>
        <p className="mt-4 text-xs text-slate-400">
          Everything you need to know about setting up workspaces, biometrics, and billing.
        </p>
      </div>

      {/* Accordion list */}
      <div className="space-y-4">
        {faqItems.map((item, idx) => (
          <div 
            key={idx} 
            className="border border-slate-900 bg-slate-950 rounded-2xl overflow-hidden transition hover:border-slate-800"
          >
            <button
              onClick={() => toggle(idx)}
              className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-sm text-white focus:outline-none"
            >
              <span>{item.q}</span>
              <ChevronDown 
                size={16} 
                className={`text-slate-400 transition-transform duration-300 ${openIdx === idx ? "rotate-180 text-white" : ""}`} 
              />
            </button>
            
            {openIdx === idx && (
              <div className="px-6 pb-6 text-xs text-slate-400 leading-relaxed border-t border-slate-900/60 pt-4 animate-fade-in">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer support prompt */}
      <div className="mt-16 text-center">
        <p className="text-xs text-slate-500">
          Can't find what you need? Ask our standby crew in the{" "}
          <Link href="/request-demo" className="text-indigo-400 font-bold hover:underline">
            Consultation Booking Console
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
