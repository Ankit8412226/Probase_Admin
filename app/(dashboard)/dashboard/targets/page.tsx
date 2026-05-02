import { TargetsModule } from "@/components/modules/targets-module";
import { requireSessionUser } from "@/lib/auth";
import { getBusinessOverview } from "@/lib/services/analytics";
import { getTargets } from "@/lib/services/targets";
import { getBusinessUsers } from "@/lib/services/users";

export default async function TargetsPage() {
  await requireSessionUser(["admin", "manager", "business"]);

  const [targets, owners, businessOverview] = await Promise.all([
    getTargets(),
    getBusinessUsers(),
    getBusinessOverview(),
  ]);

  return (
    <TargetsModule
      initialTargets={targets}
      owners={owners}
      performance={businessOverview.targetVsActual}
    />
  );
}
