"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Sparkles, Shield, HelpCircle, ArrowRight } from "lucide-react";

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      name: "Starter",
      description: "Great for single operators & local startups",
      priceMonthly: 999,
      priceYearly: 9590,
      features: [
        "1 Linked WhatsApp Device",
        "Up to 150 Leads & Clients",
        "Basic Proposal Generation",
        "Standard Password Attendance",
        "Basic Campaign Analytics",
        "Email Support",
      ],
      popular: false,
    },
    {
      name: "Professional",
      description: "The ultimate engine for scaling agencies",
      priceMonthly: 1999,
      priceYearly: 19190,
      features: [
        "3 Linked WhatsApp Devices",
        "Unlimited Leads & Clients",
        "AI Objections Sales Co-Pilot",
        "Webcam Face-ID Attendance check",
        "Automatic Monthly Payroll Engine",
        "Bulk campaigns with variables",
        "Stock Marketing Assets Picker",
        "Priority Support (24/7)",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      description: "Custom capabilities for larger organizations",
      priceMonthly: 2999,
      priceYearly: 28790,
      features: [
        "Unlimited WhatsApp Devices",
        "Dedicated Gateway Instance",
        "Custom Playbook RAG integration",
        "White-labeled Client proposals",
        "Dedicated Account Director",
        "SLA guaranteed uptime",
      ],
      popular: false,
    },
  ];

  return (
    <div className="py-20 w-full px-6">
      {/* Header */}
      <div className="text-center w-full mb-16">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-medium mb-4">
          <Sparkles size={13} />
          <span>Flexible Plans</span>
        </span>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mt-2">
          Pricing built for transparency.
        </h1>
        <p className="mt-6 text-base text-slate-400 leading-relaxed">
          Choose the workspace tier that maps onto your agency headcount. Save 20% on yearly billing cycles. All plans start with a 15-day free trial.
        </p>

        {/* Toggle */}
        <div className="mt-8 inline-flex items-center gap-1 bg-slate-900 border border-slate-800 p-1.5 rounded-xl">
          <button
            onClick={() => setBillingPeriod("monthly")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              billingPeriod === "monthly"
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingPeriod("yearly")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              billingPeriod === "yearly"
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Yearly Billing
            <span className="bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">Save 20%</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid lg:grid-cols-3 gap-8 items-stretch w-full">
        {plans.map((plan, i) => (
          <div 
            key={i} 
            className={`rounded-2xl border flex flex-col justify-between p-8 relative transition-all duration-300 ${
              plan.popular 
                ? "border-indigo-600 bg-slate-900/10 shadow-xl shadow-indigo-600/5 hover:scale-[1.01]" 
                : "border-slate-900 bg-slate-900/5 hover:border-slate-800"
            }`}
          >
            {plan.popular && (
              <span className="absolute top-0 right-8 -translate-y-1/2 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </span>
            )}
            
            <div>
              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              <p className="mt-2 text-xs text-slate-400">{plan.description}</p>
              
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">
                  ₹{(billingPeriod === "monthly" ? plan.priceMonthly : Math.round(plan.priceYearly / 12)).toLocaleString("en-IN")}
                </span>
                <span className="text-xs text-slate-500">/ month</span>
              </div>
              
              <div className="text-[10px] text-slate-500 mt-1">
                {billingPeriod === "yearly" ? `Billed ₹${plan.priceYearly.toLocaleString("en-IN")} annually` : "Billed monthly"}
              </div>

              <hr className="my-6 border-slate-900" />
              
              <ul className="space-y-4">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-350">
                    <CheckCircle2 size={15} className="text-indigo-400 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link href="/signup" className="w-full">
              <button 
                className={`w-full mt-8 py-3 rounded-xl font-bold text-xs transition active:scale-95 ${
                  plan.popular 
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20" 
                    : "bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white"
                }`}
              >
                Start 15-Day Free Trial
              </button>
            </Link>
          </div>
        ))}
      </div>

      {/* FAQs details redirection link */}
      <div className="text-center mt-20">
        <p className="text-xs text-slate-500">
          Have more questions? Read our dedicated{" "}
          <Link href="/faqs" className="text-indigo-400 font-bold hover:underline">
            FAQs Page
          </Link>
          {" "}or connect with security in our{" "}
          <Link href="/security" className="text-indigo-400 font-bold hover:underline">
            Security Details Page
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
