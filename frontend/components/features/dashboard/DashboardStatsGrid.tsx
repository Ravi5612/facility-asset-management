import { ReactNode } from "react";

export function DashboardStatsGrid() {
  const stats = [
    { label: "Total Assets",      value: "1,248", icon: "📦", color: "bg-brand-primary/10 text-brand-primary", line: "bg-brand-primary", trend: "+12 from last month" },
    { label: "Total Users",       value: "342",   icon: "👥", color: "bg-brand-info/10 text-brand-info",     line: "bg-brand-info",   trend: "+8 from last month" },
    { label: "Open Tickets",      value: "28",    icon: "🎫", color: "bg-brand-warning/10 text-brand-warning", line: "bg-brand-warning", trend: "8 new today" },
    { label: "Today's Visitors",  value: "16",    icon: "👤", color: "bg-brand-success/10 text-brand-success",   line: "bg-brand-success",  trend: "5 pending" },
    { label: "Total Departments", value: "7",     icon: "🏢", color: "bg-brand-danger/10 text-brand-danger",     line: "bg-brand-danger",   trend: "View all departments" },
  ];

  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="group relative rounded-xl bg-card p-5 shadow-sm border border-border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
        >
          {/* Hover bottom line */}
          <div
            className={`absolute bottom-0 left-0 h-[3px] w-0 group-hover:w-full transition-all duration-300 rounded-b-xl ${stat.line}`}
          />

          <div className={`inline-flex h-12 w-12 items-center justify-center rounded-full text-xl ${stat.color}`}>
            {stat.icon}
          </div>
          <p className="mt-5 text-3xl font-extrabold text-foreground">{stat.value}</p>
          <p className="mt-2.5 text-sm font-semibold text-muted-foreground">{stat.label}</p>
          <p className="mt-2.5 text-sm font-medium text-[var(--brand-success)]">{stat.trend}</p>
        </div>
      ))}
    </div>
  );
}
