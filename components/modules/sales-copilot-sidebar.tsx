"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, MessageSquare, Send, Sparkles, X } from "lucide-react";

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

export function SalesCopilotSidebar({
  lead,
  open,
  onClose,
}: {
  lead: LeadRecord | null;
  open: boolean;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [relevantPlaybooks, setRelevantPlaybooks] = useState<PlaybookInfo[]>([]);
  const feedRef = useRef<HTMLDivElement>(null);

  // Clear chat when lead changes
  useEffect(() => {
    if (lead) {
      setMessages([
        {
          role: "model",
          text: `👋 Hello! I am your Sales Co-Pilot. I've loaded the details for **${lead.name}** (value: ₹${lead.value.toLocaleString("en-IN")}). How can I help you pitch or handle objections today?`,
        },
      ]);
      setRelevantPlaybooks([]);
    }
  }, [lead]);

  // Scroll to bottom on new messages
  useEffect(() => {
    feedRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!open || !lead) return null;

  async function handleSendMessage(text: string) {
    if (!lead) return;
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
          leadId: lead.id,
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
      <aside className="fixed inset-y-0 right-0 z-50 flex h-screen w-full flex-col border-l border-line bg-white shadow-panel sm:max-w-md md:max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4 bg-mist">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-black p-2 text-white">
              <Bot size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-black">Sales Co-Pilot</h3>
              <p className="text-xs text-fog">AI Objections & Strategy Advisor</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-line bg-white p-2 text-fog transition hover:bg-black hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Lead Context Quick Summary */}
        <div className="border-b border-line bg-mist/30 px-5 py-3 text-xs">
          <p className="font-semibold text-black">Context Lead: {lead.name}</p>
          <p className="mt-1 text-fog">
            Value: <span className="text-black font-medium">₹{lead.value.toLocaleString("en-IN")}</span> • 
            Stage: <span className="text-black font-medium">{lead.stage}</span>
          </p>
          {lead.notes && (
            <p className="mt-2 line-clamp-2 rounded bg-white p-2 border border-line italic text-fog">
              "{lead.notes}"
            </p>
          )}
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-[16px] p-4 text-sm leading-relaxed shadow-sm ${
                  msg.role === "user"
                    ? "rounded-tr-[4px] bg-black text-white"
                    : "rounded-tl-[4px] bg-mist text-gray-800 border border-line"
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
              <div className="max-w-[85%] rounded-[16px] rounded-tl-[4px] bg-mist p-4 text-sm border border-line shadow-sm">
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
          <div className="border-t border-line bg-mist/20 px-5 py-2.5">
            <p className="text-[10px] font-mono uppercase tracking-wider text-fog flex items-center gap-1">
              <Sparkles size={10} /> Consulted Playbook Articles:
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {relevantPlaybooks.map((p) => (
                <span
                  key={p.id}
                  className="rounded bg-white border border-line px-2 py-0.5 text-[10px] font-medium text-black"
                >
                  📖 {p.title}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Preset Chips */}
        <div className="border-t border-line px-5 py-3 bg-mist/10 space-y-2">
          <p className="text-[11px] font-medium text-fog">Objection Handlers & Prompts:</p>
          <div className="flex flex-wrap gap-2">
            {presetChips.map((chip, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(chip.prompt)}
                disabled={loading}
                className="rounded-full border border-line bg-white px-3 py-1.5 text-xs text-black font-medium shadow-sm transition hover:bg-black hover:text-white disabled:opacity-50"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="border-t border-line p-4 bg-white flex items-center gap-2">
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
      </aside>
    </>
  );
}
