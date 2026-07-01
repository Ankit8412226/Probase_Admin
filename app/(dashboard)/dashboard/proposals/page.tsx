import { ProposalsModule } from "@/components/modules/proposals-module";
import { requireSessionUser } from "@/lib/auth";
import { getClients } from "@/lib/services/clients";
import { getLeads } from "@/lib/services/leads";
import { getProposals } from "@/lib/services/proposals";
import { getBusinessUsers } from "@/lib/services/users";

export default async function ProposalsPage() {
  await requireSessionUser(["admin", "manager", "business", "employee"]);

  const [proposals, leads, clients, owners] = await Promise.all([
    getProposals(),
    getLeads(),
    getClients(),
    getBusinessUsers(),
  ]);

  return (
    <ProposalsModule
      initialProposals={proposals}
      leads={leads}
      clients={clients}
      owners={owners}
    />
  );
}
