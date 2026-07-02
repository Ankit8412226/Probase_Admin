"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Layers, Menu, X, ChevronDown, MessageSquare, Clock, ShieldCheck, DollarSign, Building, Sparkles } from "lucide-react";

export function PublicHeader() {
  const pathname = usePathname();
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Dropdown states
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);

  // Check user session
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setUserLoggedIn(true);
          }
        }
      } catch (err) {}
    }
    checkSession();
  }, []);

  // Close menus on path changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setFeaturesOpen(false);
    setSolutionsOpen(false);
  }, [pathname]);

  const features = [
    { label: "WhatsApp CRM", href: "/features/whatsapp-crm", desc: "WebSocket direct broadcasts", icon: MessageSquare },
    { label: "Face Attendance", href: "/features/face-attendance", desc: "Biometric webcam verify", icon: Clock },
    { label: "Payroll Engine", href: "/features/payroll-engine", desc: "Shift deduction logs", icon: DollarSign },
    { label: "Invoicing & Billing", href: "/features/invoice-billing", desc: "PDF invoice collections", icon: ShieldCheck },
  ];

  const solutions = [
    { label: "IT Agencies", href: "/solutions/it-agencies", desc: "For service delivery ops", icon: Sparkles },
    { label: "Staffing Firms", href: "/solutions/staffing-firms", desc: "For roster compliance", icon: Building },
    { label: "Enterprise Isolated", href: "/solutions/enterprise", desc: "Logical database separation", icon: Layers },
  ];

  return (
    <header className="relative z-50 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0">
      <div className="w-full px-6 h-20 flex items-center justify-between">
        {/* Branding Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform duration-200">
            <Layers className="text-white animate-pulse" size={20} />
          </div>
          <div>
            <span className="font-bold text-lg text-white tracking-tight block">OmniPulse AI</span>
            <span className="text-[10px] block font-mono text-indigo-400 tracking-wider uppercase leading-none">
              Enterprise SaaS
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400 relative">
          
          {/* Features Dropdown Menu */}
          <div 
            className="relative"
            onMouseEnter={() => setFeaturesOpen(true)}
            onMouseLeave={() => setFeaturesOpen(false)}
          >
            <button className="flex items-center gap-1 hover:text-white transition py-2 focus:outline-none">
              <span>Features</span>
              <ChevronDown size={14} className={`transition duration-200 ${featuresOpen ? "rotate-180" : ""}`} />
            </button>
            
            {featuresOpen && (
              <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[280px] bg-slate-900 border border-slate-800 rounded-2xl p-4 grid gap-2 shadow-2xl animate-fade-in">
                {features.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-800 transition"
                    >
                      <div className="h-8 w-8 bg-indigo-600/10 text-indigo-400 rounded-lg flex items-center justify-center shrink-0">
                        <Icon size={16} />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-white">{item.label}</span>
                        <span className="block text-[10px] text-slate-500">{item.desc}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Solutions Dropdown Menu */}
          <div 
            className="relative"
            onMouseEnter={() => setSolutionsOpen(true)}
            onMouseLeave={() => setSolutionsOpen(false)}
          >
            <button className="flex items-center gap-1 hover:text-white transition py-2 focus:outline-none">
              <span>Solutions</span>
              <ChevronDown size={14} className={`transition duration-200 ${solutionsOpen ? "rotate-180" : ""}`} />
            </button>
            
            {solutionsOpen && (
              <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[280px] bg-slate-900 border border-slate-800 rounded-2xl p-4 grid gap-2 shadow-2xl animate-fade-in">
                {solutions.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-800 transition"
                    >
                      <div className="h-8 w-8 bg-indigo-600/10 text-indigo-400 rounded-lg flex items-center justify-center shrink-0">
                        <Icon size={16} />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-white">{item.label}</span>
                        <span className="block text-[10px] text-slate-500">{item.desc}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <Link href="/pricing" className={`hover:text-white transition ${pathname === "/pricing" ? "text-white" : ""}`}>
            Pricing
          </Link>
          <Link href="/security" className={`hover:text-white transition ${pathname === "/security" ? "text-white" : ""}`}>
            Security
          </Link>
          <Link href="/faqs" className={`hover:text-white transition ${pathname === "/faqs" ? "text-white" : ""}`}>
            FAQs
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {userLoggedIn ? (
            <Link href="/dashboard">
              <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 transition-all active:scale-95">
                Go to Dashboard
                <ArrowRight size={14} />
              </button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <span className="text-xs font-semibold text-slate-300 hover:text-white transition">Sign In</span>
              </Link>
              <Link href="/signup">
                <span className="text-xs font-semibold text-indigo-400 hover:text-indigo-350 transition">Sign Up</span>
              </Link>
              <Link href="/request-demo">
                <button className="bg-white hover:bg-slate-100 text-slate-950 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1 transition active:scale-95">
                  Request Demo
                  <ArrowRight size={14} />
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white focus:outline-none md:hidden border border-slate-900 rounded-xl"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="absolute top-20 left-0 w-full bg-slate-950 border-b border-slate-900 p-6 flex flex-col gap-6 md:hidden max-h-[85vh] overflow-y-auto shadow-2xl z-50">
          <nav className="flex flex-col gap-4">
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">Features</p>
            <div className="pl-3 grid gap-3">
              {features.map((item) => (
                <Link key={item.label} href={item.href} className="text-sm font-semibold text-slate-350 hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 mt-2">Solutions</p>
            <div className="pl-3 grid gap-3">
              {solutions.map((item) => (
                <Link key={item.label} href={item.href} className="text-sm font-semibold text-slate-350 hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
            <hr className="border-slate-900" />
            <Link href="/pricing" className="text-sm font-semibold text-slate-350 hover:text-white py-1">
              Pricing Details
            </Link>
            <Link href="/security" className="text-sm font-semibold text-slate-350 hover:text-white py-1">
              Data Security
            </Link>
            <Link href="/faqs" className="text-sm font-semibold text-slate-350 hover:text-white py-1">
              FAQs
            </Link>
          </nav>
          
          <div className="flex flex-col gap-3 pt-2">
            {userLoggedIn ? (
              <Link href="/dashboard" className="w-full">
                <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-lg">
                  Go to Dashboard
                  <ArrowRight size={15} />
                </button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="w-full">
                  <button className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-sm py-2.5 rounded-xl">
                    Sign In
                  </button>
                </Link>
                <Link href="/signup" className="w-full">
                  <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm py-2.5 rounded-xl">
                    Sign Up (15-Day Free Trial)
                  </button>
                </Link>
                <Link href="/request-demo" className="w-full">
                  <button className="w-full bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-1">
                    Book Consultation
                    <ArrowRight size={15} />
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
