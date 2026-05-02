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
            <LegendPill colorClassName="bg-black" label="Converted" />
            <LegendPill colorClassName="bg-black/20" label="Lost" />
            {actions}
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
                width={42}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#7A7A7A", fontSize: 12 }}
              />
              <Tooltip
                labelFormatter={(label) => formatMonth(String(label))}
                contentStyle={{
                  borderRadius: 16,
                  border: "1px solid #E5E5E5",
                  backgroundColor: "#FFFFFF",
                }}
              />
              <Bar dataKey="converted" fill="#000000" radius={[10, 10, 0, 0]} maxBarSize={34} />
              <Bar
                dataKey="nonConverted"
                fill="#D4D4D4"
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
