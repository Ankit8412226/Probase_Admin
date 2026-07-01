"use client";

import { useState } from "react";
import { Search, Calendar, Scan, Lock, Users, Clock, AlertCircle } from "lucide-react";
import { DataTable } from "@/components/tables/data-table";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ExportMenu } from "@/components/ui/export-menu";
import { SelectInput, TextInput } from "@/components/forms/form-primitives";
import { formatDate, formatTime } from "@/lib/utils";
import type { AttendanceRecord } from "@/types";

export function AttendanceModule({
  initialAttendances,
}: {
  initialAttendances: AttendanceRecord[];
}) {
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Calculate statistics for today or overall
  const total = initialAttendances.length;
  const late = initialAttendances.filter((a) => a.status === "Late").length;
  const present = initialAttendances.filter((a) => a.status === "Present").length;
  const faceRatio = total > 0 
    ? Math.round((initialAttendances.filter((a) => a.method === "face").length / total) * 100) 
    : 0;

  // Filter records
  const filteredAttendances = initialAttendances.filter((a) => {
    const matchesSearch =
      a.userName.toLowerCase().includes(search.toLowerCase()) ||
      a.userRole.toLowerCase().includes(search.toLowerCase());
    const matchesMethod = methodFilter === "All" || a.method === methodFilter;
    const matchesStatus = statusFilter === "All" || a.status === statusFilter;
    return matchesSearch && matchesMethod && matchesStatus;
  });

  const exportRows = filteredAttendances.map((a) => ({
    name: a.userName,
    role: a.userRole,
    date: a.date,
    time: formatTime(a.loginTime),
    method: a.method === "face" ? "Face Biometrics" : "Password Login",
    status: a.status,
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Operations"
        title="Attendance Logs"
        description="Monitor staff check-in timestamps, authentication methods, and schedule compliance."
        actions={
          <ExportMenu
            filename="attendance_logs"
            label="Export Logs"
            csvRows={exportRows}
            jsonData={filteredAttendances}
          />
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-fog font-mono">Total Logins</p>
            <h3 className="text-2xl font-bold mt-1 text-black">{total}</h3>
          </div>
          <div className="p-3 bg-mist rounded-full text-black">
            <Users size={18} />
          </div>
        </Card>
        
        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-emerald-600 font-mono">On Time</p>
            <h3 className="text-2xl font-bold mt-1 text-emerald-600">{present}</h3>
          </div>
          <div className="p-3 bg-emerald-50 rounded-full text-emerald-500">
            <Clock size={18} />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-amber-600 font-mono">Late Check-ins</p>
            <h3 className="text-2xl font-bold mt-1 text-amber-600">{late}</h3>
          </div>
          <div className="p-3 bg-amber-50 rounded-full text-amber-500">
            <AlertCircle size={18} />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-sky-600 font-mono">Biometric Rate</p>
            <h3 className="text-2xl font-bold mt-1 text-sky-600">{faceRatio}%</h3>
          </div>
          <div className="p-3 bg-sky-50 rounded-full text-sky-500">
            <Scan size={18} />
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-3 rounded-[16px] border border-line bg-mist px-4 py-3">
          <Search size={16} className="text-fog" />
          <TextInput
            className="h-auto border-0 bg-transparent px-0"
            placeholder="Search by employee name or role..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <SelectInput
            className="w-full sm:w-[180px]"
            value={methodFilter}
            onChange={(event) => setMethodFilter(event.target.value)}
          >
            <option value="All">All Methods</option>
            <option value="face">Face Biometrics</option>
            <option value="password">Password Credentials</option>
          </SelectInput>
          <SelectInput
            className="w-full sm:w-[180px]"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Present">On Time</option>
            <option value="Late">Late</option>
          </SelectInput>
        </div>
      </Card>

      {/* Table */}
      {filteredAttendances.length ? (
        <DataTable
          data={filteredAttendances}
          emptyMessage="No matching attendance logs found."
          columns={[
            {
              key: "name",
              header: "Employee",
              render: (log) => (
                <div>
                  <p className="font-semibold">{log.userName}</p>
                  <p className="text-sm text-fog uppercase tracking-wider text-[10px]">{log.userRole}</p>
                </div>
              ),
            },
            {
              key: "date",
              header: "Date",
              render: (log) => (
                <div className="flex items-center gap-1.5 text-black">
                  <Calendar size={14} className="text-fog" />
                  <span>{formatDate(log.date)}</span>
                </div>
              ),
            },
            {
              key: "loginTime",
              header: "Check-in Time",
              render: (log) => (
                <div className="font-mono text-sm">
                  {formatTime(log.loginTime)}
                </div>
              ),
            },
            {
              key: "method",
              header: "Method",
              render: (log) =>
                log.method === "face" ? (
                  <Badge tone="neutral">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Scan size={10} />
                      Face Biometrics
                    </span>
                  </Badge>
                ) : (
                  <Badge tone="info">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Lock size={10} />
                      Password Login
                    </span>
                  </Badge>
                ),
            },
            {
              key: "status",
              header: "Schedule Status",
              render: (log) =>
                log.status === "Present" ? (
                  <Badge tone="success">On Time</Badge>
                ) : (
                  <Badge tone="alert">Late</Badge>
                ),
            },
          ]}
        />
      ) : (
        <EmptyState
          title="No attendance records found"
          description="Adjust your search criteria or select different filter dropdowns."
        />
      )}
    </div>
  );
}
