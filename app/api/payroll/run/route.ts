import type { NextRequest } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { handleApiException } from "@/lib/api-route";
import { apiSuccess } from "@/lib/http";
import { getEmployees } from "@/lib/services/employees";
import { getAttendances } from "@/lib/services/attendance";
import { getSalaries, createSalary } from "@/lib/services/salaries";

export async function POST(request: NextRequest) {
  try {
    // Only administrators are allowed to run payroll
    await requireApiUser(request, ["admin"]);
    
    const body = await request.json();
    const { month, lateDeduction = 500 } = body;

    if (!month) {
      return Response.json({ success: false, message: "Month is required (format: YYYY-MM)" }, { status: 400 });
    }

    const [employees, attendances, existingSalaries] = await Promise.all([
      getEmployees(),
      getAttendances(),
      getSalaries(),
    ]);

    const createdRecords = [];

    for (const emp of employees) {
      // Check if salary record already exists for this employee and month
      const exists = existingSalaries.some(
        (s) => s.employeeId === emp.id && s.month === month
      );
      if (exists) {
        continue;
      }

      // Filter employee's attendance logs for this month
      // log.date is YYYY-MM-DD, month is YYYY-MM
      const empLogs = attendances.filter(
        (a) => a.userId === emp.id && a.date.startsWith(month)
      );

      const lateCount = empLogs.filter((a) => a.status === "Late").length;
      const deductions = lateCount * Number(lateDeduction);
      const finalAmount = Math.max(0, emp.salary - deductions);

      // Create new pending salary record
      const salaryRecord = await createSalary({
        employeeId: emp.id,
        month,
        amount: finalAmount,
        status: "Pending",
      });

      createdRecords.push({
        ...salaryRecord,
        employeeName: emp.name,
        baseSalary: emp.salary,
        lateDays: lateCount,
        deductions,
      });
    }

    return apiSuccess({
      message: `Payroll run completed. Generated ${createdRecords.length} records.`,
      records: createdRecords,
    });
  } catch (error) {
    return handleApiException(error);
  }
}
