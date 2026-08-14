import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Gate2Desk",
  description: "Facility Asset & Visitor Management System",
};

export default function DashboardPage() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Good Morning, Super Admin! 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here&apos;s an overview of your organization&apos;s facility &amp;
            asset activities.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-foreground">{currentDate}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { label: "Total Assets", value: "1,248", icon: "📦", color: "bg-purple-100 text-purple-600", trend: "+12 from last month" },
          { label: "Total Users", value: "342", icon: "👥", color: "bg-blue-100 text-blue-600", trend: "+8 from last month" },
          { label: "Open Tickets", value: "28", icon: "🎫", color: "bg-orange-100 text-orange-600", trend: "8 new today" },
          { label: "Today's Visitors", value: "16", icon: "👤", color: "bg-green-100 text-green-600", trend: "5 pending" },
          { label: "Total Departments", value: "7", icon: "🏢", color: "bg-pink-100 text-pink-600", trend: "View all departments" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl bg-card p-4 shadow-sm border border-border"
          >
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-lg ${stat.color}`}>
              {stat.icon}
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-xs text-[var(--brand-success)]">{stat.trend}</p>
          </div>
        ))}
      </div>

      {/* Content Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Asset Distribution */}
        <div className="rounded-xl bg-card p-5 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Asset Distribution</h2>
            <button className="text-xs font-medium text-[var(--brand-primary)] hover:underline">View Details</button>
          </div>
          <div className="space-y-3">
            {[
              { label: "IT Assets", percent: 62, count: 773, color: "bg-purple-500" },
              { label: "HR Assets", percent: 24, count: 299, color: "bg-blue-400" },
              { label: "Store Assets", percent: 14, count: 176, color: "bg-teal-400" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium text-foreground">{item.percent}% ({item.count})</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className={`h-2 rounded-full ${item.color}`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ticket Overview */}
        <div className="rounded-xl bg-card p-5 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Ticket Overview</h2>
            <button className="text-xs font-medium text-[var(--brand-primary)] hover:underline">View All Tickets</button>
          </div>
          <div className="space-y-2.5">
            {[
              { label: "Open", count: 12, color: "text-blue-600 bg-blue-50" },
              { label: "In Progress", count: 8, color: "text-orange-600 bg-orange-50" },
              { label: "Pending", count: 5, color: "text-yellow-600 bg-yellow-50" },
              { label: "Resolved", count: 45, color: "text-green-600 bg-green-50" },
              { label: "Critical", count: 3, color: "text-red-600 bg-red-50" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${item.color}`}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Assets Status */}
        <div className="rounded-xl bg-card p-5 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Assets Status</h2>
            <button className="text-xs font-medium text-[var(--brand-primary)] hover:underline">View Report</button>
          </div>
          <div className="space-y-2.5">
            {[
              { label: "Available", count: 262, dot: "bg-green-500" },
              { label: "Assigned", count: 986, dot: "bg-blue-500" },
              { label: "Under Repair", count: 24, dot: "bg-orange-500" },
              { label: "Out of Service", count: 11, dot: "bg-red-500" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${item.dot}`} />
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                </div>
                <span className="text-sm font-bold text-foreground">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
