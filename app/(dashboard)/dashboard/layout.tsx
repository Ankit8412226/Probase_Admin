import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireSessionUser } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireSessionUser(["admin", "manager", "business", "employee"]);

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
