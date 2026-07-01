"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Settings, Zap, History, RefreshCw, QrCode, Wifi, AlertTriangle, Send, Megaphone, Inbox } from "lucide-react";
import { DataTable } from "@/components/tables/data-table";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FieldGroup, FieldLabel, TextInput, TextArea, SelectInput } from "@/components/forms/form-primitives";
import { Modal } from "@/components/ui/modal";
import { formatDate } from "@/lib/utils";
import type { WhatsappLogRecord, WhatsappMessageRecord, WhatsappCampaignRecord } from "@/types";

export function WhatsappModule({
  initialLogs,
  initialConfig,
}: {
  initialLogs: WhatsappLogRecord[];
  initialConfig: { gatewayUrl: string };
}) {
  const [activeTab, setActiveTab] = useState<"status" | "inbox" | "campaigns">("status");
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

  // New Campaign Form Fields
  const [campName, setCampName] = useState("");
  const [campTargetType, setCampTargetType] = useState<"Leads" | "Clients">("Leads");
  const [campTemplate, setCampTemplate] = useState("Hi {{name}}, we have a special proposal for {{company}}. Let's connect!");
  const [campMediaUrl, setCampMediaUrl] = useState("");

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
      const campaignPoller = setInterval(loadCampaigns, 5000); // Poll campaigns progress
      return () => clearInterval(campaignPoller);
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
      const res = await fetch("/api/whatsapp/logs"); // Fallback check logs
      // Wait, we need an endpoint for messages inbox! We'll create '/api/whatsapp/messages' shortly!
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

  // Create Campaign
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campName || !campTemplate) return;

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
        }),
      });

      if (res.ok) {
        setShowCampaignModal(false);
        setCampName("");
        setCampMediaUrl("");
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

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        eyebrow="Integrations"
        title="WhatsApp Control Center"
        description="Launch marketing broadcast campaigns, connect your business number, and review incoming user replies."
      />

      {/* Tabs Menu Navigation */}
      <div className="flex border-b border-line gap-4">
        <button
          onClick={() => setActiveTab("status")}
          className={`pb-3 text-sm font-semibold tracking-tight transition-all border-b-2 px-1 ${
            activeTab === "status"
              ? "border-black text-black"
              : "border-transparent text-fog hover:text-black"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Settings size={15} />
            Connection & Status
          </div>
        </button>
        <button
          onClick={() => setActiveTab("inbox")}
          className={`pb-3 text-sm font-semibold tracking-tight transition-all border-b-2 px-1 ${
            activeTab === "inbox"
              ? "border-black text-black"
              : "border-transparent text-fog hover:text-black"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Inbox size={15} />
            Chat Inbox (Replies)
          </div>
        </button>
        <button
          onClick={() => setActiveTab("campaigns")}
          className={`pb-3 text-sm font-semibold tracking-tight transition-all border-b-2 px-1 ${
            activeTab === "campaigns"
              ? "border-black text-black"
              : "border-transparent text-fog hover:text-black"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Megaphone size={15} />
            Marketing Campaigns
          </div>
        </button>
      </div>

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
                  <option value="Leads">All Leads</option>
                  <option value="Clients">All Clients</option>
                </SelectInput>
              </FieldGroup>

              <FieldGroup>
                <FieldLabel htmlFor="camp-media">Brochure/Image URL (Optional)</FieldLabel>
                <TextInput
                  id="camp-media"
                  placeholder="e.g. https://domain.com/brochure.png"
                  value={campMediaUrl}
                  onChange={(e) => setCampMediaUrl(e.target.value)}
                />
                <p className="text-[10px] text-fog">Specify a public image link to send as a media card alongside your text template.</p>
              </FieldGroup>

              <FieldGroup>
                <div className="flex justify-between items-center">
                  <FieldLabel htmlFor="camp-template">Message Template</FieldLabel>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCampTemplate(prev => prev + " {{name}}")}
                      className="text-[10px] bg-mist border border-line rounded px-1.5 py-0.5 hover:bg-line text-black font-mono"
                    >
                      + Name
                    </button>
                    <button
                      type="button"
                      onClick={() => setCampTemplate(prev => prev + " {{company}}")}
                      className="text-[10px] bg-mist border border-line rounded px-1.5 py-0.5 hover:bg-line text-black font-mono"
                    >
                      + Company
                    </button>
                  </div>
                </div>
                <TextArea
                  id="camp-template"
                  placeholder="Design your broadcast template..."
                  value={campTemplate}
                  onChange={(e) => setCampTemplate(e.target.value)}
                  required
                  className="min-h-[120px]"
                />
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
          </Modal>
        </div>
      )}
    </div>
  );
}
