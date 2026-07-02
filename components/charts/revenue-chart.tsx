"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardHeader } from "@/components/ui/card";
import { formatCurrency, formatMonth } from "@/lib/utils";
import type { RevenuePoint } from "@/types";

export function RevenueChart({
  data,
  actions,
}: {
  data: RevenuePoint[];
  actions?: React.ReactNode;
}) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <CardHeader
          eyebrow="Revenue"
          title="Monthly revenue trend"
          description="Rolling recurring revenue based on active client contracts."
        />
          {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </div>
        <div className="h-[260px] min-w-0 sm:h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 12, right: 12, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revenueGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.01} />
                </linearGradient>
              </defs>
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
                width={52}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                tickFormatter={(value) => `₹${Math.round(value / 1000)}k`}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                labelFormatter={(label) => formatMonth(String(label))}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #1e293b",
                  backgroundColor: "#0e1524",
                  color: "#f8fafc",
                }}
                itemStyle={{ color: "#a5b4fc" }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
