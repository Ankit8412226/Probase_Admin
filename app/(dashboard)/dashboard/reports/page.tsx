import { ReportsModule } from "@/components/modules/reports-module";
import { requireSessionUser } from "@/lib/auth";
import { getDashboardOverview, getEmployeePerformance } from "@/lib/services/analytics";

export default async function ReportsPage() {
  await requireSessionUser(["admin", "manager"]);
  const [overview, performance] = await Promise.all([
    getDashboardOverview(),
    getEmployeePerformance(),
  ]);

  return <ReportsModule overview={overview} performance={performance} />;
}
