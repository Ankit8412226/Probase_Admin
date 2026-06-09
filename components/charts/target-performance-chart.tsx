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
              <LegendPill colorClassName="bg-black/20" label="Target" />
              <LegendPill colorClassName="bg-black" label="Actual (Paid)" />
            </div>
          </div>
          <div className="h-[260px] min-w-0 sm:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 12, right: 8, left: -20, bottom: 0 }}
              >
                <CartesianGrid stroke="#E5E5E5" strokeDasharray="4 4" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickFormatter={formatMonth}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#7A7A7A", fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis
                  width={60}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#7A7A7A", fontSize: 12 }}
                  tickFormatter={(value) => `$${Math.round(value / 1000)}k`}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => formatMonth(String(label))}
                  contentStyle={{
                    borderRadius: 16,
                    border: "1px solid #E5E5E5",
                    backgroundColor: "#FFFFFF",
                  }}
                />
                <Bar dataKey="targetRevenue" fill="#D4D4D4" radius={[6, 6, 0, 0]} maxBarSize={30} />
                <Bar dataKey="actualRevenue" fill="#000000" radius={[6, 6, 0, 0]} maxBarSize={30} />
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
              <LegendPill colorClassName="bg-black/20" label="Target" />
              <LegendPill colorClassName="bg-black" label="Actual (Won)" />
            </div>
          </div>
          <div className="h-[260px] min-w-0 sm:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 12, right: 8, left: -20, bottom: 0 }}
              >
                <CartesianGrid stroke="#E5E5E5" strokeDasharray="4 4" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickFormatter={formatMonth}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#7A7A7A", fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis
                  width={40}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#7A7A7A", fontSize: 12 }}
                  allowDecimals={false}
                />
                <Tooltip
                  labelFormatter={(label) => formatMonth(String(label))}
                  contentStyle={{
                    borderRadius: 16,
                    border: "1px solid #E5E5E5",
                    backgroundColor: "#FFFFFF",
                  }}
                />
                <Bar dataKey="targetConversions" fill="#D4D4D4" radius={[6, 6, 0, 0]} maxBarSize={30} />
                <Bar dataKey="actualConversions" fill="#000000" radius={[6, 6, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </div>
  );
}
