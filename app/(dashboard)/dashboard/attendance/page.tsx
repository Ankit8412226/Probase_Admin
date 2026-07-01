import { AttendanceModule } from "@/components/modules/attendance-module";
import { requireSessionUser } from "@/lib/auth";
import { getAttendances } from "@/lib/services/attendance";

export default async function AttendancePage() {
  await requireSessionUser(["admin", "manager"]);
  const attendances = await getAttendances();
  
  return <AttendanceModule initialAttendances={attendances} />;
}
