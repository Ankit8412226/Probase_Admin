"use client";

import Link from "next/link";
import { Layers } from "lucide-react";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-900 bg-slate-950/80 py-16 relative z-10">
      <div className="w-full px-6 grid gap-10 md:grid-cols-5">
        
        {/* Brand Description Column */}
        <div className="space-y-4 md:col-span-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 bg-indigo-600 rounded flex items-center justify-center">
              <Layers className="text-white" size={14} />
            </div>
            <span className="font-bold text-base text-white tracking-tight">OmniPulse AI</span>
          </Link>
          <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
            Premium multi-tenant CRM + HR Operations suite built for high-efficiency IT services agencies. Contactless face attendance, isolated database engines, and automated workflows.
          </p>
          <p className="text-[11px] text-slate-600 font-mono">
            &copy; {currentYear} OmniPulse AI Private Limited. All rights reserved.
          </p>
        </div>

        {/* Column 1: Features */}
        <div>
          <h4 className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-indigo-400 mb-4 font-semibold">Features</h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li>
              <Link href="/features/whatsapp-crm" className="hover:text-white transition-colors">WhatsApp CRM</Link>
            </li>
            <li>
              <Link href="/features/face-attendance" className="hover:text-white transition-colors">Face Attendance</Link>
            </li>
            <li>
              <Link href="/features/payroll-engine" className="hover:text-white transition-colors">Payroll Engine</Link>
            </li>
            <li>
              <Link href="/features/lead-pipeline" className="hover:text-white transition-colors">Lead Pipeline</Link>
            </li>
            <li>
              <Link href="/features/invoice-billing" className="hover:text-white transition-colors">Invoicing Ledger</Link>
            </li>
            <li>
              <Link href="/features/shift-scheduling" className="hover:text-white transition-colors">Shift Roster</Link>
            </li>
            <li>
              <Link href="/features/knowledge-playbooks" className="hover:text-white transition-colors">RAG Playbooks</Link>
            </li>
            <li>
              <Link href="/features/targets-tracking" className="hover:text-white transition-colors">Targets & KPIs</Link>
            </li>
          </ul>
        </div>

        {/* Column 2: Solutions */}
        <div>
          <h4 className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-indigo-400 mb-4 font-semibold">Solutions</h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li>
              <Link href="/solutions/it-agencies" className="hover:text-white transition-colors">IT Agencies</Link>
            </li>
            <li>
              <Link href="/solutions/staffing-firms" className="hover:text-white transition-colors">Staffing Firms</Link>
            </li>
            <li>
              <Link href="/solutions/enterprise" className="hover:text-white transition-colors">Enterprise Isolated</Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Corporate Resources */}
        <div>
          <h4 className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-indigo-400 mb-4 font-semibold">Resources</h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li>
              <Link href="/pricing" className="hover:text-white transition-colors">Pricing Plans</Link>
            </li>
            <li>
              <Link href="/security" className="hover:text-white transition-colors">Security Details</Link>
            </li>
            <li>
              <Link href="/faqs" className="hover:text-white transition-colors">Frequently FAQs</Link>
            </li>
            <li>
              <Link href="/request-demo" className="hover:text-white transition-colors font-semibold text-indigo-400">Book Live Demo</Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </li>
          </ul>
        </div>

      </div>
    </footer>
  );
}
