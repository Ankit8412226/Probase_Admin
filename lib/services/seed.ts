import { mockData } from "@/lib/data/mock-data";
import { seedClients } from "@/lib/services/clients";
import { seedEmployees } from "@/lib/services/employees";
import { seedInvoices } from "@/lib/services/invoices";
import { seedLeads } from "@/lib/services/leads";
import { seedProjects } from "@/lib/services/projects";
import { seedProposals } from "@/lib/services/proposals";
import { seedSalaries } from "@/lib/services/salaries";
import { resetMemoryStore } from "@/lib/services/store";
import { seedTargets } from "@/lib/services/targets";
import { upsertUsers } from "@/lib/services/users";
import Attendance from "@/models/Attendance";

export async function seedAllData() {
  resetMemoryStore();
  
  if (global.probaseStore) {
    global.probaseStore.attendances = [];
  }

  try {
    await Attendance.deleteMany({});
  } catch (err) {
    console.log("No MongoDB connection or collection reset skipped:", err);
  }

  await upsertUsers(mockData.users);
  await seedEmployees(mockData.employees);
  await seedSalaries(mockData.salaries);
  await seedClients(mockData.clients);
  await seedProjects(mockData.projects);
  await seedLeads(mockData.leads);
  await seedProposals(mockData.proposals);
  await seedInvoices(mockData.invoices);
  await seedTargets(mockData.targets);

  return {
    users: mockData.users.length,
    employees: mockData.employees.length,
    salaries: mockData.salaries.length,
    clients: mockData.clients.length,
    projects: mockData.projects.length,
    leads: mockData.leads.length,
    proposals: mockData.proposals.length,
    invoices: mockData.invoices.length,
    targets: mockData.targets.length,
  };
}
