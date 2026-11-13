"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompactMAD, formatMAD } from "@/lib/utils";

type MonthRow = { month: string; bookings: number; rentals: number; projects: number; total: number };

const SERIES = [
  { key: "bookings", name: "Réservations", color: "#ef453b" },
  { key: "rentals", name: "Benali Cars", color: "#122b43" },
  { key: "projects", name: "Projets", color: "#15483d" },
] as const;

export function RevenueChart({ data }: { data: MonthRow[] }) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            {SERIES.map((series) => (
              <linearGradient key={series.key} id={`fill-${series.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={series.color} stopOpacity={0.28} />
                <stop offset="100%" stopColor={series.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke="#122b43" strokeOpacity={0.07} vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#6b7c8c" }}
            dy={6}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: "#6b7c8c" }}
            tickFormatter={(value: number) => formatCompactMAD(value).replace(" MAD", "")}
            width={54}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 14,
              border: "1px solid rgba(18,43,67,0.08)",
              fontSize: 12,
              boxShadow: "0 12px 28px rgba(18,43,67,0.12)",
            }}
            formatter={(value, name) => [formatMAD(Number(value)), String(name)]}
          />
          {SERIES.map((series) => (
            <Area
              key={series.key}
              type="monotone"
              dataKey={series.key}
              name={series.name}
              stroke={series.color}
              strokeWidth={2}
              fill={`url(#fill-${series.key})`}
              stackId="1"
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

const COLORS = ["#ef453b", "#122b43", "#15483d", "#c9c2b4"];

export function StreamsChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="h-[188px] w-[188px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={54}
              outerRadius={82}
              paddingAngle={3}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid rgba(18,43,67,0.08)",
                fontSize: 12,
              }}
              formatter={(value) => formatMAD(Number(value))}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="w-full space-y-2.5">
        {data.map((entry, index) => (
          <li key={entry.name} className="flex items-center gap-2.5 text-[12.5px]">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ background: COLORS[index % COLORS.length] }}
            />
            <span className="text-ink/70">{entry.name}</span>
            <span className="ml-auto font-semibold text-ink">{formatMAD(entry.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
