import Link from "next/link";
import { MessageSquare, QrCode, Bot, Send, Users, ShieldAlert, ArrowRight } from "lucide-react";

export const metadata = {
  title: "WhatsApp CRM - Probase Solutions",
  description: "Leverage browser WebSockets to broadcast bulk WhatsApp marketing campaigns and set up auto-reply chatbots without paying Meta API rates.",
};

export default function WhatsAppCrmPage() {
  const featuresList = [
    {
      icon: QrCode,
      title: "Instant QR Scanner Pairing",
      desc: "Link your standard personal or business WhatsApp number in under 10 seconds. No Meta developer review or credit card setup required."
    },
    {
      icon: Send,
      title: "Bulk Campaigns with Variables",
      desc: "Upload CSV lists or sync leads directly. Send personalized messages using variables like {{name}} or {{company}} to double engagement."
    },
    {
      icon: Bot,
      title: "Automated Chatbot Rules",
      desc: "Configure auto-reply keywords directly. Let the bot reply to standard queries, dispatch proposal links, or confirm payroll collections."
    },
    {
      icon: Users,
      title: "Multi-Account Inbox",
      desc: "Aggregate chat streams across multiple paired devices. Let managers and business representatives reply to incoming leads from a shared workspace."
    }
  ];

  return (
    <div className="py-20 w-full px-6">
      <div className="text-center w-full mb-16">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-medium mb-4">
          <MessageSquare size={13} />
          <span>Core CRM Channel</span>
        </span>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mt-2">
          WebSocket-powered WhatsApp CRM without Meta API costs.
        </h1>
        <p className="mt-6 text-base text-slate-400 leading-relaxed">
          Traditional WhatsApp Business APIs charge per conversation, making sales outreach expensive. Probase Solutions routes campaigns through direct browser WebSocket tokens, enabling unlimited client broadcasting and interactive chatbot automations completely free.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-12">
        {featuresList.map((item, idx) => {
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

      <div className="mt-20 border border-slate-900 bg-slate-900/10 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 w-full">
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-white tracking-tight">Try direct WhatsApp pairing today.</h2>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">
            Create an organization workspace and link your phone in seconds. Starter plans include 1 linked device with full variable support.
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
