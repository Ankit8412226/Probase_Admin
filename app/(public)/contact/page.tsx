"use client";

import { useState } from "react";
import { Mail, MessageSquare, Phone, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import { FieldGroup, FieldLabel, TextInput, TextArea } from "@/components/forms/form-primitives";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Sales Inquiry");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
    }, 1500);
  };

  return (
    <div className="py-20 max-w-5xl mx-auto px-6 grid gap-12 md:grid-cols-[1.1fr_0.9fr]">
      {/* Left Column: Form */}
      <div className="space-y-6">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-indigo-400">
            Reach Out
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-white mt-3">Contact Operations</h1>
          <p className="mt-2 text-xs text-slate-400">
            Submit a request and our support coordinators will get back to you within 4 hours.
          </p>
        </div>

        {submitted ? (
          <div className="border border-emerald-500/10 bg-emerald-500/5 p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 animate-scale-in">
            <div className="h-12 w-12 bg-emerald-500/15 text-emerald-400 rounded-full flex items-center justify-center">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-white">Message Dispatched!</h3>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              Your inquiry has been logged in our queue. A ticket copy is dispatched to your email.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="border border-slate-900 bg-slate-950 p-6 rounded-2xl space-y-5">
            <FieldGroup>
              <FieldLabel htmlFor="contact-name" className="text-slate-300">Name</FieldLabel>
              <TextInput
                id="contact-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Rahul Sharma"
                className="bg-slate-950 border-slate-900 text-white placeholder-slate-700 focus:border-slate-800"
              />
            </FieldGroup>

            <FieldGroup>
              <FieldLabel htmlFor="contact-email" className="text-slate-300">Work Email</FieldLabel>
              <TextInput
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@company.com"
                className="bg-slate-950 border-slate-900 text-white placeholder-slate-700 focus:border-slate-800"
              />
            </FieldGroup>

            <FieldGroup>
              <FieldLabel htmlFor="contact-subject" className="text-slate-300">Subject</FieldLabel>
              <select
                id="contact-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full h-11 bg-slate-950 border border-slate-900 focus:border-slate-800 rounded-[14px] px-4 text-xs text-white focus:outline-none"
              >
                <option value="Sales Inquiry">Sales & Pricing Inquiry</option>
                <option value="WhatsApp Support">WhatsApp Setup Support</option>
                <option value="Face-ID Biometrics">Face-ID Attendance Support</option>
                <option value="Billing Details">Billing & Invoices Details</option>
              </select>
            </FieldGroup>

            <FieldGroup>
              <FieldLabel htmlFor="contact-msg" className="text-slate-300">Detailed Message</FieldLabel>
              <TextArea
                id="contact-msg"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                placeholder="Tell us how we can assist your team operations..."
                className="bg-slate-950 border-slate-900 text-white placeholder-slate-700 focus:border-slate-800"
              />
            </FieldGroup>

            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3.5" disabled={isSubmitting}>
              {isSubmitting ? "Dispatching..." : "Submit Inquiry"}
              <ArrowRight size={15} />
            </Button>
          </form>
        )}
      </div>

      {/* Right Column: Support contacts */}
      <div className="space-y-6 md:pt-16">
        <div className="border border-slate-900 bg-slate-900/10 p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white">Operations Hotdesk</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Need urgent developer support for WhatsApp API keys or Biometric descriptor models? Connect with our standby crew.
          </p>

          <div className="space-y-3.5 pt-2 text-xs text-slate-350">
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-indigo-400" />
              <span>support@probase-solutions.com</span>
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
            <MessageSquare size={16} />
          </div>
          <h4 className="text-xs font-bold text-white">Simulated Demo Credentials</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Testing dashboards or attendance integrations? Feel free to use the Sandbox environment variables loaded in the documentation folder.
          </p>
        </div>
      </div>
    </div>
  );
}
