import { EmployeesModule } from "@/components/modules/employees-module";
import { requireSessionUser } from "@/lib/auth";
import { getEmployees } from "@/lib/services/employees";

export default async function EmployeesPage() {
  await requireSessionUser(["admin", "manager"]);
  const employees = await getEmployees();
  return <EmployeesModule initialEmployees={employees} />;
}
