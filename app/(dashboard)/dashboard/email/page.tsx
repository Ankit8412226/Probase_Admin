import { EmailModule } from "@/components/modules/email-module";
import { requireSessionUser } from "@/lib/auth";
import { getLeads } from "@/lib/services/leads";
import { getClients } from "@/lib/services/clients";
import { getProjects } from "@/lib/services/projects";
import { getInvoices } from "@/lib/services/invoices";

export default async function EmailOutreachPage() {
  await requireSessionUser(["admin", "manager", "business", "employee"]);
  const [leads, clients, projects, invoices] = await Promise.all([
    getLeads(),
    getClients(),
    getProjects(),
    getInvoices(),
  ]);

  return (
    <EmailModule
      initialLeads={leads}
      initialClients={clients}
      initialProjects={projects}
      initialInvoices={invoices}
    />
  );
}
