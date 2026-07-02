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
import { formatMonth } from "@/lib/utils";
import type { LeadPoint } from "@/types";

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

export function LeadConversionChart({
  data,
  actions,
}: {
  data: LeadPoint[];
  actions?: React.ReactNode;
}) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <CardHeader
            eyebrow="Leads"
            title="Conversion pipeline"
            description="Converted vs lost leads over the last six months based on close date."
          />
          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            <LegendPill colorClassName="bg-emerald-500" label="Converted" />
            <LegendPill colorClassName="bg-slate-700" label="Lost" />
            {actions}
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
                width={42}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
              />
              <Tooltip
                labelFormatter={(label) => formatMonth(String(label))}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #1e293b",
                  backgroundColor: "#0e1524",
                  color: "#f8fafc",
                }}
                itemStyle={{ color: "#a5b4fc" }}
              />
              <Bar dataKey="converted" fill="#10b981" radius={[10, 10, 0, 0]} maxBarSize={34} />
              <Bar
                dataKey="nonConverted"
                fill="#334155"
                radius={[10, 10, 0, 0]}
                maxBarSize={34}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
