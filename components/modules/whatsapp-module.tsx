"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Settings, Zap, History, RefreshCw, QrCode, Wifi, AlertTriangle } from "lucide-react";
import { DataTable } from "@/components/tables/data-table";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FieldGroup, FieldLabel, TextInput, TextArea } from "@/components/forms/form-primitives";
import { formatDate } from "@/lib/utils";
import type { WhatsappLogRecord } from "@/types";

export function WhatsappModule({
  initialLogs,
  initialConfig,
}: {
  initialLogs: WhatsappLogRecord[];
  initialConfig: { gatewayUrl: string };
}) {
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

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check connection status periodically on mount
  useEffect(() => {
    checkConnectionStatus();
    const interval = setInterval(checkConnectionStatus, 10000); // Check status every 10s
    return () => clearInterval(interval);
  }, [gatewayUrl]);

  // Handle active status polling when QR modal is open
  useEffect(() => {
    if (showQR) {
      // Start status check interval every 3 seconds
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

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        eyebrow="Integrations"
        title="WhatsApp Alert Center"
        description="Configure your self-hosted WhatsApp Web session, connect your phone, and review automated transactional alerts."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        {/* Settings & Configuration */}
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
                <Button
                  onClick={handleLoadQr}
                  className="flex-1"
                >
                  <QrCode size={15} className="mr-1.5" />
                  Link WhatsApp Account
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={async () => {
                    if (window.confirm("Disconnect your WhatsApp session?")) {
                      setIsConnected(false);
                      setGatewayStatus("DISCONNECTED");
                    }
                  }}
                  className="flex-1 text-red-600 hover:bg-red-50"
                >
                  Disconnect Number
                </Button>
              )}
            </div>
          </Card>

          {/* Real QR Code Link Panel */}
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
                  // Real base64 QR Code image generated by user's whatsapp gateway!
                  <img
                    src={qrCodeData.startsWith("data:") ? qrCodeData : `data:image/png;base64,${qrCodeData}`}
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
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setShowQR(false);
                    stopPolling();
                  }}
                >
                  Close Scanner
                </Button>
                <Button
                  variant="secondary"
                  className="px-3"
                  onClick={handleLoadQr}
                  disabled={isLoadingQr}
                >
                  <RefreshCw size={14} className={isLoadingQr ? "animate-spin" : ""} />
                </Button>
              </div>
            </Card>
          )}

          {/* Gateway Endpoint Settings */}
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
                  Enter your self-hosted Node/Express Gateway URL which holds the persistent `whatsapp-web.js` or `baileys` QR session client.
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

        {/* Sandbox Test Console */}
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
      <div className="space-y-4">
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
            description="Linked devices will log outgoing invoice and check-in templates here."
          />
        )}
      </div>
    </div>
  );
}
