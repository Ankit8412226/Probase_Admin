import { InvoicesModule } from "@/components/modules/invoices-module";
import { requireSessionUser } from "@/lib/auth";
import { getClients } from "@/lib/services/clients";
import { getInvoices } from "@/lib/services/invoices";
import { getProjects } from "@/lib/services/projects";
import { getBusinessUsers } from "@/lib/services/users";

export default async function InvoicesPage() {
  await requireSessionUser(["admin", "manager", "business", "employee"]);

  const [invoices, clients, projects, owners] = await Promise.all([
    getInvoices(),
    getClients(),
    getProjects(),
    getBusinessUsers(),
  ]);

  return (
    <InvoicesModule
      initialInvoices={invoices}
      clients={clients}
      projects={projects}
      owners={owners}
    />
  );
}
