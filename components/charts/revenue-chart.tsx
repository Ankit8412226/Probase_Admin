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
                  <stop offset="0%" stopColor="#000000" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#000000" stopOpacity={0.03} />
                </linearGradient>
              </defs>
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
                width={52}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#7A7A7A", fontSize: 12 }}
                tickFormatter={(value) => `₹${Math.round(value / 1000)}k`}
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
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#000000"
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
