import { SalariesModule } from "@/components/modules/salaries-module";
import { requireSessionUser } from "@/lib/auth";
import { getEmployees } from "@/lib/services/employees";
import { getSalaries } from "@/lib/services/salaries";
import { getAttendances } from "@/lib/services/attendance";

export default async function SalariesPage() {
  await requireSessionUser(["admin", "manager"]);
  const [salaries, employees, attendances] = await Promise.all([
    getSalaries(),
    getEmployees(),
    getAttendances(),
  ]);
  
  return (
    <SalariesModule
      initialSalaries={salaries}
      employees={employees}
      attendances={attendances}
    />
  );
}
