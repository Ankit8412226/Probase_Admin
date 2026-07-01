import { LeadsModule } from "@/components/modules/leads-module";
import { requireSessionUser } from "@/lib/auth";
import { getLeads } from "@/lib/services/leads";
import { getBusinessUsers } from "@/lib/services/users";

export default async function LeadsPage() {
  await requireSessionUser(["admin", "manager", "business", "employee"]);
  const [leads, owners] = await Promise.all([getLeads(), getBusinessUsers()]);
  return <LeadsModule initialLeads={leads} owners={owners} />;
}
