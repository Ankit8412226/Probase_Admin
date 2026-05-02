import { ProjectsModule } from "@/components/modules/projects-module";
import { requireSessionUser } from "@/lib/auth";
import { getClients } from "@/lib/services/clients";
import { getEmployees } from "@/lib/services/employees";
import { getProjects } from "@/lib/services/projects";

export default async function ProjectsPage() {
  await requireSessionUser(["admin", "manager", "business"]);
  const [projects, clients, employees] = await Promise.all([
    getProjects(),
    getClients(),
    getEmployees(),
  ]);

  return <ProjectsModule initialProjects={projects} clients={clients} employees={employees} />;
}
