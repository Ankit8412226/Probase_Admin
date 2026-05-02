import { BusinessOverviewModule } from "@/components/modules/business-overview-module";
import { requireSessionUser } from "@/lib/auth";
import { getBusinessOverview } from "@/lib/services/analytics";
import { getClients } from "@/lib/services/clients";
import { getInvoices } from "@/lib/services/invoices";
import { getLeads } from "@/lib/services/leads";
import { getProposals } from "@/lib/services/proposals";
import { getTargets } from "@/lib/services/targets";
import { getBusinessUsers } from "@/lib/services/users";

export default async function BusinessPage() {
  await requireSessionUser(["admin", "manager", "business"]);

  const [overview, owners, leads, proposals, invoices, clients, targets] = await Promise.all([
    getBusinessOverview(),
    getBusinessUsers(),
    getLeads(),
    getProposals(),
    getInvoices(),
    getClients(),
    getTargets(),
  ]);

  return (
    <BusinessOverviewModule
      overview={overview}
      owners={owners}
      leads={leads}
      proposals={proposals}
      invoices={invoices}
      clients={clients}
      targets={targets}
    />
  );
}
