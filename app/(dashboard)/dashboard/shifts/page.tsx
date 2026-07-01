import { ShiftsModule } from "@/components/modules/shifts-module";
import { requireSessionUser } from "@/lib/auth";
import { getShifts } from "@/lib/services/shifts";
import { getEmployees } from "@/lib/services/employees";

export default async function ShiftsPage() {
  await requireSessionUser(["admin", "manager"]);
  const [shifts, employees] = await Promise.all([getShifts(), getEmployees()]);

  return <ShiftsModule initialShifts={shifts} employees={employees} />;
}
