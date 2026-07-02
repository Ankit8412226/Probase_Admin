"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardHeader } from "@/components/ui/card";
import { formatCurrency, formatMonth } from "@/lib/utils";
import type { TargetPerformancePoint } from "@/types";

function LegendPill({
  colorClassName,
  label,
}: {
  colorClassName: string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line bg-mist px-3 py-1.5 text-xs font-medium text-fog">
      <span className={`h-2.5 w-2.5 rounded-full ${colorClassName}`} />
      {label}
    </span>
  );
}

export function TargetPerformanceChart({
  data,
}: {
  data: TargetPerformancePoint[];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Revenue Chart */}
      <Card className="min-w-0 overflow-hidden">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <CardHeader
              eyebrow="Revenue Performance"
              title="Target vs Actual Revenue"
              description="Monthly comparison of target revenue and actual collections."
            />
            <div className="flex flex-wrap items-center gap-2">
              <LegendPill colorClassName="bg-slate-700" label="Target" />
              <LegendPill colorClassName="bg-indigo-500" label="Actual (Paid)" />
            </div>
          </div>
          <div className="h-[260px] min-w-0 sm:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 12, right: 8, left: -20, bottom: 0 }}
              >
                <CartesianGrid stroke="#1e293b" strokeDasharray="4 4" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickFormatter={formatMonth}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  tickMargin={10}
                />
                <YAxis
                  width={60}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  tickFormatter={(value) => `₹${Math.round(value / 1000)}k`}
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), "Amount"]}
                  labelFormatter={(label) => formatMonth(String(label))}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #1e293b",
                    backgroundColor: "#0e1524",
                    color: "#f8fafc",
                  }}
                  itemStyle={{ color: "#a5b4fc" }}
                />
                <Bar dataKey="targetRevenue" fill="#334155" radius={[6, 6, 0, 0]} maxBarSize={30} />
                <Bar dataKey="actualRevenue" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Conversions Chart */}
      <Card className="min-w-0 overflow-hidden">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <CardHeader
              eyebrow="Conversion Performance"
              title="Target vs Actual Conversions"
              description="Monthly comparison of target conversions and actual won deals."
            />
            <div className="flex flex-wrap items-center gap-2">
              <LegendPill colorClassName="bg-slate-700" label="Target" />
              <LegendPill colorClassName="bg-emerald-500" label="Actual (Won)" />
            </div>
          </div>
          <div className="h-[260px] min-w-0 sm:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 12, right: 8, left: -20, bottom: 0 }}
              >
                <CartesianGrid stroke="#1e293b" strokeDasharray="4 4" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickFormatter={formatMonth}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  tickMargin={10}
                />
                <YAxis
                  width={40}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  allowDecimals={false}
                />
                <Tooltip
                  formatter={(value: number) => [value, "Conversions"]}
                  labelFormatter={(label) => formatMonth(String(label))}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #1e293b",
                    backgroundColor: "#0e1524",
                    color: "#f8fafc",
                  }}
                  itemStyle={{ color: "#a5b4fc" }}
                />
                <Bar dataKey="targetConversions" fill="#334155" radius={[6, 6, 0, 0]} maxBarSize={30} />
                <Bar dataKey="actualConversions" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </div>
  );
}
