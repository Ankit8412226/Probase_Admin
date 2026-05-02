import { SalariesModule } from "@/components/modules/salaries-module";
import { requireSessionUser } from "@/lib/auth";
import { getEmployees } from "@/lib/services/employees";
import { getSalaries } from "@/lib/services/salaries";

export default async function SalariesPage() {
  await requireSessionUser(["admin", "manager"]);
  const [salaries, employees] = await Promise.all([getSalaries(), getEmployees()]);
  return <SalariesModule initialSalaries={salaries} employees={employees} />;
}
