"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export function AssetTrendChart({ data }: { data: Record<string, string | number>[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} dx={-10} />
        <Tooltip 
          contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }}
          labelStyle={{ color: "var(--card-foreground)" }}
        />
        <Legend wrapperStyle={{ paddingTop: "10px" }} />
        <Line 
          type="monotone" 
          dataKey="Total Assets" 
          stroke="var(--brand-primary)" 
          strokeWidth={3}
          dot={{ fill: "var(--brand-primary)", strokeWidth: 0, r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line 
          type="monotone" 
          dataKey="Available" 
          stroke="var(--brand-success)" 
          strokeWidth={3}
          dot={{ fill: "var(--brand-success)", strokeWidth: 0, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function TicketStatusBarChart({ data }: { data: Record<string, string | number>[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} dx={-10} />
        <Tooltip 
          contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }}
          labelStyle={{ color: "var(--card-foreground)" }}
        />
        <Bar dataKey="count" fill="var(--brand-primary)" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DepartmentAssetsPieChart({ data, colors }: { data: Record<string, string | number>[], colors: string[] }) {
  const activeData = data.filter(d => Number(d.value) > 0);

  if (activeData.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground text-sm">
        No assets found.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={activeData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => `${name}: ${value}`}
          outerRadius={100}
          fill="var(--brand-primary)"
          dataKey="value"
        >
          {activeData.map((entry, index) => (
            <Cell key={`cell-${entry.name}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }}
          labelStyle={{ color: "var(--card-foreground)" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
