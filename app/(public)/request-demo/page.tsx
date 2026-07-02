"use client";

import { useState } from "react";
import { Sparkles, Calendar, Mail, Phone, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import { FieldGroup, FieldLabel, TextInput, TextArea } from "@/components/forms/form-primitives";
import { Button } from "@/components/ui/button";

export default function RequestDemoPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [teamSize, setTeamSize] = useState("10-50");
  const [primaryInterest, setPrimaryInterest] = useState("WhatsApp CRM");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="py-20 w-full px-6 grid gap-12 md:grid-cols-[1.1fr_0.9fr]">
      {/* Left form */}
      <div className="space-y-6">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-medium mb-4">
            <Calendar size={13} />
            <span>Consultation Booking</span>
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-white mt-2">Request Live Demonstration</h1>
          <p className="mt-2 text-xs text-slate-400">
            Book a 1-on-1 operational briefing showing isolated database setups and WebSocket broadcasts.
          </p>
        </div>

        {submitted ? (
          <div className="border border-emerald-500/10 bg-emerald-500/5 p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 animate-scale-in">
            <div className="h-12 w-12 bg-emerald-500/15 text-emerald-400 rounded-full flex items-center justify-center">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-white"> briefing booked successfully!</h3>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              We have allocated a trial sandbox space. Check your inbox for custom login details and calendar invites.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Book another demo
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="border border-slate-900 bg-slate-950 p-6 rounded-2xl space-y-5">
            <FieldGroup>
              <FieldLabel htmlFor="demo-name" className="text-slate-350">Your Name</FieldLabel>
              <TextInput
                id="demo-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Rahul Sharma"
                className="bg-slate-950 border-slate-900 text-white placeholder-slate-700 focus:border-slate-800"
              />
            </FieldGroup>

            <div className="grid gap-4 md:grid-cols-2">
              <FieldGroup>
                <FieldLabel htmlFor="demo-email" className="text-slate-350">Work Email</FieldLabel>
                <TextInput
                  id="demo-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@company.com"
                  className="bg-slate-950 border-slate-900 text-white placeholder-slate-700 focus:border-slate-800"
                />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel htmlFor="demo-size" className="text-slate-350">Team headcount Size</FieldLabel>
                <select
                  id="demo-size"
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                  className="w-full h-11 bg-slate-950 border border-slate-900 focus:border-slate-800 rounded-[14px] px-4 text-xs text-white focus:outline-none"
                >
                  <option value="1-10">1 - 10 employees</option>
                  <option value="10-50">10 - 50 employees</option>
                  <option value="50-250">50 - 250 employees</option>
                  <option value="250+">250+ employees</option>
                </select>
              </FieldGroup>
            </div>

            <FieldGroup>
              <FieldLabel htmlFor="demo-interest" className="text-slate-350">Primary CRM interest</FieldLabel>
              <select
                id="demo-interest"
                value={primaryInterest}
                onChange={(e) => setPrimaryInterest(e.target.value)}
                className="w-full h-11 bg-slate-950 border border-slate-900 focus:border-slate-800 rounded-[14px] px-4 text-xs text-white focus:outline-none"
              >
                <option value="WhatsApp CRM">WhatsApp CRM broadcasting</option>
                <option value="Face-ID Biometrics">Contactless Webcam Face-ID</option>
                <option value="Payroll calculations">Adaptive Shifts & Payroll logs</option>
                <option value="Database Isolation">Strict Tenant Isolation security</option>
              </select>
            </FieldGroup>

            <FieldGroup>
              <FieldLabel htmlFor="demo-msg" className="text-slate-350">Special Requirements</FieldLabel>
              <TextArea
                id="demo-msg"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Let us know what operational challenges your team is facing..."
                className="bg-slate-950 border-slate-900 text-white placeholder-slate-700 focus:border-slate-800"
              />
            </FieldGroup>

            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3.5" disabled={isSubmitting}>
              {isSubmitting ? "Allocating Briefing Sandbox..." : "Book Demonstration Briefing"}
              <ArrowRight size={15} />
            </Button>
          </form>
        )}
      </div>

      {/* Right Column details */}
      <div className="space-y-6 md:pt-16">
        <div className="border border-slate-900 bg-slate-900/10 p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white">Standby Hotdesk</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Need urgent assistance configuring multi-tenant sandboxes or custom vector playbooks RAG rules? Reach out to support.
          </p>

          <div className="space-y-3.5 pt-2 text-xs text-slate-350">
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-indigo-400" />
              <span>sales@probase-solutions.com</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-indigo-400" />
              <span>+91 80 4812 8412</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock size={16} className="text-indigo-400" />
              <span>Mon - Fri • 9:00 AM - 6:00 PM IST</span>
            </div>
          </div>
        </div>

        <div className="border border-slate-900 bg-slate-900/10 p-6 rounded-2xl space-y-3">
          <div className="h-8 w-8 bg-indigo-650/15 text-indigo-400 rounded-lg flex items-center justify-center">
            <Sparkles size={16} />
          </div>
          <h4 className="text-xs font-bold text-white">Instant Sandbox Access</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            All submitted briefing bookings automatically allocate a 15-day isolated sandbox schema with pre-loaded mock team datasets.
          </p>
        </div>
      </div>
    </div>
  );
}
