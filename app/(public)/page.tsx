"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowRight, Sparkles, MessageSquare, DollarSign, Clock, HelpCircle, 
  X, CreditCard, Landmark, QrCode, ArrowUpRight, CheckCircle2, ChevronDown, Bot, Layers 
} from "lucide-react";
import { FieldGroup, FieldLabel, TextInput } from "@/components/forms/form-primitives";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [coupon, setCoupon] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  
  // Checkout simulator states
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "netbanking">("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [upiId, setUpiId] = useState("");
  const [bank, setBank] = useState("sbi");
  const [checkoutStep, setCheckoutStep] = useState<"form" | "processing" | "success">("form");
  const [invoiceNumber, setInvoiceNumber] = useState("");

  // FAQ states
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({});

  // Pricing definitions
  const plans = [
    {
      name: "Starter",
      description: "Great for single operators & local startups",
      priceMonthly: 1499,
      priceYearly: 14390,
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
      priceMonthly: 3999,
      priceYearly: 38390,
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
      priceMonthly: 9999,
      priceYearly: 95990,
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

  const faqs = [
    {
      q: "Do I need a WhatsApp Business API account to use Probase?",
      a: "No! Probase utilizes the secure WhatsApp Web protocol. You can link your standard personal or business WhatsApp number in seconds just by scanning a QR code, saving you hundreds of dollars in Meta platform conversation costs."
    },
    {
      q: "How does the Webcam Face-ID Attendance check work?",
      a: "Probase features an in-browser face verification engine. Employees check in via a webcam feed on any terminal device, matching facial descriptors securely against database records for zero buddy-punching."
    },
    {
      q: "Can I cancel or change my plan at any time?",
      a: "Yes, you can upgrade, downgrade, or cancel your subscription at any time. When upgrading or changing periods, your balance will be pro-rated automatically."
    },
    {
      q: "Is my organization's data safe and isolated?",
      a: "Absolutely. Probase is built with a strictly partitioned Multi-Tenant database architecture. Your leads, payroll, clients, and WhatsApp logs are logically separated and indexed, ensuring full privacy."
    }
  ];

  const toggleFaq = (index: number) => {
    setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleApplyCoupon = () => {
    setCouponError("");
    setCouponSuccess("");
    if (coupon.toUpperCase() === "PROBASE20") {
      setDiscountPercent(20);
      setCouponSuccess("Coupon applied! 20% Discount saved.");
    } else {
      setCouponError("Invalid coupon code. Try 'PROBASE20'.");
    }
  };

  const handleOpenCheckout = (plan: any) => {
    setSelectedPlan(plan);
    setCheckoutStep("form");
    setInvoiceNumber(`INV-SUB-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStep("processing");
    setTimeout(() => {
      setCheckoutStep("success");
    }, 2000);
  };

  const getPrice = (plan: any) => {
    const basePrice = billingPeriod === "monthly" ? plan.priceMonthly : plan.priceYearly;
    if (discountPercent > 0) {
      return Math.round(basePrice * (1 - discountPercent / 100));
    }
    return basePrice;
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative z-10 w-full px-6 pt-20 pb-28 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-indigo-400 mb-8 animate-fade-in">
          <Sparkles size={13} className="fill-indigo-400" />
          <span>Knowledge-Powered Sales CRM + Operations Suite</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
          Close more deals with <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-amber-400 bg-clip-text text-transparent">Knowledge-Driven Sales Pipelines.</span>
        </h1>
        
        <p className="mt-8 text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Connect your organization playbooks directly to active lead pipelines, direct WhatsApp CRM channels, and automated PDF proposals. Address objections instantly and close deals faster.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/signup">
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-8 py-4 rounded-xl flex items-center gap-2 shadow-xl shadow-indigo-600/30 transition-all hover:-translate-y-0.5 active:scale-95">
              Start 15-Day Free Trial
              <ArrowRight size={16} />
            </button>
          </Link>
          <Link href="/login">
            <button className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-sm px-8 py-4 rounded-xl flex items-center gap-1 transition active:scale-95">
              Explore Demo Mode
            </button>
          </Link>
        </div>

        {/* Dashboard Visual Mockup */}
        <div className="mt-20 relative rounded-2xl border border-slate-800 bg-slate-950/40 p-4 shadow-2xl w-full group">
          <div className="absolute inset-0 bg-indigo-500/5 rounded-2xl blur-2xl opacity-50 group-hover:opacity-80 transition duration-700" />
          <div className="relative rounded-xl border border-slate-800 overflow-hidden bg-slate-900/60 aspect-[16/9] flex flex-col">
            {/* Top window controls */}
            <div className="h-10 bg-slate-950/80 border-b border-slate-800/80 px-4 flex items-center gap-2 justify-between">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="text-[10px] text-slate-500 font-mono">probase-solutions.com/dashboard/leads</div>
              <div className="w-12" />
            </div>
            
            {/* Simulated app interface */}
            <div className="flex-1 grid grid-cols-[180px_1fr] text-left">
              {/* Sidebar layout */}
              <div className="border-r border-slate-800/80 bg-slate-950/20 p-4 space-y-6">
                <div className="h-4 w-24 bg-slate-800 rounded" />
                <div className="space-y-3">
                  <div className="h-3 w-32 bg-slate-800 rounded" />
                  <div className="h-3 w-28 bg-slate-800 rounded" />
                  <div className="h-3 w-36 bg-slate-800 rounded" />
                  <div className="h-3 w-24 bg-slate-800 rounded" />
                </div>
              </div>
              
              {/* Main content pane */}
              <div className="p-6 space-y-6 bg-slate-900/30">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="h-5 w-32 bg-slate-800 rounded" />
                    <div className="h-3 w-48 bg-slate-800/60 rounded" />
                  </div>
                  <div className="h-8 w-24 bg-indigo-600/30 border border-indigo-500/20 rounded-xl" />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="border border-slate-800/80 bg-slate-950/40 p-4 rounded-xl space-y-3">
                    <div className="h-3 w-16 bg-slate-800 rounded" />
                    <div className="h-6 w-20 bg-slate-700 rounded" />
                  </div>
                  <div className="border border-slate-800/80 bg-slate-950/40 p-4 rounded-xl space-y-3">
                    <div className="h-3 w-16 bg-slate-800 rounded" />
                    <div className="h-6 w-12 bg-slate-700 rounded" />
                  </div>
                  <div className="border border-slate-800/80 bg-slate-950/40 p-4 rounded-xl space-y-3">
                    <div className="h-3 w-24 bg-slate-800 rounded" />
                    <div className="h-6 w-24 bg-slate-700 rounded" />
                  </div>
                </div>

                <div className="border border-slate-800/80 bg-slate-950/40 p-4 rounded-xl space-y-4">
                  <div className="h-4 w-36 bg-slate-800 rounded" />
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-slate-800/50 rounded" />
                    <div className="h-3 w-[90%] bg-slate-800/50 rounded" />
                    <div className="h-3 w-[95%] bg-slate-800/50 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t border-slate-900 bg-slate-950 py-24 relative z-10">
        <div className="w-full px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
              Close deals faster. Automate sales pipelines.
            </h2>
            <p className="mt-4 text-slate-400">
              Link customer conversations, company knowledge playbooks, and proposals in one unified hub.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-8 space-y-6 hover:border-slate-800 transition duration-300">
              <div className="h-12 w-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                <Bot size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">Knowledge-Base Sales Copilot</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Address complex customer objections instantly. The AI reads uploaded product files, training SOPs, and pricing playbooks to generate qualification scores, suggest response templates, and qualification parameters.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-8 space-y-6 hover:border-slate-800 transition duration-300">
              <div className="h-12 w-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
                <MessageSquare size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">1-Click Proposal PDF Builder</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Converts leads into active client records. Generate tax-calculated milestone agreements, PDF invoice proposals, and digital collection templates based on your playbook structures with one click.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-8 space-y-6 hover:border-slate-800 transition duration-300">
              <div className="h-12 w-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400">
                <Clock size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">Free Bulk WhatsApp CRM</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Pair direct numbers via QR codes. Send personalized campaigns with dynamic contact variables (`name`, `company`) using direct web socket scripts, avoiding high Meta API templates.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-8 space-y-6 hover:border-slate-800 transition duration-300">
              <div className="h-12 w-12 bg-violet-500/10 rounded-xl flex items-center justify-center text-violet-400">
                <DollarSign size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">Pipeline and Quotas Cockpit</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Track active deal sizes, monthly conversion rates, and representative quotas. Monitor partial collections and sync completed projects to automatic contractor payroll engines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="border-t border-slate-900 bg-slate-900/10 py-24 relative z-10">
        <div className="w-full px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
              Pricing built for transparency.
            </h2>
            <p className="mt-4 text-slate-400">
              Choose the speed that matches your business. Save 20% on yearly billing cycles.
            </p>

            {/* Billing Toggle */}
            <div className="mt-8 inline-flex items-center gap-1 bg-slate-950 border border-slate-900 p-1.5 rounded-xl">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                  billingPeriod === "monthly"
                    ? "bg-slate-900 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingPeriod("yearly")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                  billingPeriod === "yearly"
                    ? "bg-slate-900 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Yearly Billing
                <span className="bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-stretch w-full">
            {plans.map((plan, i) => (
              <div 
                key={i} 
                className={`rounded-2xl border flex flex-col justify-between p-8 relative transition-all duration-300 ${
                  plan.popular 
                    ? "border-indigo-600 bg-slate-950 shadow-xl shadow-indigo-600/5 hover:scale-[1.01]" 
                    : "border-slate-900 bg-slate-950/40 hover:border-slate-800"
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
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <CheckCircle2 size={15} className="text-indigo-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={() => handleOpenCheckout(plan)}
                  className={`w-full mt-8 py-3 rounded-xl font-bold text-xs transition active:scale-95 ${
                    plan.popular 
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20" 
                      : "bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white"
                  }`}
                >
                  Start {plan.name} Free Trial
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faqs" className="border-t border-slate-900 bg-slate-950 py-24 relative z-10">
        <div className="w-full px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
              Got Questions?
            </h2>
            <p className="mt-4 text-slate-400">
              Everything you need to know about setting up workspaces.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="border border-slate-900 bg-slate-950 rounded-2xl overflow-hidden transition hover:border-slate-800"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-sm text-white focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <ChevronDown 
                    size={16} 
                    className={`text-slate-400 transition-transform duration-300 ${faqOpen[idx] ? "rotate-180 text-white" : ""}`} 
                  />
                </button>
                
                {faqOpen[idx] && (
                  <div className="px-6 pb-6 text-xs text-slate-400 leading-relaxed border-t border-slate-900/60 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Checkout Simulator Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-scale-in">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
              <div>
                <h3 className="font-bold text-base text-white">Checkout Workspace Subscription</h3>
                <p className="text-xs text-slate-500">Simulated Payment Mode • Production Ready</p>
              </div>
              <button 
                onClick={() => setSelectedPlan(null)}
                className="p-2 text-slate-400 hover:text-white border border-slate-800 rounded-full hover:bg-slate-800 transition"
              >
                <X size={16} />
              </button>
            </div>

            {checkoutStep === "form" && (
              <form onSubmit={handleCheckoutSubmit} className="grid md:grid-cols-[240px_1fr] h-[480px]">
                {/* Side details */}
                <div className="bg-slate-950/30 border-r border-slate-800 p-6 flex flex-col justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Selected Plan</span>
                    <h4 className="text-lg font-bold text-white mt-1">{selectedPlan.name} Plan</h4>
                    <p className="text-slate-400 mt-1">{selectedPlan.description}</p>
                    
                    <hr className="my-4 border-slate-800" />
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Subtotal:</span>
                        <span className="text-slate-300">₹{(billingPeriod === "monthly" ? selectedPlan.priceMonthly : selectedPlan.priceYearly).toLocaleString("en-IN")}</span>
                      </div>
                      
                      {discountPercent > 0 && (
                        <div className="flex justify-between text-emerald-400">
                          <span>Discount (20%):</span>
                          <span>-₹{(Math.round((billingPeriod === "monthly" ? selectedPlan.priceMonthly : selectedPlan.priceYearly) * 0.2)).toLocaleString("en-IN")}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between">
                        <span className="text-slate-500">Period:</span>
                        <span className="text-slate-300 uppercase font-semibold">{billingPeriod}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="border-t border-slate-800 pt-4 flex justify-between items-baseline">
                      <span className="text-sm text-slate-400">Total:</span>
                      <span className="text-2xl font-bold text-white">₹{getPrice(selectedPlan).toLocaleString("en-IN")}</span>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-1">Includes all simulated database integrations.</p>
                  </div>
                </div>

                {/* Form fields */}
                <div className="p-6 overflow-y-auto space-y-5 text-left">
                  {/* Coupon section */}
                  <div className="space-y-2">
                    <FieldLabel htmlFor="coupon-input" className="text-slate-300">Discount Coupon</FieldLabel>
                    <div className="flex gap-2">
                      <TextInput 
                        id="coupon-input"
                        placeholder="Try: PROBASE20" 
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value)}
                        className="bg-slate-950 border-slate-800 focus:border-slate-700 text-white placeholder-slate-700"
                      />
                      <button 
                        type="button" 
                        onClick={handleApplyCoupon}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-4 rounded-xl text-xs font-semibold border border-slate-800"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && <p className="text-[10px] text-rose-500 font-semibold">{couponError}</p>}
                    {couponSuccess && <p className="text-[10px] text-emerald-400 font-semibold">{couponSuccess}</p>}
                  </div>

                  {/* Payment Mode Selector tabs */}
                  <div className="space-y-2">
                    <FieldLabel htmlFor="payment-mode-tabs" className="text-slate-300">Choose Payment Mode</FieldLabel>
                    <div id="payment-mode-tabs" className="grid grid-cols-3 gap-2 bg-slate-950 border border-slate-800 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("card")}
                        className={`py-2 text-[10px] font-bold rounded-lg transition flex items-center justify-center gap-1 ${
                          paymentMethod === "card" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <CreditCard size={12} />
                        Card
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("upi")}
                        className={`py-2 text-[10px] font-bold rounded-lg transition flex items-center justify-center gap-1 ${
                          paymentMethod === "upi" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <QrCode size={12} />
                        UPI
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("netbanking")}
                        className={`py-2 text-[10px] font-bold rounded-lg transition flex items-center justify-center gap-1 ${
                          paymentMethod === "netbanking" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <Landmark size={12} />
                        Netbanking
                      </button>
                    </div>
                  </div>

                  {/* Card fields */}
                  {paymentMethod === "card" && (
                    <div className="space-y-4">
                      <FieldGroup>
                        <FieldLabel htmlFor="card-num" className="text-slate-300">Card Number</FieldLabel>
                        <TextInput 
                          id="card-num"
                          placeholder="4111 2222 3333 4444"
                          maxLength={19}
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value.replace(/[^0-9\s]/g, ""))}
                          required
                          className="bg-slate-950 border-slate-800 text-white placeholder-slate-700"
                        />
                      </FieldGroup>
                      <div className="grid grid-cols-2 gap-4">
                        <FieldGroup>
                          <FieldLabel htmlFor="card-exp" className="text-slate-300">Expiry (MM/YY)</FieldLabel>
                          <TextInput 
                            id="card-exp"
                            placeholder="12/28"
                            maxLength={5}
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            required
                            className="bg-slate-950 border-slate-800 text-white placeholder-slate-700"
                          />
                        </FieldGroup>
                        <FieldGroup>
                          <FieldLabel htmlFor="card-cvc" className="text-slate-300">CVC</FieldLabel>
                          <TextInput 
                            id="card-cvc"
                            placeholder="123"
                            maxLength={3}
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            required
                            className="bg-slate-950 border-slate-800 text-white placeholder-slate-700"
                          />
                        </FieldGroup>
                      </div>
                    </div>
                  )}

                  {/* UPI fields */}
                  {paymentMethod === "upi" && (
                    <div className="space-y-4">
                      <div className="border border-dashed border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center bg-slate-950/20">
                        <div className="p-3 bg-white rounded-xl mb-2">
                          <QrCode size={100} className="text-slate-950" />
                        </div>
                        <p className="text-[10px] text-slate-500">Scan QR Code using GPay, PhonePe, or Paytm</p>
                      </div>
                      <FieldGroup>
                        <FieldLabel htmlFor="upi-vpa" className="text-slate-300">Or enter UPI ID / VPA</FieldLabel>
                        <TextInput 
                          id="upi-vpa"
                          placeholder="username@okaxis"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          required
                          className="bg-slate-950 border-slate-800 text-white placeholder-slate-700"
                        />
                      </FieldGroup>
                    </div>
                  )}

                  {/* Netbanking fields */}
                  {paymentMethod === "netbanking" && (
                    <FieldGroup>
                      <FieldLabel htmlFor="nb-bank" className="text-slate-300">Select Bank</FieldLabel>
                      <select 
                        id="nb-bank"
                        value={bank}
                        onChange={(e) => setBank(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                      >
                        <option value="sbi">State Bank of India</option>
                        <option value="hdfc">HDFC Bank</option>
                        <option value="icici">ICICI Bank</option>
                        <option value="axis">Axis Bank</option>
                        <option value="pnb">Punjab National Bank</option>
                      </select>
                    </FieldGroup>
                  )}

                  <div className="pt-2">
                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3">
                      Complete Payment (Start 15-Day Trial)
                      <ArrowRight size={14} />
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {checkoutStep === "processing" && (
              <div className="h-[480px] flex flex-col items-center justify-center p-8 space-y-4">
                <RefreshCw size={40} className="text-indigo-500 animate-spin" />
                <h4 className="font-semibold text-lg text-white">Processing Subscription...</h4>
                <p className="text-xs text-slate-500 max-w-sm text-center">We are communicating with simulated card processors to allocate your private tenant workspace.</p>
              </div>
            )}

            {checkoutStep === "success" && (
              <div className="h-[480px] flex flex-col justify-between p-8 text-center">
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                  <div className="h-16 w-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center animate-bounce">
                    <CheckCircle2 size={36} />
                  </div>
                  <h4 className="font-bold text-xl text-white">Payment Successful!</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Your {selectedPlan.name} plan is now active. Workspace directories and database tables are allocated.
                  </p>
                  
                  {/* Receipt Box */}
                  <div className="border border-slate-800 bg-slate-950/60 p-5 rounded-2xl w-full max-w-md text-left text-xs font-mono space-y-2 mt-4">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Invoice Ref:</span>
                      <span className="text-slate-300">{invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Plan Purchased:</span>
                      <span className="text-slate-300">{selectedPlan.name} ({billingPeriod})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Amount Paid:</span>
                      <span className="text-emerald-400 font-bold">₹{getPrice(selectedPlan).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Gateway Status:</span>
                      <span className="text-emerald-400">PAID / SUCCESS</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Timestamp:</span>
                      <span className="text-slate-400">{new Date().toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4 flex gap-4">
                  <button 
                    onClick={() => {
                      const printContent = `
                        PROBASE SOLUTIONS SUBSCRIPTION RECEIPT
                        --------------------------------------
                        Invoice Ref: ${invoiceNumber}
                        Plan Purchased: ${selectedPlan.name} (${billingPeriod})
                        Amount Paid: Rs. ${getPrice(selectedPlan)}
                        Status: SUCCESS
                        Timestamp: ${new Date().toLocaleString()}
                      `;
                      const blob = new Blob([printContent], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `${invoiceNumber}.txt`;
                      link.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition active:scale-95 border border-slate-800"
                  >
                    📥 Download Receipt
                  </button>
                  <Link href="/signup" className="flex-1">
                    <button 
                      onClick={() => setSelectedPlan(null)}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition active:scale-95 shadow-lg shadow-indigo-600/20"
                    >
                      Setup 15-Day Free Trial
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// Simple local fallback icon component
function RefreshCw(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
