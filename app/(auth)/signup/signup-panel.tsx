"use client";

import { ArrowRight, ShieldCheck, LockKeyhole, Building, User, Mail, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

import { FieldGroup, FieldLabel, TextInput } from "@/components/forms/form-primitives";
import { Button } from "@/components/ui/button";

export function SignupPanel() {
  const router = useRouter();
  
  // Registration fields
  const [companyName, setCompanyName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle signup form submit
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ companyName, name, email, password }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Registration failed.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (submitError: any) {
      setError(submitError.message || "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-slate-950 text-slate-100 lg:grid-cols-[1.05fr_0.95fr] selection:bg-indigo-500 selection:text-white">
      <section className="relative hidden overflow-hidden border-r border-slate-900 bg-slate-950 lg:flex">
        {/* Glow Effects */}
        <div className="absolute top-[-10%] left-[20%] w-[450px] h-[450px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
        <div className="grid-fade absolute inset-0 opacity-[0.4]" />
        
        <div className="relative z-10 flex flex-col justify-between p-12">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-indigo-400">
              OmniPulse AI
            </p>
            <h1 className="mt-6 max-w-xl text-5xl font-semibold tracking-tight text-white leading-[1.15]">
              Start your isolated SaaS Workspace in seconds.
            </h1>
            <p className="mt-5 max-w-lg text-base text-slate-400">
              Register your organization, pair your own WhatsApp numbers, set up attendance rules, and run multi-tenant operational CRM instances.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="border border-slate-900 bg-slate-900/10 p-5 rounded-[18px] backdrop-blur-md">
              <Building size={18} className="text-indigo-400" />
              <p className="mt-4 text-lg font-semibold text-white">Tenant Isolation</p>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Your leads, payrolls, and database items are strictly partitioned and fully encrypted.
              </p>
            </div>
            <div className="border border-slate-900 bg-slate-900/10 p-5 rounded-[18px] backdrop-blur-md">
              <ShieldCheck size={18} className="text-indigo-400" />
              <p className="mt-4 text-lg font-semibold text-white">Enterprise Ready</p>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Admin dashboard and sub-accounts with customized roles access control.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-12 sm:px-10 relative">
        {/* Mobile Background Glow */}
        <div className="absolute top-[10%] left-[10%] w-[300px] h-[300px] rounded-full bg-indigo-600/5 blur-[100px] pointer-events-none lg:hidden" />
        
        <div className="w-full max-w-md relative z-10">
          <div className="mb-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-indigo-400">
              Workspace Setup
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Create Organization</h2>
            <p className="mt-2 text-sm text-slate-400">
              Set up your isolated multi-tenant admin console panel.
            </p>
          </div>

          <div className="border border-slate-900 bg-slate-900/10 p-6 min-h-[460px] flex flex-col justify-between rounded-2xl shadow-panel">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <FieldGroup>
                <FieldLabel htmlFor="signup-company" className="text-slate-300">Company / Organization</FieldLabel>
                <div className="relative">
                  <TextInput
                    id="signup-company"
                    type="text"
                    value={companyName}
                    onChange={(event) => setCompanyName(event.target.value)}
                    required
                    placeholder="e.g. Acme Corporation"
                    className="pl-9 bg-slate-950 border-slate-900 text-white placeholder-slate-700 focus:border-slate-800"
                  />
                  <Building size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>
              </FieldGroup>

              <FieldGroup>
                <FieldLabel htmlFor="signup-name" className="text-slate-300">Administrator Name</FieldLabel>
                <div className="relative">
                  <TextInput
                    id="signup-name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    placeholder="e.g. Rahul Sharma"
                    className="pl-9 bg-slate-950 border-slate-900 text-white placeholder-slate-700 focus:border-slate-800"
                  />
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>
              </FieldGroup>

              <FieldGroup>
                <FieldLabel htmlFor="signup-email" className="text-slate-300">Work Email</FieldLabel>
                <div className="relative">
                  <TextInput
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    placeholder="name@company.com"
                    className="pl-9 bg-slate-950 border-slate-900 text-white placeholder-slate-700 focus:border-slate-800"
                  />
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>
              </FieldGroup>

              <FieldGroup>
                <FieldLabel htmlFor="signup-password" className="text-slate-300">Password</FieldLabel>
                <div className="relative">
                  <TextInput
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    placeholder="At least 6 characters"
                    className="pl-9 pr-10 bg-slate-950 border-slate-900 text-white placeholder-slate-700 focus:border-slate-800"
                  />
                  <LockKeyhole size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </FieldGroup>

              {error ? (
                <div className="rounded-[16px] border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                  {error}
                </div>
              ) : null}

              <Button type="submit" className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 py-3.5" disabled={isSubmitting}>
                {isSubmitting ? "Creating Workspace..." : "Create Free Workspace"}
                <ArrowRight size={15} />
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            Already have an organization?{" "}
            <Link href="/login" className="font-semibold text-white hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
