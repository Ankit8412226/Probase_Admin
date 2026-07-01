"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Settings, Zap, History, RefreshCw, QrCode, Wifi, AlertTriangle } from "lucide-react";
import { DataTable } from "@/components/tables/data-table";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FieldGroup, FieldLabel, FormGrid, TextInput, TextArea } from "@/components/forms/form-primitives";
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
  const [isConnected, setIsConnected] = useState(!!initialConfig.gatewayUrl);
  
  // Test sandbox fields
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Alerts
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [configSuccess, setConfigSuccess] = useState("");

  // Simulated QR linking states
  const [showQR, setShowQR] = useState(false);
  const [linkingStatus, setLinkingStatus] = useState("Scan to Connect");

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
        setConfigSuccess("Gateway configuration updated successfully!");
        setIsConnected(!!gatewayUrl);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
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

  // Simulate QR Code Connection
  const handleSimulateConnection = () => {
    setLinkingStatus("Pairing...");
    setTimeout(() => {
      setIsConnected(true);
      setLinkingStatus("Linked");
      setShowQR(false);
      if (!gatewayUrl) {
        setGatewayUrl("https://simulated-whatsapp-gateway.local");
      }
    }, 2000);
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
                  <h3 className="text-xl font-bold text-black">{isConnected ? "Connected & Active" : "Disconnected"}</h3>
                </div>
                <p className="text-xs text-fog mt-2 max-w-[280px]">
                  {isConnected 
                    ? "Outgoing notifications are actively processing. Connected device: Linked Device."
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
                  onClick={() => {
                    setShowQR(true);
                    setLinkingStatus("Scan to Connect");
                  }}
                  className="flex-1"
                >
                  <QrCode size={15} className="mr-1.5" />
                  Link WhatsApp Account
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => setIsConnected(false)}
                  className="flex-1 text-red-600 hover:bg-red-50"
                >
                  Disconnect Number
                </Button>
              )}
            </div>
          </Card>

          {/* QR Link Popup Simulator */}
          {showQR && (
            <Card className="p-5 flex flex-col items-center justify-center border-amber-200/50 bg-amber-50/20 text-center space-y-4">
              <h4 className="text-sm font-bold text-black">Link Business WhatsApp</h4>
              <p className="text-xs text-fog max-w-xs">
                Open WhatsApp on your phone, go to Linked Devices, and scan this QR code to connect your account.
              </p>
              
              <div className="relative w-36 h-36 bg-white border border-line rounded-xl flex items-center justify-center shadow-inner">
                {/* Visual mock QR representation */}
                <QrCode size={120} className="text-black" />
                <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] flex items-center justify-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-black text-white px-2 py-1 rounded-[8px]">
                    {linkingStatus}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 w-full pt-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowQR(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white border-0"
                  onClick={handleSimulateConnection}
                >
                  Simulate Scan
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
                />
                <p className="text-[10px] text-fog leading-relaxed">
                  Leave empty to run in **Simulated Sandbox mode** (payouts and logs will log locally without launching requests).
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
                <h4 className="text-sm font-bold text-black uppercase tracking-wider font-mono">Test Sandbox Console</h4>
              </div>
              <p className="text-xs text-fog mb-5">
                Execute a custom test template to verify device connectivity and log responses.
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
