"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, MessageSquare, Send, Sparkles, X, Activity, DollarSign, HelpCircle, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/forms/form-primitives";
import type { LeadRecord } from "@/types";

interface Message {
  role: "user" | "model";
  text: string;
}

interface PlaybookInfo {
  id: string;
  title: string;
  category: string;
}

interface AnalysisData {
  dealScore: number;
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  objectionCounters: string[];
  milestonePayments: string[];
  nextActions: string[];
  recommendedQuestions: string[];
}

export function SalesCopilotSidebar({
  lead,
  open,
  onClose,
}: {
  lead: LeadRecord | null;
  open: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"chat" | "analysis">("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [relevantPlaybooks, setRelevantPlaybooks] = useState<PlaybookInfo[]>([]);
  
  // Analysis States
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  const feedRef = useRef<HTMLDivElement>(null);

  // Reset chat and analysis when lead changes or sidebar opens
  useEffect(() => {
    if (open) {
      setActiveTab("chat");
      setAnalysis(null);
      setAnalysisError("");
      
      if (lead) {
        setMessages([
          {
            role: "model",
            text: `👋 Hello! I am your Sales Co-Pilot. I've loaded the details for **${lead.name}** (value: ₹${lead.value.toLocaleString("en-IN")}). How can I help you pitch or handle objections today?`,
          },
        ]);
      } else {
        setMessages([
          {
            role: "model",
            text: `👋 Hello! I am your Sales Co-Pilot. Ask me any question about Probase's services, playbooks, case studies, or standard pricing and I will answer you using our Knowledge Base!`,
          },
        ]);
      }
      setRelevantPlaybooks([]);
    }
  }, [lead, open]);

  // Scroll to bottom on new messages
  useEffect(() => {
    feedRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch Strategy Analysis
  async function fetchLeadAnalysis() {
    if (!lead || analysis || analyzing) return;
    setAnalyzing(true);
    setAnalysisError("");
    try {
      const response = await fetch(`/api/leads/${lead.id}/analyze`);
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to analyze lead");
      }
      setAnalysis(data.data);
    } catch (err: any) {
      setAnalysisError(err.message || "Something went wrong generating the analysis.");
    } finally {
      setAnalyzing(false);
    }
  }

  // Fetch analysis when switching tabs
  useEffect(() => {
    if (activeTab === "analysis" && lead) {
      fetchLeadAnalysis();
    }
  }, [activeTab, lead]);

  if (!open) return null;

  async function handleSendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/sales-agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: lead?.id,
          message: text,
          chatHistory: messages.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to chat");
      }

      setMessages((prev) => [
        ...prev,
        { role: "model", text: data.data.reply },
      ]);
      if (data.data.relevantPlaybooks) {
        setRelevantPlaybooks(data.data.relevantPlaybooks);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "model", text: "Sorry, I encountered an error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const presetChips = [
    { label: "💰 Handle high price", prompt: "The client says our price is too high. How do I handle this pricing objection?" },
    { label: "🤝 Counter competitor", prompt: "The client says a competitor is offering a cheaper rate. What is our counter-strategy?" },
    { label: "📋 Phased milestones", prompt: "Suggest a phased milestone payment plan to fit their budget freeze." },
    { label: "📧 Intro email pitch", prompt: "Write a high-converting, personalized introduction email pitching Probase Solutions for this client." },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <aside className="fixed inset-y-0 right-0 z-50 flex h-screen w-full flex-col border-l border-slate-900 bg-slate-950 shadow-panel sm:max-w-md md:max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-900 px-5 py-4 bg-slate-900">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-indigo-600 p-2 text-slate-100">
              <Bot size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100">Sales Co-Pilot</h3>
              <p className="text-xs text-fog">AI Objections & Strategy Advisor</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-800 bg-slate-800 p-2 text-fog transition hover:bg-slate-700 hover:text-slate-100"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Selector */}
        {lead && (
          <div className="flex border-b border-slate-900 bg-slate-900/50 p-1">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 py-2 text-center text-xs font-semibold rounded-[8px] transition-all border ${
                activeTab === "chat"
                  ? "bg-indigo-600/10 text-indigo-400 border-indigo-500/20 font-bold"
                  : "text-slate-400 border-transparent hover:text-slate-200"
              }`}
            >
              💬 Co-Pilot Chat
            </button>
            <button
              onClick={() => setActiveTab("analysis")}
              className={`flex-1 py-2 text-center text-xs font-semibold rounded-[8px] transition-all border flex items-center justify-center gap-1.5 ${
                activeTab === "analysis"
                  ? "bg-indigo-600/10 text-indigo-400 border-indigo-500/20 font-bold"
                  : "text-slate-400 border-transparent hover:text-slate-200"
              }`}
            >
              📊 Strategy Analysis
            </button>
          </div>
        )}

        {/* Lead Context Quick Summary */}
        {lead ? (
          <div className="border-b border-slate-900 bg-slate-900/30 px-5 py-3 text-xs">
            <p className="font-semibold text-slate-200">Context Lead: {lead.name}</p>
            <p className="mt-1 text-fog">
              Value: <span className="text-slate-200 font-medium">₹{lead.value.toLocaleString("en-IN")}</span> • 
              Stage: <span className="text-slate-200 font-medium">{lead.stage}</span>
            </p>
          </div>
        ) : (
          <div className="border-b border-slate-900 bg-slate-900/30 px-5 py-3 text-xs">
            <p className="font-semibold text-slate-200 flex items-center gap-1">
              ✨ General Strategist Mode
            </p>
            <p className="mt-1 text-fog">
              Direct access to Probase playbooks, case studies, brochures, and objection guidelines.
            </p>
          </div>
        )}

        {activeTab === "chat" ? (
          <>
            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-900">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-[16px] p-4 text-sm leading-relaxed shadow-sm border ${
                      msg.role === "user"
                        ? "rounded-tr-[4px] bg-indigo-600 text-slate-100 border-transparent"
                        : "rounded-tl-[4px] bg-slate-950/70 text-slate-200 border-slate-800/80"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] uppercase tracking-wider text-fog">
                      {msg.role === "user" ? "You (Sales Rep)" : "AI Co-Pilot"}
                    </div>
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-[16px] rounded-tl-[4px] bg-slate-950/70 p-4 text-sm border border-slate-800/80 shadow-sm">
                    <div className="flex items-center gap-2 text-fog">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-fog" style={{ animationDelay: "0ms" }} />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-fog" style={{ animationDelay: "150ms" }} />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-fog" style={{ animationDelay: "300ms" }} />
                      <span>Strategizing...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={feedRef} />
            </div>

            {/* Playbook references (RAG indicator) */}
            {relevantPlaybooks.length > 0 && (
              <div className="border-t border-slate-900 bg-slate-900/40 px-5 py-2.5">
                <p className="text-[10px] font-mono uppercase tracking-wider text-fog flex items-center gap-1">
                  <Sparkles size={10} /> Consulted Playbook Articles:
                </p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {relevantPlaybooks.map((p) => (
                    <span
                      key={p.id}
                      className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-300"
                    >
                      📖 {p.title}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Preset Chips */}
            <div className="border-t border-slate-900 px-5 py-3 bg-slate-900/30 space-y-2">
              <p className="text-[11px] font-medium text-fog">Objection Handlers & Prompts:</p>
              <div className="flex flex-wrap gap-2">
                {presetChips.map((chip, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSendMessage(chip.prompt)}
                    disabled={loading}
                    className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 font-medium shadow-sm transition hover:bg-indigo-600/10 hover:text-indigo-400 hover:border-indigo-500/30 disabled:opacity-50"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <div className="border-t border-slate-900 p-4 bg-slate-950 flex items-center gap-2">
              <TextInput
                placeholder="Ask Co-Pilot for sales advice..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage(input)}
                disabled={loading}
                className="flex-1"
              />
              <Button
                onClick={() => handleSendMessage(input)}
                disabled={loading || !input.trim()}
                className="h-11 px-4"
              >
                <Send size={16} />
              </Button>
            </div>
          </>
        ) : (
          /* Strategy Analysis Panel */
          <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-900/20">
            {analyzing ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                <p className="text-sm font-semibold text-slate-200">Analyzing lead details...</p>
                <p className="text-xs text-fog">Generating custom SWOT and payment structures</p>
              </div>
            ) : analysisError ? (
              <div className="rounded-[16px] border border-red-200 bg-red-50/50 p-4 text-center space-y-2">
                <ShieldAlert className="mx-auto text-red-500" size={24} />
                <p className="text-sm font-semibold text-red-700">Failed to analyze lead</p>
                <p className="text-xs text-red-600">{analysisError}</p>
                <Button variant="secondary" className="h-8 text-xs mt-2" onClick={() => { setAnalysis(null); fetchLeadAnalysis(); }}>
                  Retry Analysis
                </Button>
              </div>
            ) : analysis ? (
              <>
                {/* Deal Score */}
                <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-[16px] border border-slate-800 shadow-sm">
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600/10 text-indigo-400 border border-indigo-500/25 font-bold text-base">
                    {analysis.dealScore}%
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-100">Deal Qualification Score</h4>
                    <p className="text-[11px] text-fog">AI assessment of lead readiness and close probability</p>
                  </div>
                </div>

                {/* SWOT Analysis */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-fog flex items-center gap-1.5">
                    <Activity size={12} /> SWOT Analysis
                  </h4>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-[12px]">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Strengths</span>
                      <ul className="mt-1.5 list-disc pl-3 text-[11px] text-slate-350 space-y-1">
                        {analysis.swot.strengths.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-[12px]">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Weaknesses</span>
                      <ul className="mt-1.5 list-disc pl-3 text-[11px] text-slate-350 space-y-1">
                        {analysis.swot.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                    <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-[12px]">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Opportunities</span>
                      <ul className="mt-1.5 list-disc pl-3 text-[11px] text-slate-350 space-y-1">
                        {analysis.swot.opportunities.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                    <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-[12px]">
                      <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Threats</span>
                      <ul className="mt-1.5 list-disc pl-3 text-[11px] text-slate-350 space-y-1">
                        {analysis.swot.threats.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Recommended Milestone / Part Payments */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-fog flex items-center gap-1.5">
                    <DollarSign size={12} /> Milestone Payment Strategies
                  </h4>
                  <div className="space-y-2">
                    {analysis.milestonePayments.map((p, i) => (
                      <div key={i} className="bg-slate-900 border border-slate-800 p-3 rounded-[12px] shadow-sm flex items-start gap-2">
                        <span className="bg-indigo-600 text-slate-100 text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                          {i + 1}
                        </span>
                        <p className="text-xs text-slate-300 font-medium">{p}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Client Questions */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-fog flex items-center gap-1.5">
                    <HelpCircle size={12} /> Strategic Questions to Ask
                  </h4>
                  <div className="space-y-2">
                    {analysis.recommendedQuestions.map((q, i) => (
                      <div key={i} className="bg-slate-900 border border-slate-800 p-3 rounded-[12px] shadow-sm flex flex-col justify-between gap-2.5">
                        <p className="text-xs text-slate-350 italic">"{q}"</p>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(q);
                            alert("Copied to clipboard!");
                          }}
                          className="self-end text-[10px] text-indigo-400 font-semibold hover:underline"
                        >
                          📋 Copy Question
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Objection Counters & Playbook Strategy */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-fog flex items-center gap-1.5">
                    <Sparkles size={12} /> Objection Counter-Strategies
                  </h4>
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-[16px] shadow-sm space-y-3">
                    {analysis.objectionCounters.map((obj, i) => (
                      <div key={i} className="text-xs text-slate-355 leading-relaxed border-b border-slate-800 last:border-b-0 pb-2.5 last:pb-0">
                        <span className="font-semibold text-slate-100 block mb-0.5">Strategy {i + 1}:</span>
                        {obj}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Steps */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-fog">🎯 Recommended Next Actions</h4>
                  <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 p-4 rounded-[16px] shadow-sm space-y-2">
                    {analysis.nextActions.map((act, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="text-indigo-400 font-mono font-bold mt-0.5">{i + 1}.</span>
                        <p>{act}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}
      </aside>
    </>
  );
}
