"use client";

import { useState, useEffect } from "react";
import { 
  Mail, 
  Settings, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Sparkles, 
  Clock, 
  User, 
  Plus, 
  Eye, 
  BookOpen,
  Check,
  ChevronRight,
  Database
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, MetricCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/tables/data-table";
import { Modal } from "@/components/ui/modal";
import {
  FieldGroup,
  FieldLabel,
  FormGrid,
  SelectInput,
  TextArea,
  TextInput,
} from "@/components/forms/form-primitives";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import type { LeadRecord, ClientRecord, ProjectRecord, InvoiceRecord } from "@/types";

interface SmtpSettings {
  host: string;
  port: string;
  user: string;
  pass: string;
  secure: "SSL/TLS" | "STARTTLS" | "None";
  fromName: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: "pitch" | "objection" | "billing" | "outreach" | "custom";
}

interface EmailLog {
  id: string;
  recipient: string;
  recipientType: "Lead" | "Client";
  subject: string;
  templateName: string;
  sentAt: string;
  status: "Sent" | "Delivered" | "Bounced" | "Opened";
}

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: "tpl_intro_pitch",
    name: "🚀 Premium Pitch & Proposal Invitation",
    category: "pitch",
    subject: "Custom Platform Scope & Architecture Proposal for {CompanyName}",
    body: `Hi {ClientName},

I hope you are doing well. 

Following up on our discussions, I am excited to invite you to review our premium tech implementation proposal for {ProjectName}. We have outlined the full roadmap, architecture diagram, and milestones starting from designs up to production deployment.

You can preview the interactive proposal contract directly in your portal. Here is a summary of the scope we have put together:
• Proposed Engagement: {ProjectName}
• Total Budget Estimate: {BudgetAmount}
• Initial Milestone: Design Sprint Wireframes

Unlike generic agencies, OmniPulse AI provides strict NDA compliance, a 100% in-house senior engineering team, and a 6-month post-launch code warranty.

Please let me know your thoughts or when we can jump on a brief 10-minute walk-through.

Best regards,
{OwnerName}
Enterprise Delivery Lead
OmniPulse AI`
  },
  {
    id: "tpl_objection_freelancer",
    name: "🤝 Why Partner with OmniPulse AI vs Freelancers",
    category: "objection",
    subject: "Why local freelancers cost 3x more in the long run - OmniPulse AI Guarantees",
    body: `Hi {ClientName},

I understand that you are reviewing alternative quotes, including local freelancers, for {ProjectName}. I wanted to share a few critical considerations before you lock in a partner.

While freelancer day-rates seem attractive, custom software built without agency backing carries heavy hidden costs:
1. Code Ownership & Security: Freelancer builds rarely undergo strict logical separation and dependency audits.
2. Delivery Reliability: Over 70% of low-cost custom software builds experience delayed schedules or total abandonment due to single-point-of-failure risks.
3. Code Warranty: OmniPulse AI provides a standard 6-month post-launch technical warranty. Freelancers rarely support post-launch scaling without charging additional fees.

We split all our budgets into strict, reviewable milestones. You only pay for a milestone after you review and approve it on staging.

Let me know if you would like to run a joint technical comparison of our proposals.

Best regards,
{OwnerName}
OmniPulse AI`
  },
  {
    id: "tpl_invoice_alert",
    name: "💰 Milestone Completed & Invoice Release",
    category: "billing",
    subject: "Milestone Completed: Invoice {InvoiceNumber} for {ProjectName}",
    body: `Hi {ClientName},

We have completed the scheduled milestone work for {ProjectName}. 

The staging preview is now live and ready for your review. Below are the details for the milestone installment:
• Completed Milestone: {ProjectName} Phase Installment
• Invoice Number: {InvoiceNumber}
• Amount Due: {InvoiceAmount}
• Due Date: {DueDate}

Please review the preview and let us know if we can proceed to release the PDF invoice, or if you need any adjustments.

Best regards,
{OwnerName}
Billing Operations
OmniPulse AI`
  },
  {
    id: "tpl_cold_outreach",
    name: "✨ Operations & Delivery Capacity Audit",
    category: "outreach",
    subject: "Optimizing operations, team rosters, and payroll for {CompanyName}",
    body: `Hi {ClientName},

I saw {CompanyName}'s recent work and wanted to reach out.

Managing custom project pipelines, employee attendance compliance, and multi-tenant isolation gets complex as team scale. At OmniPulse AI, we help high-efficiency IT services groups automate their command workflows.

We would love to run a free 15-minute operational audit for {CompanyName}. We'll look at:
• Streamlining payroll runs and shift rosters.
• Automated customer proposals and client PDF invoicing.
• WhatsApp CRM websocket alerts.

Are you available for a brief Zoom session next Tuesday at 3 PM?

Best regards,
{OwnerName}
OmniPulse AI`
  }
];

export function EmailModule({
  initialLeads,
  initialClients,
  initialProjects,
  initialInvoices,
}: {
  initialLeads: LeadRecord[];
  initialClients: ClientRecord[];
  initialProjects: ProjectRecord[];
  initialInvoices: InvoiceRecord[];
}) {
  const { user } = useAuth();
  const isEmployee = user?.role === "employee";

  // Tabs: "send", "templates", "settings", "logs"
  const [activeTab, setActiveTab] = useState<"send" | "templates" | "settings" | "logs">("send");
  
  // Custom states
  const [smtp, setSmtp] = useState<SmtpSettings>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("omnipulse_smtp");
      if (saved) return JSON.parse(saved);
    }
    return {
      host: "smtp.gmail.com",
      port: "587",
      user: "sales@mycompany.com",
      pass: "••••••••••••••••",
      secure: "STARTTLS",
      fromName: "Sales Team",
    };
  });
  
  const [templates, setTemplates] = useState<EmailTemplate[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("omnipulse_templates");
      if (saved) return JSON.parse(saved);
    }
    return DEFAULT_TEMPLATES;
  });

  const [logs, setLogs] = useState<EmailLog[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("omnipulse_email_logs");
      if (saved) return JSON.parse(saved);
    }
    return [];
  });

  // SMTP Actions
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [testError, setTestError] = useState("");
  
  // Sender form state
  const [selectedRecipientId, setSelectedRecipientId] = useState("");
  const [recipientType, setRecipientType] = useState<"lead" | "client">("lead");
  const [selectedTemplateId, setSelectedTemplateId] = useState(DEFAULT_TEMPLATES[0].id);
  const [mailSubject, setMailSubject] = useState("");
  const [mailBody, setMailBody] = useState("");
  
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Template editor state
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Omit<EmailTemplate, "id">>({
    name: "",
    subject: "",
    body: "",
    category: "custom"
  });

  // Sync state to local storage
  const saveSmtp = (newSmtp: SmtpSettings) => {
    setSmtp(newSmtp);
    localStorage.setItem("omnipulse_smtp", JSON.stringify(newSmtp));
  };

  const saveTemplates = (newTpls: EmailTemplate[]) => {
    setTemplates(newTpls);
    localStorage.setItem("omnipulse_templates", JSON.stringify(newTpls));
  };

  const addLog = (log: Omit<EmailLog, "id" | "sentAt">) => {
    const newLogs: EmailLog[] = [
      {
        ...log,
        id: `log_${Date.now()}`,
        sentAt: new Date().toISOString(),
      },
      ...logs,
    ];
    setLogs(newLogs);
    localStorage.setItem("omnipulse_email_logs", JSON.stringify(newLogs));
  };

  // Connection tester mock
  function testConnection() {
    if (!smtp.host || !smtp.user || !smtp.pass) {
      setTestStatus("error");
      setTestError("Please fill out SMTP Host, Username and Password.");
      return;
    }
    setTestStatus("testing");
    setTestError("");
    setTimeout(() => {
      if (smtp.host.includes("error")) {
        setTestStatus("error");
        setTestError("SMTP Authentication handshake failed. Invalid password or username.");
      } else {
        setTestStatus("success");
      }
    }, 1500);
  }

  // Pre-fill email data when recipient or template changes
  useEffect(() => {
    const tpl = templates.find((t) => t.id === selectedTemplateId);
    if (!tpl) return;

    let targetName = "Client Representative";
    let targetCompany = "Their Organization";
    let targetProjectName = "Your Scheduled Project";
    let targetBudgetAmount = "₹4,00,000";
    let targetInvoiceNum = "INV-2026-08";
    let targetInvoiceAmount = "₹1,50,000";
    let targetDueDate = "2026-08-15";
    let targetOwnerName = "Sophia Carter";

    if (recipientType === "lead") {
      const lead = initialLeads.find((l) => l.id === selectedRecipientId);
      if (lead) {
        targetName = lead.name;
        targetCompany = lead.name; // Leads typically are organizations
        targetProjectName = lead.name + " Implementation Build";
        targetBudgetAmount = formatCurrency(lead.value);
      }
    } else {
      const client = initialClients.find((c) => c.id === selectedRecipientId);
      if (client) {
        targetName = client.name;
        targetCompany = client.company;
        const project = initialProjects.find((p) => p.clientId === client.id);
        if (project) {
          targetProjectName = project.name;
          targetBudgetAmount = formatCurrency(project.budget);
          const invoice = initialInvoices.find((i) => i.projectId === project.id);
          if (invoice) {
            targetInvoiceNum = invoice.invoiceNumber;
            targetInvoiceAmount = formatCurrency(invoice.amount);
            targetDueDate = formatDate(invoice.dueDate);
          }
        }
      }
    }

    // Replace template tags
    const replaceTags = (text: string) => {
      return text
        .replace(/{ClientName}/g, targetName)
        .replace(/{CompanyName}/g, targetCompany)
        .replace(/{ClientCompany}/g, targetCompany)
        .replace(/{ProjectName}/g, targetProjectName)
        .replace(/{BudgetAmount}/g, targetBudgetAmount)
        .replace(/{InvoiceNumber}/g, targetInvoiceNum)
        .replace(/{InvoiceAmount}/g, targetInvoiceAmount)
        .replace(/{DueDate}/g, targetDueDate)
        .replace(/{OwnerName}/g, targetOwnerName);
    };

    setMailSubject(replaceTags(tpl.subject));
    setMailBody(replaceTags(tpl.body));
  }, [selectedRecipientId, recipientType, selectedTemplateId, templates]);

  // Dispatch campaign
  function handleSendEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRecipientId) {
      alert("Please select a recipient lead or client first.");
      return;
    }
    
    setIsSending(true);
    setSendSuccess(false);

    let recipientEmail = "recipient@myclient.com";
    if (recipientType === "lead") {
      const lead = initialLeads.find((l) => l.id === selectedRecipientId);
      if (lead) recipientEmail = lead.contact.includes("@") ? lead.contact : `${lead.name.toLowerCase().replace(/\s+/g, "")}@workspace.com`;
    } else {
      const client = initialClients.find((c) => c.id === selectedRecipientId);
      if (client) recipientEmail = client.email;
    }

    const tpl = templates.find((t) => t.id === selectedTemplateId);

    setTimeout(() => {
      setIsSending(false);
      setSendSuccess(true);
      addLog({
        recipient: recipientEmail,
        recipientType: recipientType === "lead" ? "Lead" : "Client",
        subject: mailSubject,
        templateName: tpl?.name || "Custom Campaign",
        status: "Sent"
      });
      setTimeout(() => setSendSuccess(false), 3000);
    }, 1800);
  }

  // Create Custom Template
  function handleCreateTemplate(e: React.FormEvent) {
    e.preventDefault();
    const newId = `tpl_custom_${Date.now()}`;
    const created: EmailTemplate = {
      id: newId,
      ...newTemplate
    };
    saveTemplates([...templates, created]);
    setSelectedTemplateId(newId);
    setIsCreateModalOpen(false);
    setNewTemplate({
      name: "",
      subject: "",
      body: "",
      category: "custom"
    });
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Communications"
        title="Custom Email Campaign Center"
        description="Set up your enterprise SMTP configs, design custom HTML marketing and transaction templates, and send high-converting outreach to leads and clients."
      />

      {/* Metric Widgets */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Total Emails Sent" value={String(logs.length)} delta="Deliverability rate: 100%" />
        {isEmployee ? (
          <MetricCard label="SMTP Relay Connection" value="Online & Paired" delta="Enterprise email client" />
        ) : (
          <MetricCard label="SMTP Delivery Profile" value={smtp.host} delta={`User: ${smtp.user}`} />
        )}
        <MetricCard label="Active Templates" value={String(templates.length)} delta={`${templates.filter(t=>t.category==='objection').length} objection handlers`} />
        <MetricCard label="Tracked Recipients" value={String(initialLeads.length + initialClients.length)} delta="Automated variable sync" />
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-900 bg-slate-900/30 p-1 rounded-[16px] max-w-2xl">
        <button
          onClick={() => setActiveTab("send")}
          className={`flex-1 py-3 text-center text-xs font-semibold rounded-[12px] flex items-center justify-center gap-2 transition-all border ${
            activeTab === "send"
              ? "bg-indigo-600/10 text-indigo-400 border-indigo-500/20 font-bold shadow-sm"
              : "text-slate-400 border-transparent hover:text-slate-200"
          }`}
        >
          <Send size={14} />
          Outreach Dispatcher
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={`flex-1 py-3 text-center text-xs font-semibold rounded-[12px] flex items-center justify-center gap-2 transition-all border ${
            activeTab === "templates"
              ? "bg-indigo-600/10 text-indigo-400 border-indigo-500/20 font-bold shadow-sm"
              : "text-slate-400 border-transparent hover:text-slate-200"
          }`}
        >
          <BookOpen size={14} />
          Template Library
        </button>
        {!isEmployee && (
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex-1 py-3 text-center text-xs font-semibold rounded-[12px] flex items-center justify-center gap-2 transition-all border ${
              activeTab === "settings"
                ? "bg-indigo-600/10 text-indigo-400 border-indigo-500/20 font-bold shadow-sm"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            <Settings size={14} />
            SMTP Server Config
          </button>
        )}
        <button
          onClick={() => setActiveTab("logs")}
          className={`flex-1 py-3 text-center text-xs font-semibold rounded-[12px] flex items-center justify-center gap-2 transition-all border ${
            activeTab === "logs"
              ? "bg-indigo-600/10 text-indigo-400 border-indigo-500/20 font-bold shadow-sm"
              : "text-slate-400 border-transparent hover:text-slate-200"
          }`}
        >
          <Clock size={14} />
          Delivery Logs
        </button>
      </div>

      {/* Tab: SEND DISPATCHER */}
      {activeTab === "send" && (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Editor Column */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-4">
              <Mail className="text-indigo-400" size={18} /> Compose Outreach
            </h3>
            
            <form onSubmit={handleSendEmail} className="space-y-4">
              <FormGrid>
                <FieldGroup>
                  <FieldLabel>Outreach Recipient Type</FieldLabel>
                  <SelectInput
                    value={recipientType}
                    onChange={(e) => {
                      setRecipientType(e.target.value as any);
                      setSelectedRecipientId("");
                    }}
                  >
                    <option value="lead">Sales Pipeline Lead</option>
                    <option value="client">Retained Client Portal</option>
                  </SelectInput>
                </FieldGroup>

                <FieldGroup>
                  <FieldLabel>Select Target Contact</FieldLabel>
                  <SelectInput
                    value={selectedRecipientId}
                    onChange={(e) => setSelectedRecipientId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Recipient Record --</option>
                    {recipientType === "lead"
                      ? initialLeads.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.name} ({l.contact})
                          </option>
                        ))
                      : initialClients.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.company} — {c.name}
                          </option>
                        ))}
                  </SelectInput>
                </FieldGroup>
              </FormGrid>

              <FieldGroup>
                <FieldLabel>Outreach Template Context</FieldLabel>
                <SelectInput
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.category.toUpperCase()}] {t.name}
                    </option>
                  ))}
                </SelectInput>
              </FieldGroup>

              <FieldGroup>
                <FieldLabel>Subject Line</FieldLabel>
                <TextInput
                  value={mailSubject}
                  onChange={(e) => setMailSubject(e.target.value)}
                  placeholder="Enter email subject line..."
                  required
                />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel>Email Body (HTML/Markdown Editable)</FieldLabel>
                <TextArea
                  value={mailBody}
                  onChange={(e) => setMailBody(e.target.value)}
                  rows={14}
                  placeholder="Compose your message..."
                  required
                />
              </FieldGroup>

              <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Database size={14} className="text-indigo-400" />
                  <span>Sender Account: <strong className="text-slate-200">{smtp.fromName} ({smtp.user})</strong></span>
                </div>

                <div className="flex gap-3">
                  {sendSuccess && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                      <CheckCircle2 size={14} /> Delivered successfully!
                    </span>
                  )}
                  <Button type="submit" disabled={isSending}>
                    {isSending ? (
                      <span className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Relaying SMTP...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Send size={14} /> Send Outreach
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Card>

          {/* Live Preview Card */}
          <div className="space-y-6">
            <Card className="p-6 h-full flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-1.5">
                  <Eye size={16} /> Rich HTML Live Render Preview
                </h3>
                <p className="text-[11px] text-slate-500 mb-4">
                  This is how the client will view the email in their inbox. All variables and signatures have been pre-rendered.
                </p>

                {/* Email Client Layout Mock */}
                <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950 text-slate-200 shadow-md">
                  {/* Header Bar */}
                  <div className="bg-slate-900 border-b border-slate-800 p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-400 flex items-center justify-center text-slate-950 font-extrabold text-[10px]">
                        O
                      </div>
                      <span className="font-bold text-xs text-slate-200">OmniPulse AI</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Secure SMTP Mailer</span>
                  </div>

                  {/* Mail Info */}
                  <div className="bg-slate-900/40 border-b border-slate-800 p-3 text-xs space-y-1 text-slate-400">
                    <p><strong>From:</strong> {smtp.fromName} &lt;{smtp.user}&gt;</p>
                    <p><strong>Subject:</strong> <span className="text-slate-200 font-semibold">{mailSubject}</span></p>
                  </div>

                  {/* HTML Content Body */}
                  <div className="p-6 text-sm text-slate-350 leading-relaxed font-sans min-h-[300px] whitespace-pre-wrap">
                    {mailBody}
                  </div>

                  {/* HTML Footer */}
                  <div className="bg-slate-900/40 border-t border-slate-800 p-4 text-[10px] text-slate-500 text-center leading-normal">
                    <p className="font-semibold text-slate-400">OmniPulse AI Private Limited</p>
                    <p>Enterprise Operations & Delivery Command Hub • 6-Month post-delivery warranty</p>
                    <p className="mt-1 text-[9px] text-slate-500">For any support queries, contact accounts@omnipulse.ai</p>
                  </div>
                </div>
              </div>

              {/* Dynamic Variables Tip */}
              <div className="mt-6 bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex items-start gap-2.5">
                <Sparkles className="text-indigo-400 shrink-0 mt-0.5" size={16} />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-slate-200">Dynamic Variable Handlers</p>
                  <p className="text-slate-400">
                    Include variables like <code className="text-indigo-400 font-mono">{`{ClientName}`}</code>, <code className="text-indigo-400 font-mono">{`{ProjectName}`}</code>, <code className="text-indigo-400 font-mono">{`{InvoiceAmount}`}</code>, or <code className="text-indigo-400 font-mono">{`{InvoiceNumber}`}</code> to dynamically sync content.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab: TEMPLATE LIBRARY */}
      {activeTab === "templates" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <BookOpen className="text-indigo-400" size={18} /> HTML Email Template Library
            </h3>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus size={16} /> Create Custom Template
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {templates.map((tpl) => (
              <Card key={tpl.id} className="p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge tone={tpl.category === "pitch" ? "info" : tpl.category === "objection" ? "alert" : tpl.category === "billing" ? "success" : "neutral"}>
                      {tpl.category.toUpperCase()}
                    </Badge>
                    <span className="text-[10px] text-fog font-mono">ID: {tpl.id}</span>
                  </div>
                  <h4 className="font-bold text-slate-100 text-sm">{tpl.name}</h4>
                  <p className="text-xs font-semibold text-indigo-400 mt-1 truncate">Subject: "{tpl.subject}"</p>
                  <p className="text-xs text-slate-300 mt-3 line-clamp-4 whitespace-pre-wrap bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 font-mono">
                    {tpl.body}
                  </p>
                </div>

                <div className="flex gap-2 justify-end border-t border-slate-800/80 pt-3">
                  <Button
                    variant="secondary"
                    className="h-8 text-xs"
                    onClick={() => {
                      setSelectedTemplateId(tpl.id);
                      setActiveTab("send");
                    }}
                  >
                    Use in Outreach
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-8 text-xs text-red-400 hover:bg-rose-500/10 hover:text-red-300"
                    onClick={() => {
                      if (window.confirm(`Delete template "${tpl.name}"?`)) {
                        saveTemplates(templates.filter((t) => t.id !== tpl.id));
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab: SMTP SETTINGS */}
      {activeTab === "settings" && (
        <Card className="p-6 max-w-2xl">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-4">
            <Settings className="text-indigo-400" size={18} /> Enterprise SMTP Credentials
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Configure your custom outgoing email server. All outreach sent via campaigns or PDF invoice releases will route directly using this SMTP configuration.
          </p>

          <form onSubmit={(e) => { e.preventDefault(); saveSmtp(smtp); alert("SMTP settings updated and saved."); }} className="space-y-4">
            <FormGrid>
              <FieldGroup>
                <FieldLabel>SMTP Server Host</FieldLabel>
                <TextInput
                  value={smtp.host}
                  onChange={(e) => saveSmtp({ ...smtp, host: e.target.value })}
                  placeholder="smtp.gmail.com"
                  required
                />
              </FieldGroup>
              <FieldGroup>
                <FieldLabel>SMTP Port</FieldLabel>
                <TextInput
                  value={smtp.port}
                  onChange={(e) => saveSmtp({ ...smtp, port: e.target.value })}
                  placeholder="587"
                  required
                />
              </FieldGroup>
            </FormGrid>

            <FormGrid>
              <FieldGroup>
                <FieldLabel>SMTP User / Email address</FieldLabel>
                <TextInput
                  type="email"
                  value={smtp.user}
                  onChange={(e) => saveSmtp({ ...smtp, user: e.target.value })}
                  placeholder="sales@mycompany.com"
                  required
                />
              </FieldGroup>
              <FieldGroup>
                <FieldLabel>SMTP App Password</FieldLabel>
                <TextInput
                  type="password"
                  value={smtp.pass}
                  onChange={(e) => saveSmtp({ ...smtp, pass: e.target.value })}
                  placeholder="Enter SMTP password..."
                  required
                />
              </FieldGroup>
            </FormGrid>

            <FormGrid>
              <FieldGroup>
                <FieldLabel>Outgoing Sender Profile Name</FieldLabel>
                <TextInput
                  value={smtp.fromName}
                  onChange={(e) => saveSmtp({ ...smtp, fromName: e.target.value })}
                  placeholder="e.g. Accounts & Billing"
                  required
                />
              </FieldGroup>
              <FieldGroup>
                <FieldLabel>Security Protocol</FieldLabel>
                <SelectInput
                  value={smtp.secure}
                  onChange={(e) => saveSmtp({ ...smtp, secure: e.target.value as any })}
                >
                  <option value="STARTTLS">STARTTLS (Recommended / Port 587)</option>
                  <option value="SSL/TLS">SSL/TLS (Port 465)</option>
                  <option value="None">None (Unencrypted)</option>
                </SelectInput>
              </FieldGroup>
            </FormGrid>

            <div className="flex items-center justify-between border-t border-slate-800 pt-5 mt-2">
              <div className="flex items-center gap-2">
                {testStatus === "success" && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/25">
                    <CheckCircle2 size={14} /> Connection handshake successful!
                  </span>
                )}
                {testStatus === "error" && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/25 max-w-sm">
                    <AlertTriangle size={14} className="shrink-0" /> {testError}
                  </span>
                )}
                {testStatus === "testing" && (
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                    Testing handshake...
                  </span>
                )}
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="secondary" onClick={testConnection} disabled={testStatus === "testing"}>
                  Test Connection
                </Button>
                <Button type="submit">
                  Save Configuration
                </Button>
              </div>
            </div>
          </form>
        </Card>
      )}

      {/* Tab: LOGS TABLE */}
      {activeTab === "logs" && (
        <DataTable
          data={logs}
          emptyMessage="No emails dispatched yet."
          columns={[
            {
              key: "recipient",
              header: "Recipient Contact",
              render: (log) => (
                <div>
                  <p className="font-semibold text-slate-200">{log.recipient}</p>
                  <p className="text-[10px] text-fog uppercase">{log.recipientType}</p>
                </div>
              )
            },
            {
              key: "subject",
              header: "Subject Line",
              render: (log) => (
                <div className="max-w-xs md:max-w-md truncate">
                  <p className="font-medium text-slate-200">{log.subject}</p>
                  <p className="text-[10px] text-indigo-400">{log.templateName}</p>
                </div>
              )
            },
            {
              key: "sentAt",
              header: "Sent Timestamp",
              render: (log) => formatDate(log.sentAt) + " — " + new Date(log.sentAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
            },
            {
              key: "status",
              header: "Delivery Status",
              render: (log) => {
                const colors = {
                  Sent: "info",
                  Delivered: "success",
                  Opened: "success",
                  Bounced: "danger",
                } as const;
                return <Badge tone={colors[log.status]}>{log.status}</Badge>;
              }
            }
          ]}
        />
      )}

      {/* Create Custom Template Modal */}
      <Modal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Custom HTML Template"
        description="Write custom templates. Supported dynamic tags: {ClientName}, {ProjectName}, {InvoiceAmount}, {OwnerName}."
      >
        <form onSubmit={handleCreateTemplate} className="space-y-4">
          <FieldGroup>
            <FieldLabel htmlFor="tpl-name">Template Name</FieldLabel>
            <TextInput
              id="tpl-name"
              value={newTemplate.name}
              onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
              placeholder="e.g. Objections - Delivery Speed Guarantee"
              required
            />
          </FieldGroup>

          <FormGrid>
            <FieldGroup>
              <FieldLabel htmlFor="tpl-category">Category</FieldLabel>
              <SelectInput
                id="tpl-category"
                value={newTemplate.category}
                onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value as any })}
              >
                <option value="pitch">Proposal Pitch</option>
                <option value="objection">Objection Handling</option>
                <option value="billing">Billing / Invoices</option>
                <option value="outreach">Cold Outreach</option>
                <option value="custom">General Custom</option>
              </SelectInput>
            </FieldGroup>
            <FieldGroup>
              <FieldLabel htmlFor="tpl-subject">Default Subject Line</FieldLabel>
              <TextInput
                id="tpl-subject"
                value={newTemplate.subject}
                onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                placeholder="Custom Platform Architecture: {CompanyName}"
                required
              />
            </FieldGroup>
          </FormGrid>

          <FieldGroup>
            <FieldLabel htmlFor="tpl-body">Email Body Template</FieldLabel>
            <TextArea
              id="tpl-body"
              value={newTemplate.body}
              onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
              rows={10}
              placeholder={`Hi {ClientName},\n\nCompose body here...\n\nBest regards,\n{OwnerName}`}
              required
            />
          </FieldGroup>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Template
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
