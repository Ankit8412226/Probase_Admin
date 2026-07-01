import { DashboardOverview } from "@/components/modules/dashboard-overview";
import { getDashboardOverview } from "@/lib/services/analytics";
import { getClients } from "@/lib/services/clients";
import { getLeads } from "@/lib/services/leads";
import { getProjects } from "@/lib/services/projects";
import { getSalaries } from "@/lib/services/salaries";
import { getAttendances } from "@/lib/services/attendance";

export default async function DashboardPage() {
  const [overview, projects, leads, clients, salaries, attendances] = await Promise.all([
    getDashboardOverview(),
    getProjects(),
    getLeads(),
    getClients(),
    getSalaries(),
    getAttendances(),
  ]);

  return (
    <DashboardOverview
      overview={overview}
      projects={projects}
      leads={leads}
      clients={clients}
      salaries={salaries}
      attendances={attendances}
    />
  );
}
