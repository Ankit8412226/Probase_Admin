"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Settings, Zap, History, RefreshCw, QrCode, Wifi, AlertTriangle, Send, Megaphone, Inbox, Upload, Plus, Sparkles, Bot, Trash, Trash2, FolderHeart, CheckSquare, XSquare } from "lucide-react";
import { DataTable } from "@/components/tables/data-table";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FieldGroup, FieldLabel, TextInput, TextArea, SelectInput } from "@/components/forms/form-primitives";
import { Modal } from "@/components/ui/modal";
import { formatDate, cn } from "@/lib/utils";
import type { WhatsappLogRecord, WhatsappMessageRecord, WhatsappCampaignRecord, WhatsappTemplateRecord, WhatsappRuleRecord } from "@/types";

// Static presets templates
const PRESETS = [
  {
    category: "Marketing",
    name: "🚀 Product Launch Pitch",
    templateText: "🚀 *Hi {{name}}!*\n\nWe just launched our new *AI-Powered CRM and Billing cockpit*. As a valued partner of *{{company}}*, we invite you to try our private beta for free!\n\nCheck out the dashboard screenshot and reply to set up your account.",
    mediaUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600"
  },
  {
    category: "Marketing",
    name: "🔥 Festive Discount Promo",
    templateText: "🔥 *Special Offer for {{name}}!*\n\nGet exactly *{{var1}}* off on all our premium packages at *{{company}}*! Use code *PROBASE2026* at checkout.\n\nClaim your coupon today by replying to this message!",
    mediaUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=600"
  },
  {
    category: "Sales & Pitching",
    name: "🤝 Discovery Call Followup",
    templateText: "🤝 *Hi {{name}}*,\n\nIt was great discussing your goals for *{{company}}* today. As agreed, we've blocked a slot on *{{var1}}* for our deep-dive architecture design call.\n\nLooking forward to speaking soon!",
    mediaUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600"
  },
  {
    category: "Client Operations",
    name: "📦 Milestone Delivery Signoff",
    templateText: "📦 *Hello {{name}}*,\n\nOur team has successfully completed the development milestone: *{{var1}}* for your project at *{{company}}*.\n\nPlease preview the staging release here: {{var2}}\n\nReply to confirm signoff!",
    mediaUrl: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600"
  },
  {
    category: "Billing & Invoices",
    name: "⚠️ Invoice Pending Alert",
    templateText: "⚠️ *Dear {{name}}*,\n\nThis is a friendly reminder that invoice *{{var1}}* issued to *{{company}}* is currently pending, with a due date of *{{var2}}*.\n\nPlease resolve it to avoid services interruption. Thank you!",
    mediaUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=600"
  },
  {
    category: "Onboarding",
    name: "🎉 Partner Welcome Greeting",
    templateText: "🎉 *Welcome aboard, {{name}}!*\n\nWe are absolutely thrilled to partner with *{{company}}*. Your onboarding checklist is ready.\n\nYour assigned Account Manager *{{var1}}* will connect with you shortly!",
    mediaUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600"
  }
];

const STOCK_ASSETS = [
  { name: "🚀 Launch Product", url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600" },
  { name: "🔥 Special Discount", url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=600" },
  { name: "📅 Booking & Meeting", url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600" },
  { name: "⚠️ Billing Ledger", url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=600" },
  { name: "🎉 Onboarding Success", url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600" },
  { name: "📦 Operations Milestone", url: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600" }
];

export function WhatsappModule({
  initialLogs,
  initialConfig,
  defaultTab = "status",
}: {
  initialLogs: WhatsappLogRecord[];
  initialConfig: { gatewayUrl: string };
  defaultTab?: "status" | "inbox" | "campaigns" | "templates" | "rules";
}) {
  const [activeTab, setActiveTab] = useState<"status" | "inbox" | "campaigns" | "templates" | "rules">(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);
  const [logs, setLogs] = useState<WhatsappLogRecord[]>(initialLogs);
  const [gatewayUrl, setGatewayUrl] = useState(initialConfig.gatewayUrl || "");
  const [isConnected, setIsConnected] = useState(false);
  const [gatewayStatus, setGatewayStatus] = useState("DISCONNECTED");
  
  // Test sandbox fields
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Alerts
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [configSuccess, setConfigSuccess] = useState("");

  // Real QR code states
  const [showQR, setShowQR] = useState(false);
  const [qrCodeData, setQrCodeData] = useState("");
  const [qrError, setQrError] = useState("");
  const [isLoadingQr, setIsLoadingQr] = useState(false);

  // Incoming replies states
  const [inboxMessages, setInboxMessages] = useState<WhatsappMessageRecord[]>([]);
  const [isLoadingInbox, setIsLoadingInbox] = useState(false);

  // Campaigns states
  const [campaigns, setCampaigns] = useState<WhatsappCampaignRecord[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);

  // Custom Templates states
  const [customTemplates, setCustomTemplates] = useState<WhatsappTemplateRecord[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [tplName, setTplName] = useState("");
  const [tplText, setTplText] = useState("");
  const [tplMediaUrl, setTplMediaUrl] = useState("");

  // Chatbot Auto-Responder Rules states
  const [rules, setRules] = useState<WhatsappRuleRecord[]>([]);
  const [isLoadingRules, setIsLoadingRules] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [isSavingRule, setIsSavingRule] = useState(false);
  const [ruleKeyword, setRuleKeyword] = useState("");
  const [ruleReply, setRuleReply] = useState("");
  const [ruleMediaUrl, setRuleMediaUrl] = useState("");

  // New Campaign Form Fields
  const [campName, setCampName] = useState("");
  const [campTargetType, setCampTargetType] = useState<"Leads" | "Clients" | "Custom">("Leads");
  const [campTemplate, setCampTemplate] = useState("Hi {{name}}, we have a special proposal for {{company}}. Let's connect!");
  const [campMediaUrl, setCampMediaUrl] = useState("");
  
  // Custom contacts lists
  const [customList, setCustomList] = useState<Array<{ name: string; phone: string; company?: string }>>([]);
  const [manualText, setManualText] = useState("");
  const [csvSuccessMsg, setCsvSuccessMsg] = useState("");
  const [csvErrorMsg, setCsvErrorMsg] = useState("");

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check connection status periodically on mount
  useEffect(() => {
    checkConnectionStatus();
    const interval = setInterval(checkConnectionStatus, 10000); // Check status every 10s
    return () => clearInterval(interval);
  }, [gatewayUrl]);

  // Load active tab data
  useEffect(() => {
    if (activeTab === "inbox") {
      loadInbox();
    } else if (activeTab === "campaigns") {
      loadCampaigns();
      loadTemplates(); // Load templates to use as presets
      const campaignPoller = setInterval(loadCampaigns, 5000);
      return () => clearInterval(campaignPoller);
    } else if (activeTab === "templates") {
      loadTemplates();
    } else if (activeTab === "rules") {
      loadRules();
    }
  }, [activeTab]);

  // Handle active status polling when QR modal is open
  useEffect(() => {
    if (showQR) {
      pollIntervalRef.current = setInterval(async () => {
        try {
          const res = await fetch("/api/whatsapp/status");
          const result = await res.json();
          if (res.ok && result.success) {
            setGatewayStatus(result.data.status);
            if (result.data.status === "CONNECTED") {
              setIsConnected(true);
              setShowQR(false);
              setSuccessMsg("WhatsApp connected successfully!");
              stopPolling();
            }
          }
        } catch (e) {
          console.error(e);
        }
      }, 3000);
    } else {
      stopPolling();
    }

    return () => stopPolling();
  }, [showQR]);

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const checkConnectionStatus = async () => {
    if (!gatewayUrl) {
      setIsConnected(false);
      setGatewayStatus("DISCONNECTED");
      return;
    }
    try {
      const res = await fetch("/api/whatsapp/status");
      const result = await res.json();
      if (res.ok && result.success) {
        setGatewayStatus(result.data.status);
        setIsConnected(result.data.status === "CONNECTED");
      }
    } catch (e) {
      setIsConnected(false);
    }
  };

  // Fetch incoming replies (inbox)
  const loadInbox = async () => {
    setIsLoadingInbox(true);
    try {
      const messagesRes = await fetch("/api/whatsapp/messages");
      const result = await messagesRes.json();
      if (messagesRes.ok && result.success) {
        setInboxMessages(result.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingInbox(false);
    }
  };

  // Fetch campaigns
  const loadCampaigns = async () => {
    setIsLoadingCampaigns(true);
    try {
      const res = await fetch("/api/whatsapp/campaigns");
      const result = await res.json();
      if (res.ok && result.success) {
        setCampaigns(result.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingCampaigns(false);
    }
  };

  // Fetch custom templates
  const loadTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const res = await fetch("/api/whatsapp/templates");
      const result = await res.json();
      if (res.ok && result.success) {
        setCustomTemplates(result.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  // Fetch chatbot auto-responder rules
  const loadRules = async () => {
    setIsLoadingRules(true);
    try {
      const res = await fetch("/api/whatsapp/rules");
      const result = await res.json();
      if (res.ok && result.success) {
        setRules(result.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingRules(false);
    }
  };

  // Fetch logs history
  const refreshLogs = async () => {
    try {
      const res = await fetch("/api/whatsapp/logs");
      const result = await res.json();
      if (res.ok && result.success) {
        setLogs(result.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Save Config
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setConfigSuccess("");
    try {
      const res = await fetch("/api/whatsapp/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gatewayUrl }),
      });
      if (res.ok) {
        setConfigSuccess("Gateway configuration saved!");
        checkConnectionStatus();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Fetch real QR code from proxy API
  const handleLoadQr = async () => {
    if (!gatewayUrl) {
      setQrError("Please configure and save your WhatsApp Gateway URL first in the settings panel below.");
      setShowQR(true);
      return;
    }

    setShowQR(true);
    setIsLoadingQr(true);
    setQrError("");
    setQrCodeData("");

    try {
      const res = await fetch("/api/whatsapp/qr");
      const result = await res.json();
      if (res.ok && result.success) {
        setQrCodeData(result.data.qr);
      } else {
        setQrError(result.message || "Failed to fetch QR code from your gateway.");
      }
    } catch (err) {
      setQrError("Failed to connect to gateway proxy server.");
    } finally {
      setIsLoadingQr(false);
    }
  };

  // Trigger test send
  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone || !testMessage) return;

    setIsSending(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: testPhone, message: testMessage }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setSuccessMsg("Test alert sent successfully! Check delivery history below.");
        setTestMessage("");
        refreshLogs();
      } else {
        setErrorMsg(result.message || "Failed to send message.");
      }
    } catch (err) {
      setErrorMsg("Network request failed.");
    } finally {
      setIsSending(false);
    }
  };

  // Parse CSV file upload client-side
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvSuccessMsg("");
    setCsvErrorMsg("");

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      try {
        const lines = text.split("\n");
        const parsed: Array<{ name: string; phone: string; company?: string; var1?: string; var2?: string; var3?: string }> = [];
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const parts = line.split(",").map(p => p.trim());
          if (parts.length >= 2) {
            const name = parts[0];
            const phone = parts[1];
            const company = parts[2] || "";
            const var1 = parts[3] || "";
            const var2 = parts[4] || "";
            const var3 = parts[5] || "";
            
            if (phone.length >= 8) {
              parsed.push({ name, phone, company, var1, var2, var3 });
            }
          }
        }
        
        if (parsed.length > 0) {
          setCustomList(parsed);
          setCsvSuccessMsg(`Loaded ${parsed.length} contacts with variables from CSV!`);
        } else {
          setCsvErrorMsg("No valid rows found. Ensure format is: Name,Phone,Company,Var1,Var2,Var3");
        }
      } catch (err) {
        setCsvErrorMsg("Failed to read CSV. Verify format.");
      }
    };
    reader.readAsText(file);
  };

  // Parse manual text numbers block
  const handleManualParse = () => {
    if (!manualText.trim()) return;
    
    setCsvSuccessMsg("");
    setCsvErrorMsg("");

    try {
      const lines = manualText.split("\n");
      const parsed: Array<{ name: string; phone: string; company?: string; var1?: string; var2?: string; var3?: string }> = [];

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        const parts = trimmed.split(",").map(p => p.trim());
        if (parts.length >= 2) {
          const name = parts[0];
          const phone = parts[1];
          const company = parts[2] || "";
          const var1 = parts[3] || "";
          const var2 = parts[4] || "";
          const var3 = parts[5] || "";
          if (phone.length >= 8) {
            parsed.push({ name, phone, company, var1, var2, var3 });
          }
        }
      }

      if (parsed.length > 0) {
        setCustomList(parsed);
        setCsvSuccessMsg(`Added ${parsed.length} manual contacts with variables!`);
      } else {
        setCsvErrorMsg("Could not parse contacts. Check format: Name,Phone,Company,Var1,Var2,Var3");
      }
    } catch (err) {
      setCsvErrorMsg("Error parsing inputs.");
    }
  };

  // Create Campaign
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campName || !campTemplate) return;

    let finalCustomContacts = customList;
    if (campTargetType === "Custom" && finalCustomContacts.length === 0) {
      alert("Please upload a CSV or add manual numbers first.");
      return;
    }

    setIsCreatingCampaign(true);
    try {
      const res = await fetch("/api/whatsapp/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: campName,
          targetType: campTargetType,
          templateText: campTemplate,
          mediaUrl: campMediaUrl,
          customContacts: campTargetType === "Custom" ? finalCustomContacts : undefined
        }),
      });

      if (res.ok) {
        setShowCampaignModal(false);
        setCampName("");
        setCampMediaUrl("");
        setCustomList([]);
        setManualText("");
        setCsvSuccessMsg("");
        loadCampaigns();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreatingCampaign(false);
    }
  };

  // Run Campaign
  const handleRunCampaign = async (campaignId: string) => {
    try {
      await fetch("/api/whatsapp/campaigns/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId }),
      });
      loadCampaigns();
    } catch (err) {
      console.error(err);
    }
  };

  // Create Template
  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tplName || !tplText) return;

    setIsSavingTemplate(true);
    try {
      const res = await fetch("/api/whatsapp/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: tplName, templateText: tplText, mediaUrl: tplMediaUrl }),
      });
      if (res.ok) {
        setShowTemplateModal(false);
        setTplName("");
        setTplText("");
        setTplMediaUrl("");
        loadTemplates();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingTemplate(false);
    }
  };

  // Delete Template
  const handleDeleteTemplate = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this template?")) return;
    try {
      await fetch(`/api/whatsapp/templates/${id}`, { method: "DELETE" });
      loadTemplates();
    } catch (err) {
      console.error(err);
    }
  };

  // Create Auto-responder Rule
  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleKeyword || !ruleReply) return;

    setIsSavingRule(true);
    try {
      const res = await fetch("/api/whatsapp/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: ruleKeyword, replyText: ruleReply, mediaUrl: ruleMediaUrl }),
      });
      if (res.ok) {
        setShowRuleModal(false);
        setRuleKeyword("");
        setRuleReply("");
        setRuleMediaUrl("");
        loadRules();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingRule(false);
    }
  };

  // Toggle Rule Status
  const handleToggleRule = async (rule: WhatsappRuleRecord) => {
    try {
      await fetch(`/api/whatsapp/rules/${rule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !rule.isActive }),
      });
      loadRules();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Rule
  const handleDeleteRule = async (id: string) => {
    if (!window.confirm("Delete this chatbot trigger rule?")) return;
    try {
      await fetch(`/api/whatsapp/rules/${id}`, { method: "DELETE" });
      loadRules();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        eyebrow="Integrations"
        title="WhatsApp Control Center"
        description="Launch marketing broadcast campaigns, connect your business number, configure auto-responder rules, and review replies."
      />

      {/* 1. Status Tab content */}
      {activeTab === "status" && (
        <>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <div className="space-y-6">
              {/* Connection Status Card */}
              <Card className="relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-fog">Connection Status</span>
                    <div className="flex items-center gap-2 mt-2">
                      <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}></div>
                      <h3 className="text-xl font-bold text-black">
                        {isConnected ? "Connected & Active" : `Disconnected (${gatewayStatus})`}
                      </h3>
                    </div>
                    <p className="text-xs text-fog mt-2 max-w-[280px]">
                      {isConnected 
                        ? "Outgoing notifications are actively processing. WhatsApp session is authenticated."
                        : "Connect your WhatsApp number via the QR scanner to start sending transactional templates."}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${isConnected ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                    <Wifi size={20} />
                  </div>
                </div>

                <div className="mt-5 border-t border-line pt-4 flex gap-3">
                  {!isConnected ? (
                    <Button onClick={handleLoadQr} className="flex-1">
                      <QrCode size={15} className="mr-1.5" />
                      Link WhatsApp Account
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={async () => {
                        if (window.confirm("Disconnect your WhatsApp session? A fresh QR code will be generated automatically.")) {
                          try {
                            await fetch("/api/whatsapp/reset", { method: "POST" });
                          } catch (e) { console.error(e); }
                          setIsConnected(false);
                          setGatewayStatus("DISCONNECTED");
                          setQrCodeData("");
                          setTimeout(() => handleLoadQr(), 3000);
                        }
                      }}
                      className="flex-1 text-red-600 hover:bg-red-50"
                    >
                      Disconnect & Relink
                    </Button>
                  )}
                </div>
              </Card>

              {/* QR Code link modal scanner */}
              {showQR && (
                <Card className="p-5 flex flex-col items-center justify-center border-amber-200/50 bg-amber-50/20 text-center space-y-4">
                  <h4 className="text-sm font-bold text-black">Link Business WhatsApp</h4>
                  <p className="text-xs text-fog max-w-xs">
                    Open WhatsApp on your phone, tap **Linked Devices**, and scan this QR code.
                  </p>
                  
                  <div className="relative w-44 h-44 bg-white border border-line rounded-xl flex items-center justify-center shadow-inner overflow-hidden p-2">
                    {isLoadingQr ? (
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <RefreshCw className="animate-spin text-fog" size={24} />
                        <span className="text-[10px] text-fog font-medium">Fetching QR Code...</span>
                      </div>
                    ) : qrError ? (
                      <div className="p-3 text-red-600 flex flex-col items-center space-y-1">
                        <AlertTriangle size={20} />
                        <span className="text-[9px] font-semibold leading-relaxed">{qrError}</span>
                      </div>
                    ) : qrCodeData ? (
                      <img
                        src={qrCodeData.startsWith("data:")
                          ? qrCodeData 
                          : `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrCodeData)}&size=200x200`
                        }
                        alt="WhatsApp Pairing QR Code"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <QrCode size={120} className="text-fog" />
                    )}
                  </div>

                  <div className="text-xs font-semibold text-black uppercase tracking-wider font-mono bg-mist px-3 py-1 rounded-full animate-pulse">
                    Status: {gatewayStatus}
                  </div>

                  <div className="flex gap-2 w-full pt-2">
                    <Button variant="secondary" className="flex-1" onClick={() => { setShowQR(false); stopPolling(); }}>
                      Close Scanner
                    </Button>
                    <Button variant="secondary" className="px-3" onClick={handleLoadQr} disabled={isLoadingQr}>
                      <RefreshCw size={14} className={isLoadingQr ? "animate-spin" : ""} />
                    </Button>
                  </div>
                </Card>
              )}

              {/* Gateway settings */}
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <Settings size={16} className="text-black" />
                  <h4 className="text-sm font-bold text-black uppercase tracking-wider font-mono">Gateway Settings</h4>
                </div>

                <form onSubmit={handleSaveConfig} className="space-y-4">
                  <FieldGroup>
                    <FieldLabel htmlFor="wa-gateway">Local/Railway API Gateway URL</FieldLabel>
                    <TextInput
                      id="wa-gateway"
                      placeholder="e.g. https://whatsapp-gateway.up.railway.app"
                      value={gatewayUrl}
                      onChange={(e) => setGatewayUrl(e.target.value)}
                      required
                    />
                    <p className="text-[10px] text-fog leading-relaxed">
                      Enter your self-hosted Node/Express Gateway URL which holds the persistent WhatsApp socket pairing.
                    </p>
                  </FieldGroup>

                  {configSuccess && (
                    <p className="text-xs text-emerald-600 font-semibold">{configSuccess}</p>
                  )}

                  <Button type="submit" disabled={isSaving} className="w-full">
                    {isSaving ? "Saving Config..." : "Save Endpoint"}
                  </Button>
                </form>
              </Card>
            </div>

            {/* Test transmission */}
            <div className="space-y-6">
              <Card className="h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Zap size={16} className="text-black" />
                    <h4 className="text-sm font-bold text-black uppercase tracking-wider font-mono">Test Transmit Console</h4>
                  </div>
                  <p className="text-xs text-fog mb-5">
                    Send a custom text template immediately through your connected number to verify integrations.
                  </p>

                  <form onSubmit={handleSendTest} className="space-y-4">
                    <FieldGroup>
                      <FieldLabel htmlFor="wa-test-phone">Recipient Phone (with Country Code)</FieldLabel>
                      <TextInput
                        id="wa-test-phone"
                        placeholder="e.g. +919999999999"
                        value={testPhone}
                        onChange={(e) => setTestPhone(e.target.value)}
                        required
                      />
                    </FieldGroup>
                    <FieldGroup>
                      <FieldLabel htmlFor="wa-test-message">Message text</FieldLabel>
                      <TextArea
                        id="wa-test-message"
                        placeholder="Type your alert text here..."
                        value={testMessage}
                        onChange={(e) => setTestMessage(e.target.value)}
                        required
                      />
                    </FieldGroup>

                    {successMsg && (
                      <div className="rounded-[12px] border border-emerald-100 bg-emerald-50 text-emerald-800 p-3 text-xs">
                        {successMsg}
                      </div>
                    )}

                    {errorMsg && (
                      <div className="rounded-[12px] border border-red-100 bg-red-50 text-red-800 p-3 text-xs">
                        {errorMsg}
                      </div>
                    )}

                    <Button type="submit" disabled={isSending || !testPhone || !testMessage} className="w-full">
                      {isSending ? "Sending message..." : "Transmit WhatsApp Alert"}
                    </Button>
                  </form>
                </div>
              </Card>
            </div>
          </div>

          {/* Outgoing Logs History */}
          <div className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History size={16} className="text-black" />
                <h4 className="text-sm font-bold text-black uppercase tracking-wider font-mono">Alert Transmission History</h4>
              </div>
              <Button variant="secondary" className="h-9 px-3" onClick={refreshLogs}>
                <RefreshCw size={13} className="mr-1.5" />
                Refresh Logs
              </Button>
            </div>

            {logs.length > 0 ? (
              <DataTable
                data={logs}
                emptyMessage="No transmission history found."
                columns={[
                  {
                    key: "recipient",
                    header: "Recipient",
                    render: (log) => (
                      <div>
                        <p className="font-semibold text-black">{log.recipientName}</p>
                        <p className="text-xs text-fog font-mono">{log.recipientPhone}</p>
                      </div>
                    ),
                  },
                  {
                    key: "message",
                    header: "Message Body",
                    render: (log) => (
                      <p className="text-xs text-black max-w-[280px] truncate" title={log.message}>
                        {log.message}
                      </p>
                    ),
                  },
                  {
                    key: "type",
                    header: "Template Type",
                    render: (log) => (
                      <Badge tone="neutral">
                        {log.type.toUpperCase()}
                      </Badge>
                    ),
                  },
                  {
                    key: "status",
                    header: "Delivery Status",
                    render: (log) => (
                      <Badge tone={log.status === "Sent" ? "success" : "danger"}>
                        {log.status === "Sent" ? "Delivered" : "Failed"}
                      </Badge>
                    ),
                  },
                  {
                    key: "createdAt",
                    header: "Transmitted",
                    render: (log) => formatDate(log.createdAt),
                  },
                ]}
              />
            ) : (
              <EmptyState
                title="No alert transmission history found"
                description="Linked devices will log outgoing templates here."
              />
            )}
          </div>
        </>
      )}

      {/* 2. Inbox Tab content */}
      {activeTab === "inbox" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-black uppercase tracking-wider font-mono">Real-time Replies Inbox</h4>
            <Button variant="secondary" className="h-9 px-3" onClick={loadInbox} disabled={isLoadingInbox}>
              <RefreshCw size={13} className={`mr-1.5 ${isLoadingInbox ? "animate-spin" : ""}`} />
              Refresh Replies
            </Button>
          </div>

          {inboxMessages.length > 0 ? (
            <DataTable
              data={inboxMessages}
              emptyMessage="No replies found."
              columns={[
                {
                  key: "sender",
                  header: "Sender",
                  render: (m) => (
                    <div>
                      <p className="font-semibold text-black">{m.senderName}</p>
                      <p className="text-xs text-fog font-mono">+{m.senderPhone}</p>
                    </div>
                  ),
                },
                {
                  key: "messageText",
                  header: "Message Reply",
                  render: (m) => (
                    <div className="bg-mist/30 border border-line rounded-[12px] p-2.5 max-w-[400px]">
                      <p className="text-xs text-black whitespace-pre-wrap">{m.messageText}</p>
                    </div>
                  ),
                },
                {
                  key: "timestamp",
                  header: "Received Date",
                  render: (m) => formatDate(m.timestamp),
                },
              ]}
            />
          ) : (
            <EmptyState
              title="No incoming replies found"
              description="Replies received on your linked WhatsApp account will appear here dynamically in real-time."
            />
          )}
        </div>
      )}

      {/* 3. Campaigns Tab content */}
      {activeTab === "campaigns" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-black uppercase tracking-wider font-mono">Bulk Broadcasters</h4>
              <p className="text-xs text-fog mt-1">Design templates with media attachments and broadcast them for free.</p>
            </div>
            <Button onClick={() => setShowCampaignModal(true)}>
              <Megaphone size={14} className="mr-1.5" />
              New Broadcast Campaign
            </Button>
          </div>

          {campaigns.length > 0 ? (
            <DataTable
              data={campaigns}
              emptyMessage="No broadcast campaigns created."
              columns={[
                {
                  key: "name",
                  header: "Campaign Name",
                  render: (c) => (
                    <div>
                      <p className="font-bold text-black">{c.name}</p>
                      <p className="text-[10px] text-fog font-mono">Created {formatDate(c.createdAt)}</p>
                    </div>
                  ),
                },
                {
                  key: "template",
                  header: "Message Template",
                  render: (c) => (
                    <div className="max-w-[280px]">
                      <p className="text-xs text-black truncate" title={c.templateText}>{c.templateText}</p>
                      {c.mediaUrl && (
                        <p className="text-[9px] text-emerald-600 font-semibold truncate mt-1">Image Attachment: {c.mediaUrl}</p>
                      )}
                    </div>
                  ),
                },
                {
                  key: "targetType",
                  header: "Audience Type",
                  render: (c) => (
                    <Badge tone="neutral">{c.targetType.toUpperCase()}</Badge>
                  ),
                },
                {
                  key: "progress",
                  header: "Delivery Progress",
                  render: (c) => {
                    const percent = c.totalCount > 0 ? Math.round((c.sentCount / c.totalCount) * 100) : 0;
                    return (
                      <div className="w-[140px] space-y-1">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span>{c.sentCount} / {c.totalCount} sent</span>
                          <span className="font-bold">{percent}%</span>
                        </div>
                        <div className="w-full bg-mist rounded-full h-1.5 overflow-hidden border border-line">
                          <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    );
                  },
                },
                {
                  key: "status",
                  header: "Status",
                  render: (c) => (
                    <Badge tone={c.status === "Completed" ? "success" : c.status === "Running" ? "info" : "neutral"}>
                      {c.status}
                    </Badge>
                  ),
                },
                {
                  key: "actions",
                  header: "Actions",
                  render: (c) => (
                    <div className="flex gap-2">
                      {c.status !== "Running" && c.status !== "Completed" ? (
                        <Button
                          variant="primary"
                          className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => handleRunCampaign(c.id)}
                        >
                          <Send size={11} className="mr-1" />
                          Launch
                        </Button>
                      ) : (
                        <Button variant="secondary" className="h-8 px-3 text-xs" disabled>
                          Launched
                        </Button>
                      )}
                    </div>
                  ),
                },
              ]}
            />
          ) : (
            <EmptyState
              title="No broadcast campaigns created"
              description="Create a bulk campaign draft, configure target parameters, and send media alerts."
            />
          )}

          {/* New Campaign Creation Modal */}
          <Modal
            open={showCampaignModal}
            onClose={() => setShowCampaignModal(false)}
            title="Create Marketing Campaign"
            description="Create custom broadcasts with dynamic fields and send them to your leads or clients."
          >
            <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr] max-w-5xl">
              {/* Form Input fields on left side */}
              <form onSubmit={handleCreateCampaign} className="space-y-4">
                <FieldGroup>
                  <FieldLabel htmlFor="camp-name">Campaign Name</FieldLabel>
                  <TextInput
                    id="camp-name"
                    placeholder="e.g. Diwali Offer 2026"
                    value={campName}
                    onChange={(e) => setCampName(e.target.value)}
                    required
                  />
                </FieldGroup>

                <FieldGroup>
                  <FieldLabel htmlFor="camp-target">Target Audience Group</FieldLabel>
                  <SelectInput
                    id="camp-target"
                    value={campTargetType}
                    onChange={(e) => setCampTargetType(e.target.value as any)}
                  >
                    <option value="Leads">All System Leads</option>
                    <option value="Clients">All System Clients</option>
                    <option value="Custom">Custom List / CSV Upload</option>
                  </SelectInput>
                </FieldGroup>

                {/* Conditional Custom Contacts upload block */}
                {campTargetType === "Custom" && (
                  <div className="rounded-[16px] border border-line bg-mist/35 p-4 space-y-4">
                    <div className="flex flex-col gap-2">
                      <FieldLabel htmlFor="camp-csv">Option A: Upload Contacts CSV</FieldLabel>
                      <div className="flex items-center gap-2 border border-dashed border-line rounded-[12px] bg-white p-3">
                        <Upload size={16} className="text-fog" />
                        <input
                          id="camp-csv"
                          type="file"
                          accept=".csv"
                          onChange={handleCsvUpload}
                          className="text-xs text-fog"
                        />
                      </div>
                      <p className="text-[9px] text-fog leading-relaxed">CSV structure: **Name,Phone,Company** (one row per line).</p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <FieldLabel htmlFor="camp-manual">Option B: Manual Contacts Entry</FieldLabel>
                      <TextArea
                        id="camp-manual"
                        placeholder="e.g.&#10;Ankit Kumar,+919999999999,Probase&#10;Sophia Carter,+918888888888,Northstar"
                        value={manualText}
                        onChange={(e) => setManualText(e.target.value)}
                        className="text-xs min-h-[70px]"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        className="self-end text-xs h-8 py-0 px-3"
                        onClick={handleManualParse}
                      >
                        <Plus size={11} className="mr-1" />
                        Parse Manual Entries
                      </Button>
                    </div>

                    {csvSuccessMsg && (
                      <p className="text-xs text-emerald-600 font-bold">{csvSuccessMsg}</p>
                    )}
                    {csvErrorMsg && (
                      <p className="text-xs text-red-600 font-bold">{csvErrorMsg}</p>
                    )}
                  </div>
                )}

                <FieldGroup>
                  <FieldLabel htmlFor="camp-media">Brochure/Image URL (Optional)</FieldLabel>
                  <TextInput
                    id="camp-media"
                    placeholder="e.g. https://domain.com/brochure.png"
                    value={campMediaUrl}
                    onChange={(e) => setCampMediaUrl(e.target.value)}
                  />
                  <div className="mt-2 space-y-1.5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Or select a pre-designed asset graphic:</span>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                      {STOCK_ASSETS.map((asset) => (
                        <button
                          key={asset.url}
                          type="button"
                          onClick={() => setCampMediaUrl(asset.url)}
                          className={cn(
                            "relative h-12 rounded-lg overflow-hidden border border-line text-left transition hover:opacity-85 outline-none focus:outline-none",
                            campMediaUrl === asset.url ? "ring-2 ring-emerald-500 border-transparent" : "border-line"
                          )}
                          title={asset.name}
                        >
                          <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-end p-1">
                            <span className="text-[8px] font-bold text-white truncate w-full leading-none">{asset.name.split(" ")[1]}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </FieldGroup>

                <FieldGroup>
                  <div className="flex justify-between items-center">
                    <FieldLabel htmlFor="camp-template">Message Template</FieldLabel>
                    <div className="flex gap-1 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setCampTemplate(prev => prev + " {{name}}")}
                        className="text-[9px] bg-mist border border-line rounded px-1.5 py-0.5 hover:bg-line text-black font-mono"
                      >
                        + Name
                      </button>
                      <button
                        type="button"
                        onClick={() => setCampTemplate(prev => prev + " {{company}}")}
                        className="text-[9px] bg-mist border border-line rounded px-1.5 py-0.5 hover:bg-line text-black font-mono"
                      >
                        + Company
                      </button>
                      <button
                        type="button"
                        onClick={() => setCampTemplate(prev => prev + " {{var1}}")}
                        className="text-[9px] bg-mist border border-line rounded px-1.5 py-0.5 hover:bg-line text-black font-mono"
                      >
                        + Var1
                      </button>
                      <button
                        type="button"
                        onClick={() => setCampTemplate(prev => prev + " {{var2}}")}
                        className="text-[9px] bg-mist border border-line rounded px-1.5 py-0.5 hover:bg-line text-black font-mono"
                      >
                        + Var2
                      </button>
                      <button
                        type="button"
                        onClick={() => setCampTemplate(prev => prev + " {{var3}}")}
                        className="text-[9px] bg-mist border border-line rounded px-1.5 py-0.5 hover:bg-line text-black font-mono"
                      >
                        + Var3
                      </button>
                    </div>
                  </div>
                  <TextArea
                    id="camp-template"
                    placeholder="Design your broadcast template..."
                    value={campTemplate}
                    onChange={(e) => setCampTemplate(e.target.value)}
                    required
                    className="min-h-[100px]"
                  />
                </FieldGroup>

                {/* Presets template selector (Combining static and database custom templates!) */}
                <FieldGroup>
                  <FieldLabel htmlFor="camp-preset">Or load template preset</FieldLabel>
                  <SelectInput
                    id="camp-preset"
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.startsWith("db_")) {
                        const tplId = val.replace("db_", "");
                        const found = customTemplates.find(t => t.id === tplId);
                        if (found) {
                          setCampTemplate(found.templateText);
                          setCampMediaUrl(found.mediaUrl || "");
                        }
                      } else {
                        const idx = Number(val);
                        if (idx >= 0) {
                          setCampTemplate(PRESETS[idx].templateText);
                          setCampMediaUrl(PRESETS[idx].mediaUrl);
                        }
                      }
                    }}
                  >
                    <option value="-1">Select preset...</option>
                    {Array.from(new Set(PRESETS.map(p => p.category))).map(cat => (
                      <optgroup key={cat} label={`System Defaults: ${cat}`}>
                        {PRESETS.map((preset, i) => {
                          if (preset.category !== cat) return null;
                          return (
                            <option key={i} value={i}>
                              {preset.name}
                            </option>
                          );
                        })}
                      </optgroup>
                    ))}
                    {customTemplates.length > 0 && (
                      <optgroup label="My Templates Library">
                        {customTemplates.map((t) => (
                          <option key={t.id} value={`db_${t.id}`}>
                            {t.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </SelectInput>
                </FieldGroup>

                <div className="flex justify-end gap-3 border-t border-line pt-4">
                  <Button variant="secondary" type="button" onClick={() => setShowCampaignModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreatingCampaign}>
                    {isCreatingCampaign ? "Saving..." : "Create Campaign"}
                  </Button>
                </div>
              </form>

              {/* WhatsApp live preview mockup card on right side */}
              <div className="border-l border-line pl-6 flex flex-col justify-start">
                <span className="text-[10px] font-mono uppercase tracking-wider text-fog block mb-3">WhatsApp Live Preview Mockup</span>
                
                {/* Live Mockup smartphone wrapper */}
                <div className="border border-line rounded-[24px] bg-[#efeae2] p-4 w-full max-w-[280px] shadow-sm space-y-3 min-h-[380px] flex flex-col justify-start">
                  
                  {/* WhatsApp chat screen top header */}
                  <div className="flex items-center gap-2 border-b border-line bg-white/70 backdrop-blur-sm p-2 rounded-t-[16px] -mx-4 -mt-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-800">
                      PS
                    </div>
                    <div>
                      <h5 className="text-[11px] font-bold text-black leading-none">Probase Solutions</h5>
                      <span className="text-[8px] text-emerald-600 font-semibold leading-none">online</span>
                    </div>
                  </div>

                  {/* Visual mockup message bubble */}
                  <div className="bg-white rounded-xl rounded-tl-none p-3 text-[11px] text-black shadow-sm border border-line leading-relaxed max-w-[90%] self-start relative">
                    {/* Media image preview if URL exists */}
                    {campMediaUrl && (
                      <div className="rounded-lg overflow-hidden border border-line mb-2 max-h-[140px] bg-mist flex items-center justify-center">
                        <img
                          src={campMediaUrl}
                          alt="Brochure Attachment"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>
                    )}
                    
                    <p className="whitespace-pre-wrap leading-relaxed text-[11px]">
                      {campTemplate 
                        ? campTemplate
                            .replace(/\{\{name\}\}/gi, "John Doe")
                            .replace(/\{\{company\}\}/gi, "Acme Corp")
                            .replace(/\{\{phone\}\}/gi, "+919999999999")
                            .replace(/\{\{var1\}\}/gi, "Value A")
                            .replace(/\{\{var2\}\}/gi, "Value B")
                            .replace(/\{\{var3\}\}/gi, "Value C")
                        : "Template preview will dynamically load here..."}
                    </p>
                    
                    <span className="text-[8px] text-fog text-right block mt-1 font-mono">10:42 AM</span>
                  </div>
                </div>
              </div>
            </div>
          </Modal>
        </div>
      )}

      {/* 4. Templates Tab Content */}
      {activeTab === "templates" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-black uppercase tracking-wider font-mono">My Custom Templates Library</h4>
              <p className="text-xs text-fog mt-1">Add, edit, or delete reusable campaign templates.</p>
            </div>
            <Button onClick={() => setShowTemplateModal(true)}>
              <FolderHeart size={14} className="mr-1.5" />
              Save New Template
            </Button>
          </div>

          {customTemplates.length > 0 ? (
            <DataTable
              data={customTemplates}
              emptyMessage="No custom templates found."
              columns={[
                {
                  key: "name",
                  header: "Template Name",
                  render: (t) => <p className="font-bold text-black">{t.name}</p>,
                },
                {
                  key: "templateText",
                  header: "Template Content",
                  render: (t) => (
                    <div className="max-w-[400px]">
                      <p className="text-xs text-black whitespace-pre-wrap">{t.templateText}</p>
                    </div>
                  ),
                },
                {
                  key: "media",
                  header: "Attachment URL",
                  render: (t) => (
                    <p className="text-xs text-fog max-w-[180px] truncate" title={t.mediaUrl}>
                      {t.mediaUrl || "None"}
                    </p>
                  ),
                },
                {
                  key: "actions",
                  header: "Actions",
                  render: (t) => (
                    <Button variant="secondary" className="text-red-600 hover:bg-red-50 h-8 px-2" onClick={() => handleDeleteTemplate(t.id)}>
                      <Trash2 size={13} />
                    </Button>
                  ),
                },
              ]}
            />
          ) : (
            <EmptyState
              title="No templates saved yet"
              description="Save your own text and media templates to access them quickly inside campaign workflows."
            />
          )}

          {/* New Template Modal */}
          <Modal open={showTemplateModal} onClose={() => setShowTemplateModal(false)} title="Save Custom Template">
            <form onSubmit={handleCreateTemplate} className="space-y-4">
              <FieldGroup>
                <FieldLabel htmlFor="tpl-name">Template Name</FieldLabel>
                <TextInput id="tpl-name" placeholder="e.g. Sales Followup Pitch" value={tplName} onChange={(e) => setTplName(e.target.value)} required />
              </FieldGroup>
              <FieldGroup>
                <FieldLabel htmlFor="tpl-media">Image URL (Optional)</FieldLabel>
                <TextInput id="tpl-media" placeholder="e.g. https://domain.com/brochure.png" value={tplMediaUrl} onChange={(e) => setTplMediaUrl(e.target.value)} />
                <div className="mt-2 space-y-1.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Or select a pre-designed asset graphic:</span>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {STOCK_ASSETS.map((asset) => (
                      <button
                        key={asset.url}
                        type="button"
                        onClick={() => setTplMediaUrl(asset.url)}
                        className={cn(
                          "relative h-12 rounded-lg overflow-hidden border border-line text-left transition hover:opacity-85 outline-none focus:outline-none",
                          tplMediaUrl === asset.url ? "ring-2 ring-emerald-500 border-transparent" : "border-line"
                        )}
                        title={asset.name}
                      >
                        <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-end p-1">
                          <span className="text-[8px] font-bold text-white truncate w-full leading-none">{asset.name.split(" ")[1]}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </FieldGroup>
              <FieldGroup>
                <div className="flex justify-between items-center">
                  <FieldLabel htmlFor="tpl-text">Template Content</FieldLabel>
                  <div className="flex gap-1 flex-wrap">
                    <button type="button" onClick={() => setTplText(prev => prev + " {{name}}")} className="text-[9px] bg-mist border border-line rounded px-1.5 py-0.5 hover:bg-line font-mono">+ Name</button>
                    <button type="button" onClick={() => setTplText(prev => prev + " {{company}}")} className="text-[9px] bg-mist border border-line rounded px-1.5 py-0.5 hover:bg-line font-mono">+ Company</button>
                    <button type="button" onClick={() => setTplText(prev => prev + " {{var1}}")} className="text-[9px] bg-mist border border-line rounded px-1.5 py-0.5 hover:bg-line font-mono">+ Var1</button>
                    <button type="button" onClick={() => setTplText(prev => prev + " {{var2}}")} className="text-[9px] bg-mist border border-line rounded px-1.5 py-0.5 hover:bg-line font-mono">+ Var2</button>
                    <button type="button" onClick={() => setTplText(prev => prev + " {{var3}}")} className="text-[9px] bg-mist border border-line rounded px-1.5 py-0.5 hover:bg-line font-mono">+ Var3</button>
                  </div>
                </div>
                <TextArea id="tpl-text" placeholder="Design your templates here..." value={tplText} onChange={(e) => setTplText(e.target.value)} required />
              </FieldGroup>
              <div className="flex justify-end gap-3 pt-4 border-t border-line">
                <Button variant="secondary" type="button" onClick={() => setShowTemplateModal(false)}>Cancel</Button>
                <Button type="submit" disabled={isSavingTemplate}>{isSavingTemplate ? "Saving..." : "Save Template"}</Button>
              </div>
            </form>
          </Modal>
        </div>
      )}

      {/* 5. Rules Tab Content */}
      {activeTab === "rules" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-black uppercase tracking-wider font-mono">Chatbot Auto-Responder Triggers</h4>
              <p className="text-xs text-fog mt-1">Configure keyword matcher triggers. Incoming replies matching keywords will get auto-replies instantly.</p>
            </div>
            <Button onClick={() => setShowRuleModal(true)}>
              <Bot size={14} className="mr-1.5" />
              Add Responder Rule
            </Button>
          </div>

          {rules.length > 0 ? (
            <DataTable
              data={rules}
              emptyMessage="No responder rules found."
              columns={[
                {
                  key: "keyword",
                  header: "Trigger Keyword",
                  render: (r) => (
                    <Badge tone="neutral">
                      {r.keyword.toUpperCase()}
                    </Badge>
                  ),
                },
                {
                  key: "reply",
                  header: "Automated Reply Content",
                  render: (r) => (
                    <div className="max-w-[350px]">
                      <p className="text-xs text-black whitespace-pre-wrap">{r.replyText}</p>
                      {r.mediaUrl && (
                        <p className="text-[9px] text-emerald-600 font-semibold mt-1">Image Attachment: {r.mediaUrl}</p>
                      )}
                    </div>
                  ),
                },
                {
                  key: "status",
                  header: "Status",
                  render: (r) => (
                    <button onClick={() => handleToggleRule(r)} className="flex items-center gap-1 hover:opacity-85">
                      <Badge tone={r.isActive ? "success" : "danger"}>
                        {r.isActive ? "Active" : "Disabled"}
                      </Badge>
                    </button>
                  ),
                },
                {
                  key: "actions",
                  header: "Actions",
                  render: (r) => (
                    <Button variant="secondary" className="text-red-600 hover:bg-red-50 h-8 px-2" onClick={() => handleDeleteRule(r.id)}>
                      <Trash2 size={13} />
                    </Button>
                  ),
                },
              ]}
            />
          ) : (
            <EmptyState
              title="No responder rules active"
              description="Create a keyword trigger (like 'pricing' or 'brochure') to automate client messages instantly."
            />
          )}

          {/* New Rule Modal */}
          <Modal open={showRuleModal} onClose={() => setShowRuleModal(false)} title="Add Auto-Responder Rule">
            <form onSubmit={handleCreateRule} className="space-y-4">
              <FieldGroup>
                <FieldLabel htmlFor="rule-key">Trigger Keyword</FieldLabel>
                <TextInput id="rule-key" placeholder="e.g. pricing" value={ruleKeyword} onChange={(e) => setRuleKeyword(e.target.value)} required />
                <p className="text-[9px] text-fog">Triggered whenever incoming text contains this word (case-insensitive).</p>
              </FieldGroup>
              <FieldGroup>
                <FieldLabel htmlFor="rule-media">Image URL Attachment (Optional)</FieldLabel>
                <TextInput id="rule-media" placeholder="e.g. https://domain.com/menu-card.png" value={ruleMediaUrl} onChange={(e) => setRuleMediaUrl(e.target.value)} />
              </FieldGroup>
              <FieldGroup>
                <FieldLabel htmlFor="rule-reply">Automated Reply Message</FieldLabel>
                <TextArea id="rule-reply" placeholder="Type automated chatbot response..." value={ruleReply} onChange={(e) => setRuleReply(e.target.value)} required />
              </FieldGroup>
              <div className="flex justify-end gap-3 pt-4 border-t border-line">
                <Button variant="secondary" type="button" onClick={() => setShowRuleModal(false)}>Cancel</Button>
                <Button type="submit" disabled={isSavingRule}>{isSavingRule ? "Saving..." : "Add Rule"}</Button>
              </div>
            </form>
          </Modal>
        </div>
      )}
    </div>
  );
}
