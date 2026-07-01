import { ProjectsModule } from "@/components/modules/projects-module";
import { requireSessionUser } from "@/lib/auth";
import { getClients } from "@/lib/services/clients";
import { getEmployees } from "@/lib/services/employees";
import { getProjects } from "@/lib/services/projects";
import { getInvoices } from "@/lib/services/invoices";

export default async function ProjectsPage() {
  await requireSessionUser(["admin", "manager", "business", "employee"]);
  const [projects, clients, employees, invoices] = await Promise.all([
    getProjects(),
    getClients(),
    getEmployees(),
    getInvoices(),
  ]);

  return (
    <ProjectsModule
      initialProjects={projects}
      clients={clients}
      employees={employees}
      invoices={invoices}
    />
  );
}
