import { ClientsModule } from "@/components/modules/clients-module";
import { requireSessionUser } from "@/lib/auth";
import { getClients } from "@/lib/services/clients";
import { getProjects } from "@/lib/services/projects";
import { getBusinessUsers } from "@/lib/services/users";

export default async function ClientsPage() {
  await requireSessionUser(["admin", "manager", "business"]);
  const [clients, projects, accountManagers] = await Promise.all([
    getClients(),
    getProjects(),
    getBusinessUsers(),
  ]);
  return (
    <ClientsModule
      initialClients={clients}
      projects={projects}
      accountManagers={accountManagers}
    />
  );
}
